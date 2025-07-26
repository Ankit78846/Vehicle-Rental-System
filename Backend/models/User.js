const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() {
      return !this.isGoogleUser;
    },
  },
  googleId: {
    type: String,
    sparse: true, // Allows multiple null values
  },
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
  imgUrl: {
    type: String,
    
  },
  phone: {
    type: String,
    default: null,
  },
  licenseFront: {
    type: String,
    default: null,
  },
  licenseBack: {
    type: String,
    default: null,
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  }],
  role: {
    type: String,
    enum: ['user', 'host', 'admin'],
    default: 'user'
  },
  isHost: {
    type: Boolean,
    default: false
  },
  hostSince: {
    type: Date,
    default: null
  },
  vehiclesOwned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  verifiedBy: {
    type: String,
    default: null,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Note: Indexes for email and googleId are automatically created due to unique: true
// in the schema definition, so no need for explicit index creation

module.exports = mongoose.model('User', userSchema);