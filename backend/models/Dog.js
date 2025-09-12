const mongoose = require('mongoose');

const dogSchema = new mongoose.Schema({
  dogId: { type: String, required: true, unique: true }, // UUID from frontend
  breed: { type: String, required: true },
  age: { type: String, required: true }, // storing as string to match frontend options like '1 month', '2 years'
  gender: { type: String, required: true },
  dogType: { type: String, required: true }, // Home Dog / Street Dog
  healthStatus: { type: String, required: true },
  vaccinated: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  behavior: { type: String, required: true },
  image: { type: String }, // path to uploaded image
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Dog', dogSchema);
