const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get all bookings (Admin only)
router.get('/admin/all', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicleId', 'name model type location images')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// Get booking by ID
router.get('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('vehicleId', 'name model type location images')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

// Get bookings by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['confirmed', 'pending', 'cancelled', 'completed', 'in-progress'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status'
      });
    }

    const bookings = await Booking.find({ bookingStatus: status })
      .populate('vehicleId', 'name model type location images')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// Update booking status (Admin only)
router.patch('/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['confirmed', 'pending', 'cancelled', 'completed', 'in-progress'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status'
      });
    }

    const booking = await Booking.findOne({ bookingId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.bookingStatus = status;
    if (notes) {
      booking.specialRequirements = notes;
    }
    
    if (status === 'cancelled') {
      booking.metadata.cancellationDate = new Date();
      if (notes) {
        booking.metadata.cancellationReason = notes;
      }
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
});

// Get booking statistics for dashboard
router.get('/admin/statistics', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ bookingStatus: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ bookingStatus: 'completed' });
    
    // Revenue calculation (from completed and confirmed bookings)
    const revenueData = await Booking.aggregate([
      { 
        $match: { 
          bookingStatus: { $in: ['completed', 'confirmed'] },
          paymentStatus: 'completed'
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$pricing.totalAmount' } 
        } 
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Recent bookings (last 10)
    const recentBookings = await Booking.find()
      .populate('vehicleId', 'name model type')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        completedBookings,
        totalRevenue,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Error fetching booking statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics',
      error: error.message
    });
  }
});

// Get bookings for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching bookings for userId:', userId); // Debug log
    
    const bookings = await Booking.find({ userId })
      .populate('vehicleId', 'name model type location images price')
      .sort({ createdAt: -1 });

    console.log('Found bookings count:', bookings.length); // Debug log

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user bookings',
      error: error.message
    });
  }
});

// Get bookings by user email (for non-registered users)
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const bookings = await Booking.find({ userEmail: email.toLowerCase() })
      .populate('vehicleId', 'name model type location images price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings by email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// Delete booking (Admin only - use with caution)
router.delete('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOneAndDelete({ bookingId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
});

// Create booking from transaction data
router.post('/create-from-transaction', async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    // Find the transaction
    const transaction = await Transaction.findOne({ uuid: transactionId })
      .populate('vehicleData.vehicleId')
      .populate('userId');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Transaction must be completed to create booking'
      });
    }

    // Check if booking already exists for this transaction
    const existingBooking = await Booking.findOne({ transactionId: transaction.uuid });
    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Booking already exists for this transaction',
        data: existingBooking
      });
    }

    // Create booking from transaction data
    const bookingData = {
      // User information
      userId: transaction.userId,
      userName: transaction.userInfo.name,
      userEmail: transaction.userInfo.email || transaction.userEmail,
      userPhone: transaction.userInfo.phone,

      // Vehicle information
      vehicleId: transaction.vehicleData.vehicleId._id,
      vehicleName: transaction.vehicleData.name,
      vehicleModel: transaction.vehicleData.model,
      vehicleType: transaction.vehicleData.type,
      vehicleLocation: transaction.vehicleData.location,
      vehicleImage: transaction.vehicleData.image,
      pricePerDay: transaction.vehicleData.price,

      // Booking period
      startDate: new Date(transaction.bookingData.startDate),
      endDate: new Date(transaction.bookingData.endDate),
      startTime: transaction.bookingData.startTime,
      endTime: transaction.bookingData.endTime,

      // Pricing details
      pricing: {
        basePrice: transaction.amount * 0.85, // Assuming 85% is base price
        serviceFee: transaction.amount * 0.10, // 10% service fee
        taxes: transaction.amount * 0.05, // 5% taxes
        totalAmount: transaction.amount
      },

      // Billing information
      billingAddress: transaction.billingAddress,

      // Payment information
      paymentMethod: transaction.paymentMethod,
      paymentStatus: 'completed',
      transactionId: transaction.uuid,
      esewaTransactionCode: transaction.transactionCode,
      paymentDate: transaction.completedAt,

      // Booking status
      bookingStatus: 'confirmed'
    };

    const booking = new Booking(bookingData);
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully from transaction',
      data: booking
    });

  } catch (error) {
    console.error('Error creating booking from transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking from transaction',
      error: error.message
    });
  }
});

// Submit cancellation request (User can request, admin approves)
router.post('/:bookingId/cancel-request', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason, requestedAt } = req.body;
    
    const booking = await Booking.findOne({ bookingId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (!['confirmed', 'pending', 'in-progress'].includes(booking.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be cancelled'
      });
    }

    // Check if there's already a pending cancel request
    if (booking.cancelRequest && booking.cancelRequest.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'A cancellation request is already pending for this booking'
      });
    }

    // Add cancel request to booking
    booking.cancelRequest = {
      status: 'pending',
      reason: reason || 'No reason provided',
      requestedAt: requestedAt || new Date(),
      requestedBy: req.user ? req.user.userId : booking.userId
    };

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Cancellation request submitted successfully',
      data: {
        bookingId: booking.bookingId,
        cancelRequest: booking.cancelRequest
      }
    });
  } catch (error) {
    console.error('Error submitting cancellation request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit cancellation request',
      error: error.message
    });
  }
});

// Get all pending cancellation requests (Admin only)
router.get('/admin/cancel-requests', async (req, res) => {
  try {
    const bookingsWithCancelRequests = await Booking.find({
      'cancelRequest.status': 'pending'
    })
    .populate('vehicleId', 'name model type location images')
    .populate('userId', 'name email phone')
    .sort({ 'cancelRequest.requestedAt': -1 });

    res.status(200).json({
      success: true,
      count: bookingsWithCancelRequests.length,
      data: bookingsWithCancelRequests
    });
  } catch (error) {
    console.error('Error fetching cancel requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cancel requests',
      error: error.message
    });
  }
});

// Approve or reject cancellation request (Admin only)
router.patch('/:bookingId/cancel-request/:action', async (req, res) => {
  try {
    const { bookingId, action } = req.params;
    const { adminNotes } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"'
      });
    }

    const booking = await Booking.findOne({ bookingId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking.cancelRequest || booking.cancelRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'No pending cancellation request found for this booking'
      });
    }

    if (action === 'approve') {
      // Approve cancellation - change booking status to cancelled
      booking.bookingStatus = 'cancelled';
      booking.cancelRequest.status = 'approved';
      booking.cancelRequest.approvedAt = new Date();
      booking.cancelRequest.adminNotes = adminNotes;
      booking.metadata = booking.metadata || {};
      booking.metadata.cancellationDate = new Date();
      booking.metadata.cancellationReason = booking.cancelRequest.reason;
      booking.metadata.approvedBy = req.user ? req.user.userId : 'admin';
    } else {
      // Reject cancellation - keep original status
      booking.cancelRequest.status = 'rejected';
      booking.cancelRequest.rejectedAt = new Date();
      booking.cancelRequest.adminNotes = adminNotes;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Cancellation request ${action}d successfully`,
      data: {
        bookingId: booking.bookingId,
        bookingStatus: booking.bookingStatus,
        cancelRequest: booking.cancelRequest
      }
    });
  } catch (error) {
    console.error('Error processing cancellation request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process cancellation request',
      error: error.message
    });
  }
});

module.exports = router;
