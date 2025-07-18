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
    // Get all vehicles
    const vehicles = await Vehicle.find();
    console.log(`\n📊 Found ${vehicles.length} vehicles in database:`);
    
    vehicles.forEach((vehicle, index) => {
      console.log(`\n🚗 Vehicle ${index + 1}:`);
      console.log(`  ID: ${vehicle._id}`);
      console.log(`  Name: ${vehicle.name}`);
      console.log(`  Type: ${vehicle.type}`);
      console.log(`  Seats: ${vehicle.seats}`);
      console.log(`  Fuel Type: ${vehicle.fuelType}`);
      console.log(`  Mileage: ${vehicle.mileage}`);
      console.log(`  Transmission: ${vehicle.transmission}`);
      console.log(`  Image: ${vehicle.image}`);
      console.log(`  Description: ${vehicle.description ? 'Yes' : 'No'}`);
      console.log(`  Features: ${vehicle.features ? Object.keys(vehicle.features).length : 0} categories`);
    });
    
    // Check if any vehicles are missing the new fields
    const missingFields = vehicles.filter(v => 
      !v.seats || !v.fuelType || !v.mileage || !v.transmission
    );
    
    if (missingFields.length > 0) {
      console.log(`\n⚠️  Warning: ${missingFields.length} vehicles are missing new specification fields!`);
      missingFields.forEach(vehicle => {
        console.log(`  - ${vehicle.name} (ID: ${vehicle._id})`);
        console.log(`    Missing: ${!vehicle.seats ? 'seats ' : ''}${!vehicle.fuelType ? 'fuelType ' : ''}${!vehicle.mileage ? 'mileage ' : ''}${!vehicle.transmission ? 'transmission' : ''}`);
      });
    } else {
      console.log('\n✅ All vehicles have complete specification data!');
    }
    
  } catch (error) {
    console.error('❌ Error fetching vehicles:', error);
  }
  
  mongoose.connection.close();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});
