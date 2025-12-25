const mongoose = require('mongoose');
const crypto = require('crypto');

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  relation: String,
  trackingToken: { 
    type: String, 
    required: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    timestamp: Date
  },
  status: { type: String, enum: ['inside', 'outside', 'unknown'], default: 'unknown' },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Member', memberSchema);