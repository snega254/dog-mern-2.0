const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  dogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dog' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
});

module.exports = mongoose.model('Order', orderSchema);