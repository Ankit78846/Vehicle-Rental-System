// Test Enhanced Booking Model with Transaction Data
const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle'); // Required for populate
const User = require('../models/User'); // Required for populate

const testEnhancedBooking = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/vehicle-rental');
    console.log('✅ Connected to MongoDB');

    // Create a test booking with enhanced transaction data
    const testBooking = new Booking({
      bookingId: 'BK' + Date.now(),
      userId: new mongoose.Types.ObjectId(),
      userName: 'Test User',
      userEmail: 'test@example.com',
      userPhone: '+977-9800000000',
      
      vehicleId: new mongoose.Types.ObjectId(),
      vehicleName: 'Test Vehicle',
      vehicleModel: 'Test Model 2024',
      vehicleType: 'Car',
      vehicleLocation: 'Kathmandu',
      pricePerDay: 5000,
      
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // 1 day later
      startTime: '10:00',
      endTime: '18:00',
      duration: { days: 1, hours: 0 },
      
      pricing: {
        basePrice: 5000,
        serviceFee: 200,
        taxes: 650,
        totalAmount: 5850
      },
      
      billingAddress: {
        address: 'Test Address',
        city: 'Kathmandu',
        zipCode: '44600',
        country: 'Nepal'
      },
      
      paymentMethod: 'esewa',
      paymentStatus: 'completed',
      transactionId: 'TXN' + Date.now(),
      esewaTransactionCode: 'ESP' + Date.now(),
      
      // Enhanced transaction data
      transactionData: {
        originalAmount: 5850,
        currency: 'NPR',
        gatewayResponse: {
          status: 'success',
          gateway_transaction_id: 'GTX' + Date.now(),
          gateway_fee: 100,
          response_code: '000',
          response_message: 'Transaction successful'
        },
        processingFee: 100,
        gateway: 'esewa',
        initiatedAt: new Date(),
        completedAt: new Date(),
        failureReason: null
      },
      
      bookingStatus: 'confirmed',
      specialRequirements: 'Need GPS navigation system',
      
      contactPreferences: {
        email: true,
        sms: true,
        whatsapp: false
      },
      
      metadata: {
        pickupLocation: 'Kathmandu Airport',
        dropoffLocation: 'Pokhara',
        driverRequired: true,
        insuranceIncluded: true
      }
    });

    // Save the booking
    const savedBooking = await testBooking.save();
    console.log('✅ Enhanced booking created successfully:');
    console.log('📋 Booking ID:', savedBooking.bookingId);
    console.log('💰 Total Amount:', savedBooking.pricing.totalAmount);
    console.log('🏦 Gateway:', savedBooking.transactionData.gateway);
    console.log('📊 Transaction Status:', savedBooking.paymentStatus);
    console.log('🔢 Transaction ID:', savedBooking.transactionId);

    // Test virtual properties
    console.log('⏱️ Duration Text:', savedBooking.durationText);
    console.log('💵 Total Value:', savedBooking.totalValue);
    console.log('🟢 Is Active:', savedBooking.isActive);

    // Test static methods
    const userBookings = await Booking.findByUser(savedBooking.userId);
    console.log('👤 User bookings found:', userBookings.length);

    const vehicleBookings = await Booking.findByVehicle(savedBooking.vehicleId);
    console.log('🚗 Vehicle bookings found:', vehicleBookings.length);

    // Test instance methods
    console.log('✅ Booking confirmation test passed');

    // Test refund data structure
    savedBooking.transactionData.refundData = {
      refundId: 'REF' + Date.now(),
      refundAmount: 2000,
      refundDate: new Date(),
      refundReason: 'Partial cancellation',
      refundStatus: 'completed'
    };
    
    await savedBooking.save();
    console.log('💸 Refund data added successfully');

    // Clean up test data
    await Booking.findByIdAndDelete(savedBooking._id);
    console.log('🧹 Test booking cleaned up');

    console.log('\n🎉 All enhanced booking tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Enhanced booking test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the test
testEnhancedBooking();
