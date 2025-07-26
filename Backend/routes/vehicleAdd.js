const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

const { vehicleUpload } = require('../middleware/upload');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// Helper function to process vehicle image URLs
const processVehicleImageUrl = (vehicle) => {
  if (vehicle.image && !vehicle.image.startsWith('http')) {
    vehicle.image = `${BASE_URL}/uploads/vehicles/${vehicle.image}`;
  }
  return vehicle;
};

router.post('/add-vehicle', vehicleUpload.single('vehicleImage'), async (req, res) => {
  try {
    const { name, type, brand, price, location, features, description, capacity, fuelType, mileage, transmission, isActive, createdById, userId } = req.body;
    // For Cloudinary, use the full URL; for local storage, use filename
    const image = req.file ? (req.file.path || req.file.filename) : null;

    if (!image) {
      return res.status(400).json({ message: 'Vehicle image is required' });
    }

    // Get the user ID (either from request body or createdById)
    const vehicleOwnerId = userId || createdById;

    const vehicle = new Vehicle({
      name,
      type,
      brand,
      price: parseFloat(price),
      location,
      capacity: parseInt(capacity),
      fuelType,
      mileage: parseFloat(mileage),
      transmission,
      features: JSON.parse(features),
      image,
      description,
      isActive: isActive !== undefined ? isActive : true, // Default to true if not provided
      clickCount: 0, 
      createdBy: req.body.createdBy || 'user',
      createdById: vehicleOwnerId || 'admin',
    });

    await vehicle.save();

    // If a regular user is adding a vehicle, make them a host
    if (vehicleOwnerId && vehicleOwnerId !== 'admin') {
      try {
        const user = await User.findById(vehicleOwnerId);
        if (user && !user.isHost) {
          user.isHost = true;
          user.role = 'host';
          user.hostSince = new Date();
          user.vehiclesOwned.push(vehicle._id);
          await user.save();
          
          console.log(`User ${user.email} has been upgraded to host status`);
        } else if (user && user.isHost) {
          // Just add the vehicle to their owned vehicles
          user.vehiclesOwned.push(vehicle._id);
          await user.save();
        }
      } catch (userError) {
        console.error('Error updating user host status:', userError);
        // Don't fail the vehicle creation if user update fails
      }
    }

    res.status(201).json({ 
      message: 'Vehicle added successfully',
      vehicleId: vehicle._id,
      hostUpgrade: vehicleOwnerId && vehicleOwnerId !== 'admin' ? true : false
    });
  } catch (error) {
    console.error('Error adding vehicle:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Route to track vehicle clicks
router.post('/track-click/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { $inc: { clickCount: 1 } }, // Increment click count by 1
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({ 
      message: 'Click tracked successfully', 
      clickCount: vehicle.clickCount 
    });
  } catch (error) {
    console.error('Error tracking click:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Route to get most clicked vehicles (for content-based filtering)
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const popularVehicles = await Vehicle.find({ isActive: true })
      .sort({ clickCount: -1 }) // Sort by click count in descending order
      .limit(limit);

    const processedVehicles = popularVehicles.map(vehicle => processVehicleImageUrl(vehicle.toObject()));
    res.status(200).json(processedVehicles);
  } catch (error) {
    console.error('Error fetching popular vehicles:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Route to get vehicles owned by a specific user (host)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const vehicles = await Vehicle.find({ createdById: userId })
      .sort({ createdAt: -1 });

    const processedVehicles = vehicles.map(vehicle => processVehicleImageUrl(vehicle.toObject()));
    
    res.status(200).json({
      success: true,
      count: processedVehicles.length,
      data: processedVehicles
    });
  } catch (error) {
    console.error('Error fetching user vehicles:', error.message);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Route to get host statistics
router.get('/host-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const totalVehicles = await Vehicle.countDocuments({ createdById: userId });
    const activeVehicles = await Vehicle.countDocuments({ createdById: userId, isActive: true });
    const totalViews = await Vehicle.aggregate([
      { $match: { createdById: userId } },
      { $group: { _id: null, totalClicks: { $sum: "$clickCount" } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalVehicles,
        activeVehicles,
        totalViews: totalViews[0]?.totalClicks || 0
      }
    });
  } catch (error) {
    console.error('Error fetching host statistics:', error.message);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});


module.exports = router;