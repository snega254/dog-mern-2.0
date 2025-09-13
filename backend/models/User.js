
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },         // Now required
  email: { type: String, required: true, unique: true },  // Explicitly required
  password: { type: String, required: true },     // Now required
  contact: String,                                // Optional
  userType: { type: String, enum: ['user', 'seller'], required: true },
});

module.exports = mongoose.model('User', userSchema);