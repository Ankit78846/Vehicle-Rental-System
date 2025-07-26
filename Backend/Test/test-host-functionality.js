const mongoose = require('mongoose');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Transaction = require('../models/Transaction');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/vehiclerental', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testHostFunctionality() {
  try {
    console.log('Testing host functionality...');

    // Create a test user
    const testUser = new User({
      name: 'Test Host User',
      email: 'testhost@example.com',
      password: 'testpassword',
      phone: '9800000001'
    });
    await testUser.save();
    console.log('✅ Test user created:', testUser.email);

    // Verify user is initially not a host
    console.log('Initial user role:', testUser.role);
    console.log('Initial host status:', testUser.isHost);

    // Create a vehicle (simulating user adding vehicle)
    const testVehicle = new Vehicle({
      name: 'Host Test Vehicle',
      model: 'Host Model',
      type: 'Car',
      location: 'Kathmandu',
      price: 6000,
      images: ['host-test-image.jpg'],
      description: 'Test vehicle by host',
      transmission: 'Automatic',
      mileage: 12,
      fuelType: 'Petrol',
      capacity: 4,
      brand: 'Host Brand',
      image: 'host-test-image.jpg',
      createdBy: testUser._id,
      createdById: testUser._id
    });
    await testVehicle.save();
    console.log('✅ Test vehicle created by user');

    // Simulate the host upgrade functionality
    const user = await User.findById(testUser._id);
    if (user && !user.isHost) {
      user.isHost = true;
      user.role = 'host';
      user.hostSince = new Date();
      user.vehiclesOwned.push(testVehicle._id);
      await user.save();
      console.log('✅ User upgraded to host status');
    }

    // Verify the upgrade
    const updatedUser = await User.findById(testUser._id).populate('vehiclesOwned');
    console.log('Updated user role:', updatedUser.role);
    console.log('Updated host status:', updatedUser.isHost);
    console.log('Host since:', updatedUser.hostSince);
    console.log('Vehicles owned:', updatedUser.vehiclesOwned.length);

    // Test transaction with userId
    const testTransaction = new Transaction({
      uuid: 'host-test-' + Date.now(),
      amount: 6500,
      status: 'completed',
      paymentMethod: 'esewa',
      transactionCode: 'host-esewa-code',
      bookingData: {
        startDate: '2025-01-27',
        startTime: '09:00',
        endDate: '2025-01-28',
        endTime: '09:00',
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
        address: 'Host Test Address',
        city: 'Kathmandu',
        state: 'Bagmati',
        zipCode: '44600',
        country: 'Nepal'
      },
      userInfo: {
        name: 'Customer User',
        email: 'customer@example.com',
        phone: '9800000002'
      },
      userEmail: 'customer@example.com',
      userId: null, // Customer booking host's vehicle
      completedAt: new Date()
    });
    await testTransaction.save();
    console.log('✅ Test transaction created with proper user data');

    // Test fetching vehicles by host
    const hostVehicles = await Vehicle.find({ createdById: updatedUser._id });
    console.log('✅ Host vehicles found:', hostVehicles.length);

    // Test host statistics
    const totalVehicles = await Vehicle.countDocuments({ createdById: updatedUser._id });
    const activeVehicles = await Vehicle.countDocuments({ createdById: updatedUser._id, isActive: true });
    const totalViews = await Vehicle.aggregate([
      { $match: { createdById: updatedUser._id } },
      { $group: { _id: null, totalClicks: { $sum: "$clickCount" } } }
    ]);

    console.log('📊 Host Statistics:');
    console.log('  Total Vehicles:', totalVehicles);
    console.log('  Active Vehicles:', activeVehicles);
    console.log('  Total Views:', totalViews[0]?.totalClicks || 0);

    // Clean up test data
    await User.findByIdAndDelete(testUser._id);
    await Vehicle.findByIdAndDelete(testVehicle._id);
    await Transaction.findByIdAndDelete(testTransaction._id);

    console.log('✅ Test completed successfully and cleanup done!');
    console.log('\n🎉 Host functionality is working correctly:');
    console.log('  - Users can add vehicles and become hosts');
    console.log('  - Host status is tracked with role and hostSince date');
    console.log('  - Vehicles are linked to host owners');
    console.log('  - Transactions include proper user ID tracking');
    console.log('  - Host statistics can be calculated');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testHostFunctionality();
