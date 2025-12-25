const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  memberName: { type: String, required: true },
  type: { type: String, enum: ['entered', 'exited'], required: true },
  location: { lat: Number, lng: Number },
  timestamp: { type: Date, default: Date.now },
  emailSent: { type: Boolean, default: false }
});

module.exports = mongoose.model('Alert', alertSchema);