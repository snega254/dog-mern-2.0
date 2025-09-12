const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  contact: String,
  userType: { type: String, enum: ['user', 'seller'], required: true },
});

module.exports = mongoose.model('User', userSchema);