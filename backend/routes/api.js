const express = require('express');
const router = express.Router();
const Dog = require('../models/Dog');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ===== Seed default dogs =====
router.get('/seed', async (req, res) => {
  try {
    const count = await Dog.countDocuments();
    if (count === 0) {
      const defaults = [
        { breed: 'Labrador', age: '2 years', gender: 'Male', dogType: 'Home Dog', healthStatus: 'Healthy', vaccinated: 'Yes', size: 'Large', color: 'Yellow', behavior: 'Friendly', sellerId: null },
        { breed: 'Beagle', age: '3 years', gender: 'Female', dogType: 'Home Dog', healthStatus: 'Healthy', vaccinated: 'Yes', size: 'Medium', color: 'Brown', behavior: 'Calm', sellerId: null },
      ];
      await Dog.insertMany(defaults);
      console.log('Default dogs seeded');
    }
    res.json({ message: 'Seeding complete' });
  } catch (err) {
    res.status(500).json({ message: 'Seeding failed', error: err.message });
  }
});

// ===== Get all dogs =====
router.get('/dogs', async (req, res) => {
  const dogs = await Dog.find();
  const dogsWithUrl = dogs.map(dog => {
  const imagePath = req.file ? req.file.filename : '';

    return {
      ...dog.toObject(),
      image: imagePath ? `http://localhost:5000/${imagePath}` : '',
    };
  });
  res.json(dogsWithUrl);
});


// ... (previous code remains the same)

router.get('/dogs/:id', async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog) return res.status(404).json({ message: 'Dog not found' });
    res.json(dog);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dog', error: err.message });
  }
});

// ... (rest of the code)
// ===== Add dog for sale (seller only) =====
router.post('/dogs/sell', upload.single('image'), async (req, res) => {
  console.log('Uploaded file:', req.file);
  try {
    const { dogId, breed, age, gender, dogType, healthStatus, vaccinated, size, color, behavior } = req.body;
    const sellerId = req.user.id;

    // Fix the path
    const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : '';


    const dog = new Dog({
      dogId,
      breed,
      age,
      gender,
      dogType,
      healthStatus,
      vaccinated,
      size,
      color,
      behavior,
      image: imagePath,
      sellerId,
    });

    await dog.save();
    res.json({ success: true, dogId: dog.dogId });
  } catch (err) {
    console.error('Error adding dog:', err);
    res.status(500).json({ message: 'Failed to add dog', error: err.message });
  }
});

// ===== Get orders (seller only) =====
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('dogId').populate('userId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// ===== Create order (user adopt) =====
router.post('/orders', async (req, res) => {
  try {
    const { dogId } = req.body;
    const order = new Order({ dogId, userId: req.user.id });
    await order.save();
    res.json({ success: true, orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});

// ===== Update order status =====
router.put('/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
});

// ===== Delete order =====
router.delete('/orders/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
});

module.exports = router;