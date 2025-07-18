const mongoose = require('mongoose');
require('dotenv').config();

// Import Vehicle model
const Vehicle = require('./models/Vehicle');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle-rental', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


mongoose.connection.on('connected', async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Find vehicles missing the new specification fields
    const vehiclesToUpdate = await Vehicle.find({
      $or: [
        { seats: { $exists: false } },
        { fuelType: { $exists: false } },
        { mileage: { $exists: false } },
        { transmission: { $exists: false } }
      ]
    });

    console.log(`\n📊 Found ${vehiclesToUpdate.length} vehicles that need specification updates`);

    if (vehiclesToUpdate.length === 0) {
      console.log('✅ All vehicles already have complete specification data!');
      mongoose.connection.close();
      return;
    }

    // Update each vehicle with appropriate default values based on type
    for (const vehicle of vehiclesToUpdate) {
      const updateData = {};

      // Set default values based on vehicle type
      if (!vehicle.seats) {
        if (vehicle.type === 'two-wheeler') {
          updateData.seats = 2;
        } else if (vehicle.type === 'car') {
          updateData.seats = 5;
        } else if (vehicle.type === 'truck' || vehicle.type === 'pickup') {
          updateData.seats = 3;
        } else if (vehicle.type === 'bus') {
          updateData.seats = 25;
        } else {
          updateData.seats = 5; // default
        }
      }

      if (!vehicle.fuelType) {
        updateData.fuelType = 'Gas'; // Default to Gas
      }

      if (!vehicle.mileage) {
        if (vehicle.type === 'two-wheeler') {
          updateData.mileage = 45; // Good mileage for motorcycles
        } else if (vehicle.type === 'car') {
          updateData.mileage = 25; // Average car mileage
        } else if (vehicle.type === 'truck') {
          updateData.mileage = 8; // Lower mileage for trucks
        } else if (vehicle.type === 'pickup') {
          updateData.mileage = 15; // Pickup truck mileage
        } else if (vehicle.type === 'bus') {
          updateData.mileage = 6; // Bus mileage
        } else {
          updateData.mileage = 20; // default
        }
      }

      if (!vehicle.transmission) {
        if (vehicle.type === 'two-wheeler') {
          updateData.transmission = 'Manual'; // Most motorcycles are manual
        } else {
          updateData.transmission = 'Automatic'; // Cars default to automatic
        }
      }

      // Update the vehicle
      await Vehicle.findByIdAndUpdate(vehicle._id, updateData);
      
      console.log(`✅ Updated ${vehicle.name} (${vehicle.type}): seats=${updateData.seats}, fuel=${updateData.fuelType}, mileage=${updateData.mileage}, transmission=${updateData.transmission}`);
    }

    console.log(`\n🎉 Successfully updated ${vehiclesToUpdate.length} vehicles with specification data!`);
    
    // Verify the updates
    const verifyVehicles = await Vehicle.find();
    const stillMissing = verifyVehicles.filter(v => 
      !v.seats || !v.fuelType || !v.mileage || !v.transmission
    );

    if (stillMissing.length === 0) {
      console.log('✅ All vehicles now have complete specification data!');
    } else {
      console.log(`⚠️  ${stillMissing.length} vehicles still missing data`);
    }
    
  } catch (error) {
    console.error('❌ Error updating vehicles:', error);
  }
  
  mongoose.connection.close();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});
