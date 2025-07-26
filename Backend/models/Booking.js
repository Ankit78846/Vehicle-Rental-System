const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Booking identification
  bookingId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional if user is not logged in
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  userPhone: {
    type: String,
    required: false,
    trim: true
  },
  
  // Vehicle information
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  vehicleName: {
    type: String,
    required: true
  },
  vehicleModel: {
    type: String,
    required: false
  },
  vehicleType: {
    type: String,
    required: false
  },
  vehicleLocation: {
    type: String,
    required: false
  },
  vehicleImage: {
    type: String,
    required: false
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  
  // Booking period
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    days: {
      type: Number,
      required: true,
      min: 1
    },
    hours: {
      type: Number,
      default: 0
    }
  },
  
  // Pricing details
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    serviceFee: {
      type: Number,
      default: 200
    },
    taxes: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  
  // Billing information
  billingAddress: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: false
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'Nepal'
    }
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['esewa', 'card', 'paypal', 'apple', 'google', 'cash'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    required: false
  },
  esewaTransactionCode: {
    type: String,
    required: false
  },
  esewaRefId: {
    type: String,
    required: false
  },
  paymentDate: {
    type: Date,
    required: false
  },
  
  // Enhanced transaction data storage
  transactionData: {
    // Original transaction amount and currency
    originalAmount: {
      type: Number,
      required: false
    },
    currency: {
      type: String,
      default: 'NPR'
    },
    
    // Gateway specific data
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    },
    
    // Processing details
    processingFee: {
      type: Number,
      default: 0
    },
    
    // Payment gateway information
    gateway: {
      type: String,
      enum: ['esewa', 'stripe', 'paypal', 'razorpay', 'khalti'],
      required: false
    },
    
    // Transaction timestamps
    initiatedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      required: false
    },
    
    // Failure information
    failureReason: {
      type: String,
      required: false
    },
    
    // Refund information
    refundData: {
      refundId: String,
      refundAmount: Number,
      refundDate: Date,
      refundReason: String,
      refundStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
      }
    }
  },
  
  // Booking status
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed', 'in-progress'],
    default: 'pending'
  },
  
  // Special requirements or notes
  specialRequirements: {
    type: String,
    required: false,
    maxlength: 500
  },
  
  // Contact preferences
  contactPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    whatsapp: {
      type: Boolean,
      default: false
    }
  },
  
  // Additional metadata
  metadata: {
    pickupLocation: {
      type: String,
      required: false
    },
    dropoffLocation: {
      type: String,
      required: false
    },
    driverRequired: {
      type: Boolean,
      default: false
    },
    insuranceIncluded: {
      type: Boolean,
      default: true
    },
    cancellationDate: {
      type: Date,
      required: false
    },
    cancellationReason: {
      type: String,
      required: false
    },
    approvedBy: {
      type: String,
      required: false
    }
  },

  // Cancel request information
  cancelRequest: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      required: false
    },
    reason: {
      type: String,
      required: false
    },
    requestedAt: {
      type: Date,
      required: false
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    approvedAt: {
      type: Date,
      required: false
    },
    rejectedAt: {
      type: Date,
      required: false
    },
    adminNotes: {
      type: String,
      required: false
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ userId: 1 });
bookingSchema.index({ vehicleId: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ createdAt: -1 });
// Note: bookingId index is automatically created due to unique: true in schema definition

// Virtual for booking duration in a readable format
bookingSchema.virtual('durationText').get(function() {
  const days = this.duration.days;
  const hours = this.duration.hours;
  
  if (days > 0 && hours > 0) {
    return `${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
});

// Virtual for total booking value
bookingSchema.virtual('totalValue').get(function() {
  return this.pricing.totalAmount;
});

// Virtual to check if booking is active
bookingSchema.virtual('isActive').get(function() {
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  
  return now >= start && now <= end && this.bookingStatus === 'confirmed';
});

// Pre-save middleware to calculate duration
bookingSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    this.duration.days = diffDays;
  }
  next();
});

// Static method to find bookings by user
bookingSchema.statics.findByUser = function(userId) {
  return this.find({ userId: userId }).populate('vehicleId').sort({ createdAt: -1 });
};

// Static method to find bookings by vehicle
bookingSchema.statics.findByVehicle = function(vehicleId) {
  return this.find({ vehicleId: vehicleId }).populate('userId').sort({ startDate: 1 });
};

// Static method to find active bookings
bookingSchema.statics.findActiveBookings = function() {
  const now = new Date();
  return this.find({
    startDate: { $lte: now },
    endDate: { $gte: now },
    bookingStatus: 'confirmed'
  });
};

// Instance method to mark as confirmed
bookingSchema.methods.confirmBooking = function() {
  this.bookingStatus = 'confirmed';
  this.paymentStatus = 'completed';
  return this.save();
};

// Instance method to cancel booking
bookingSchema.methods.cancelBooking = function(reason) {
  this.bookingStatus = 'cancelled';
  this.metadata.cancellationReason = reason;
  this.metadata.cancellationDate = new Date();
  return this.save();
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
