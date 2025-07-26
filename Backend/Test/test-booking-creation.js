const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/vehiclerental', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testBookingCreation() {
  try {
    console.log('Testing booking creation from transaction...');

    // Create a test user
    const testUser = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '9800000000',
      password: 'testpassword'
    });
    await testUser.save();

    // Create a test vehicle
    const testVehicle = new Vehicle({
      name: 'Test Vehicle',
      model: 'Test Model',
      type: 'Car',
      location: 'Kathmandu',
      price: 5000,
      images: ['test-image.jpg'],
      description: 'Test vehicle description',
      transmission: 'Manual',
      mileage: 15,
      fuelType: 'Petrol',
      capacity: 5,
      brand: 'Test Brand',
      image: 'test-image.jpg',
      createdBy: testUser._id
    });
    await testVehicle.save();

    // Create a test transaction
    const testTransaction = new Transaction({
      uuid: 'test-' + Date.now(),
      amount: 5500,
      status: 'completed',
      paymentMethod: 'esewa',
      transactionCode: 'esewa-test-code',
      bookingData: {
        startDate: '2025-01-26',
        startTime: '10:00',
        endDate: '2025-01-27',
        endTime: '10:00',
        location: 'Kathmandu'
      },
      vehicleData: {
        id: testVehicle._id.toString(),
        vehicleId: testVehicle._id,
        name: testVehicle.name,
        price: testVehicle.price,
        image: testVehicle.image,
        model: testVehicle.model,
        type: testVehicle.type,
        location: testVehicle.location
      },
      billingAddress: {
        address: 'Test Address',
        city: 'Kathmandu',
        state: 'Bagmati',
        zipCode: '44600',
        country: 'Nepal'
      },
      userInfo: {
        name: testUser.name,
        email: testUser.email,
        phone: testUser.phone
      },
      userEmail: testUser.email,
      userId: testUser._id,
      completedAt: new Date()
    });
    await testTransaction.save();

    console.log('Test transaction created:', testTransaction.uuid);

    // Test booking creation
    const bookingData = {
      // User information
      userId: testTransaction.userId,
      userName: testTransaction.userInfo.name,
      userEmail: testTransaction.userInfo.email,
      userPhone: testTransaction.userInfo.phone,

      // Vehicle information
      vehicleId: testTransaction.vehicleData.vehicleId,
      vehicleName: testTransaction.vehicleData.name,
      vehicleModel: testTransaction.vehicleData.model,
      vehicleType: testTransaction.vehicleData.type,
      vehicleLocation: testTransaction.vehicleData.location,
      vehicleImage: testTransaction.vehicleData.image,
      pricePerDay: testTransaction.vehicleData.price,

      // Booking period
      startDate: new Date(testTransaction.bookingData.startDate),
      endDate: new Date(testTransaction.bookingData.endDate),
      startTime: testTransaction.bookingData.startTime,
      endTime: testTransaction.bookingData.endTime,

      // Pricing details
      pricing: {
        basePrice: testTransaction.amount * 0.85,
        serviceFee: testTransaction.amount * 0.10,
        taxes: testTransaction.amount * 0.05,
        totalAmount: testTransaction.amount
      },

      // Billing information
      billingAddress: testTransaction.billingAddress,

      // Payment information
      paymentMethod: testTransaction.paymentMethod,
      paymentStatus: 'completed',
      transactionId: testTransaction.uuid,
      esewaTransactionCode: testTransaction.transactionCode,
      paymentDate: testTransaction.completedAt,

      // Booking status
      bookingStatus: 'confirmed'
    };

    const booking = new Booking(bookingData);
    await booking.save();

    console.log('✅ Booking created successfully!');
    console.log('Booking ID:', booking.bookingId);
    console.log('Vehicle:', booking.vehicleName);
    console.log('User:', booking.userName);
    console.log('Total Amount:', booking.pricing.totalAmount);

    // Clean up test data
    await Booking.findByIdAndDelete(booking._id);
    await Transaction.findByIdAndDelete(testTransaction._id);
    await Vehicle.findByIdAndDelete(testVehicle._id);
    await User.findByIdAndDelete(testUser._id);

    console.log('✅ Test completed successfully and cleanup done!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testBookingCreation();
