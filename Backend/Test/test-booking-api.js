// Test Booking API Endpoint
const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('../models/Booking');
const User = require('../models/User');

const testBookingAPI = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/vehicle-rental');
    console.log('✅ Connected to MongoDB');

    // Check total bookings in database
    const totalBookings = await Booking.countDocuments();
    console.log('📊 Total bookings in database:', totalBookings);

    // List all bookings with their userIds
    const allBookings = await Booking.find({}, 'bookingId userId userName userEmail bookingStatus');
    console.log('📋 All bookings:', allBookings.map(b => ({
      bookingId: b.bookingId,
      userId: b.userId,
      userName: b.userName,
      userEmail: b.userEmail,
      status: b.bookingStatus
    })));

    // Check users in database
    const totalUsers = await User.countDocuments();
    console.log('👥 Total users in database:', totalUsers);

    // List first few users with their IDs
    const users = await User.find({}, 'name email _id').limit(5);
    console.log('👤 Sample users:', users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email
    })));

    // Test if we can find bookings for a specific user
    if (users.length > 0) {
      const testUserId = users[0]._id;
      const userBookings = await Booking.find({ userId: testUserId });
      console.log(`🔍 Bookings for user ${testUserId}:`, userBookings.length);
    }

    // Create a test booking if none exist
    if (totalBookings === 0) {
      console.log('📝 Creating test booking...');
      
      const testUserId = users.length > 0 ? users[0]._id : new mongoose.Types.ObjectId();
      
      const testBooking = new Booking({
        bookingId: 'TEST_BK' + Date.now(),
        userId: testUserId,
        userName: 'Test User',
        userEmail: 'test@example.com',
        vehicleId: new mongoose.Types.ObjectId(),
        vehicleName: 'Test Vehicle',
        pricePerDay: 3000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        startTime: '10:00',
        endTime: '18:00',
        duration: { days: 1 },
        pricing: {
          basePrice: 3000,
          serviceFee: 200,
          taxes: 400,
          totalAmount: 3600
        },
        billingAddress: {
          address: 'Test Address',
          city: 'Kathmandu',
          zipCode: '44600'
        },
        paymentMethod: 'esewa',
        bookingStatus: 'confirmed'
      });

      await testBooking.save();
      console.log('✅ Test booking created with ID:', testBooking.bookingId);
    }

    console.log('\n🎉 Booking API test completed!');
    
  } catch (error) {
    console.error('❌ Booking API test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the test
testBookingAPI();
