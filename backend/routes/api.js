const express = require('express');
const router = express.Router();
const Dog = require('../models/Dog');
const Order = require('../models/Order');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only JPEG/PNG images are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Seed default dogs
router.get('/seed', async (req, res) => {
  try {
    const count = await Dog.countDocuments();
    if (count === 0) {
      let defaultSeller = await User.findOne({ userType: 'seller' });
      if (!defaultSeller) {
        defaultSeller = await User.create({
          name: 'Default Seller',
          email: 'default@seller.com',
          password: await require('bcryptjs').hash('default123', 10),
          contact: '1234567890',
          userType: 'seller',
        });
      }
      const defaults = [
        { breed: 'Labrador', age: '2 years', gender: 'Male', dogType: 'Home Dog', healthStatus: 'Healthy', vaccinated: 'Yes', size: 'Large', color: 'Yellow', behavior: 'Friendly', sellerId: defaultSeller._id },
        { breed: 'Beagle', age: '3 years', gender: 'Female', dogType: 'Home Dog', healthStatus: 'Healthy', vaccinated: 'Yes', size: 'Medium', color: 'Brown', behavior: 'Calm', sellerId: defaultSeller._id },
      ];
      await Dog.insertMany(defaults);
      console.log('Default dogs seeded');
    }
    res.json({ message: 'Seeding complete' });
  } catch (err) {
    console.error('Seeding error:', err);
    res.status(500).json({ message: 'Seeding failed', error: err.message });
  }
});

// Get all dogs with sold status
router.get('/dogs', async (req, res) => {
  try {
    const dogs = await Dog.find();
    const dogsWithUrl = await Promise.all(dogs.map(async (dog) => {
      const isSold = await Order.findOne({ dogId: dog._id, status: 'sold' });
      return {
        ...dog.toObject(),
        image: dog.image ? `http://localhost:5000/${dog.image}` : 'http://localhost:5000/uploads/placeholder-image.jpg',
        isSold: !!isSold,
      };
    }));
    res.json(dogsWithUrl);
  } catch (err) {
    console.error('Error fetching dogs:', err);
    res.status(500).json({ message: 'Failed to fetch dogs', error: err.message });
  }
});

// Get dog by ID with sold status
router.get('/dogs/:id', async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog) return res.status(404).json({ message: 'Dog not found' });
    const isSold = await Order.findOne({ dogId: dog._id, status: 'sold' });
    res.json({
      ...dog.toObject(),
      image: dog.image ? `http://localhost:5000/${dog.image}` : 'http://localhost:5000/uploads/placeholder-image.jpg',
      isSold: !!isSold,
    });
  } catch (err) {
    console.error('Error fetching dog:', err);
    res.status(500).json({ message: 'Failed to fetch dog', error: err.message });
  }
});

// Add dog for sale (seller only)
router.post('/dogs/sell', upload.single('image'), async (req, res) => {
  console.log('Uploaded file:', req.file);
  try {
    const { dogId, breed, age, gender, dogType, healthStatus, vaccinated, size, color, behavior } = req.body;
    const sellerId = req.user.id;
    const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : '';

    const dog = new Dog({ dogId, breed, age, gender, dogType, healthStatus, vaccinated, size, color, behavior, image: imagePath, sellerId });
    await dog.save();
    res.json({ success: true, dogId: dog.dogId });
  } catch (err) {
    console.error('Error adding dog:', err);
    res.status(500).json({ message: 'Failed to add dog', error: err.message });
  }
});

// Get orders (seller only) with user details
router.get('/orders', async (req, res) => {
  try {
    if (req.user.userType !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can access orders' });
    }
    const orders = await Order.find()
      .populate({
        path: 'dogId',
        match: { sellerId: req.user.id },
        select: 'dogId breed image',
      })
      .populate('userId', 'name email contact') // Include contact for communication
      .lean();
    const filteredOrders = orders.filter(order => order.dogId !== null);
    res.json(filteredOrders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// Create order (user adopt) with sold check
router.post('/orders', async (req, res) => {
  try {
    const { dogId } = req.body;
    const existingOrder = await Order.findOne({ dogId });
    if (existingOrder && existingOrder.status === 'sold') {
      return res.status(400).json({ message: 'This dog has already been sold' });
    }
    if (existingOrder) {
      return res.status(400).json({ message: 'This dog is already reserved or adopted' });
    }
    const order = new Order({ dogId, userId: req.user.id, status: 'pending' });
    await order.save();
    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});

// Update order status with real-time emit
router.put('/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('dogId');
    if (!order || !order.dogId) {
      return res.status(404).json({ message: 'Order or dog not found' });
    }
    if (order.dogId.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update orders for your dogs' });
    }
    await Order.findByIdAndUpdate(req.params.id, { status });
    req.io.emit('orderUpdated', { orderId: req.params.id, status, dogId: order.dogId._id });
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
});

// Delete order with real-time emit
router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('dogId');
    if (!order || !order.dogId) {
      return res.status(404).json({ message: 'Order or dog not found' });
    }
    if (order.dogId.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete orders for your dogs' });
    }
    await Order.findByIdAndDelete(req.params.id);
    req.io.emit('orderDeleted', { orderId: req.params.id, dogId: order.dogId._id });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
});

module.exports = router;