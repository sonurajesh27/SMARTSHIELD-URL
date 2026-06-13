const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  qrCode: {
    type: String, // Base64 data URL for the QR code
    required: true
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  expiresAt: {
    type: Date
  },
  clicks: {
    type: Number,
    default: 0
  },
  scamStatus: {
    safe: {
      type: Boolean,
      default: true
    },
    riskScore: {
      type: Number,
      default: 0
    },
    reason: {
      type: String,
      default: ''
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Url = mongoose.model('Url', urlSchema);
module.exports = Url;
