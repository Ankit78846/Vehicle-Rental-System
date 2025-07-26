const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// Helper function to process vehicle image URLs
const processVehicleImageUrl = (vehicle) => {
  if (vehicle.image) {
    if (vehicle.image.startsWith('http')) {
      return vehicle;
    }
    vehicle.image = `${BASE_URL}/uploads/vehicles/${vehicle.image}`;
  }
  return vehicle;
};

// Enhanced search with content-based filtering
router.get('/search', async (req, res) => {
  try {
    const {
      q, // search query
      type,
      brand,
      fuelType,
      transmission,
      location,
      minPrice,
      maxPrice,
      minCapacity,
      maxCapacity,
      features,
      sortBy = 'relevance',
      limit = 50,
      page = 1
    } = req.query;

    // Build the base query
    let query = { isActive: true };

    // Add filters to query
    if (type) query.type = type;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (location) query.location = new RegExp(location, 'i');

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Capacity range filter
    if (minCapacity || maxCapacity) {
      query.capacity = {};
      if (minCapacity) query.capacity.$gte = parseInt(minCapacity);
      if (maxCapacity) query.capacity.$lte = parseInt(maxCapacity);
    }

    // Text search across multiple fields
    if (q) {
      query.$or = [
        { name: new RegExp(q, 'i') },
        { brand: new RegExp(q, 'i') },
        { type: new RegExp(q, 'i') },
        { location: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') }
      ];
    }

    // Features filter (if specific features are requested)
    if (features) {
      const featureList = features.split(',').map(f => f.trim());
      const featureQueries = featureList.map(feature => ({
        $or: [
          { 'features.Safety': new RegExp(feature, 'i') },
          { 'features.Device connectivity': new RegExp(feature, 'i') },
          { 'features.Additional features': new RegExp(feature, 'i') }
        ]
      }));
      query.$and = featureQueries;
    }

    // Execute the query
    let vehiclesQuery = Vehicle.find(query);

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        vehiclesQuery = vehiclesQuery.sort({ price: 1 });
        break;
      case 'price-desc':
        vehiclesQuery = vehiclesQuery.sort({ price: -1 });
        break;
      case 'popularity':
        vehiclesQuery = vehiclesQuery.sort({ clickCount: -1 });
        break;
      case 'newest':
        vehiclesQuery = vehiclesQuery.sort({ createdAt: -1 });
        break;
      case 'name':
        vehiclesQuery = vehiclesQuery.sort({ name: 1 });
        break;
      case 'capacity':
        vehiclesQuery = vehiclesQuery.sort({ capacity: -1 });
        break;
      default:
        // Relevance sorting - prioritize by click count, then by creation date
        vehiclesQuery = vehiclesQuery.sort({ clickCount: -1, createdAt: -1 });
    }

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    vehiclesQuery = vehiclesQuery.skip(skip).limit(parseInt(limit));

    const vehicles = await vehiclesQuery;
    const totalCount = await Vehicle.countDocuments(query);

    // Process image URLs
    const processedVehicles = vehicles.map(vehicle => processVehicleImageUrl(vehicle.toObject()));

    res.json({
      vehicles: processedVehicles,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      hasMore: skip + vehicles.length < totalCount
    });

  } catch (error) {
    console.error('Error in enhanced search:', error);
    res.status(500).json({ message: 'Server error during search', error: error.message });
  }
});

// Get similar vehicles based on content filtering
router.get('/similar/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { limit = 4 } = req.query;

    // Get the reference vehicle
    const referenceVehicle = await Vehicle.findById(vehicleId);
    if (!referenceVehicle) {
      return res.status(404).json({ message: 'Reference vehicle not found' });
    }

    // Get all other active vehicles
    const allVehicles = await Vehicle.find({
      _id: { $ne: vehicleId },
      isActive: true
    });

    // Calculate similarity scores
    const scoredVehicles = allVehicles.map(vehicle => {
      let score = 0;

      // Same type (40 points)
      if (vehicle.type === referenceVehicle.type) score += 40;

      // Same brand (30 points)
      if (vehicle.brand === referenceVehicle.brand) score += 30;

      // Same fuel type (20 points)
      if (vehicle.fuelType === referenceVehicle.fuelType) score += 20;

      // Same transmission (15 points)
      if (vehicle.transmission === referenceVehicle.transmission) score += 15;

      // Same location (10 points)
      if (vehicle.location === referenceVehicle.location) score += 10;

      // Similar capacity (10 points for exact, 5 for ±2)
      const capacityDiff = Math.abs(vehicle.capacity - referenceVehicle.capacity);
      if (capacityDiff === 0) score += 10;
      else if (capacityDiff <= 2) score += 5;

      // Similar price (10 points for within 20%, 5 for within 40%)
      if (referenceVehicle.price > 0) {
        const priceDiff = Math.abs(vehicle.price - referenceVehicle.price) / referenceVehicle.price;
        if (priceDiff <= 0.2) score += 10;
        else if (priceDiff <= 0.4) score += 5;
      }

      // Feature similarity (up to 15 points)
      if (referenceVehicle.features && vehicle.features) {
        const refFeatures = extractFeatures(referenceVehicle.features);
        const vehFeatures = extractFeatures(vehicle.features);
        
        const commonFeatures = refFeatures.filter(f => 
          vehFeatures.some(vf => vf.toLowerCase().includes(f.toLowerCase()))
        );
        
        if (refFeatures.length > 0) {
          score += (commonFeatures.length / refFeatures.length) * 15;
        }
      }

      // Popularity bonus (up to 20 points)
      score += Math.min(20, (vehicle.clickCount || 0) * 2);

      return { ...vehicle.toObject(), similarityScore: Math.round(score) };
    });

    // Sort by similarity score and get top results
    const topSimilar = scoredVehicles
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, parseInt(limit));

    // Process image URLs
    const processedVehicles = topSimilar.map(vehicle => processVehicleImageUrl(vehicle));

    res.json(processedVehicles);

  } catch (error) {
    console.error('Error finding similar vehicles:', error);
    res.status(500).json({ message: 'Server error finding similar vehicles', error: error.message });
  }
});

// Helper function to extract features from features object
function extractFeatures(featuresObj) {
  const features = [];
  if (featuresObj && typeof featuresObj === 'object') {
    Object.values(featuresObj).forEach(featureList => {
      if (Array.isArray(featureList)) {
        features.push(...featureList.filter(f => f && f.trim()));
      }
    });
  }
  return features;
}

// Get filter options for dynamic filter UI
router.get('/filter-options', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isActive: true });

    const options = {
      types: [...new Set(vehicles.map(v => v.type))].sort(),
      brands: [...new Set(vehicles.map(v => v.brand))].sort(),
      fuelTypes: [...new Set(vehicles.map(v => v.fuelType))].sort(),
      transmissions: [...new Set(vehicles.map(v => v.transmission))].sort(),
      locations: [...new Set(vehicles.map(v => v.location))].sort(),
      priceRange: {
        min: Math.min(...vehicles.map(v => v.price)),
        max: Math.max(...vehicles.map(v => v.price))
      },
      capacityRange: {
        min: Math.min(...vehicles.map(v => v.capacity)),
        max: Math.max(...vehicles.map(v => v.capacity))
      },
      features: []
    };

    // Extract all unique features
    const allFeatures = new Set();
    vehicles.forEach(vehicle => {
      if (vehicle.features) {
        Object.values(vehicle.features).forEach(featureList => {
          if (Array.isArray(featureList)) {
            featureList.forEach(feature => {
              if (feature && feature.trim()) {
                allFeatures.add(feature.trim());
              }
            });
          }
        });
      }
    });
    
    options.features = [...allFeatures].sort();

    res.json(options);

  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({ message: 'Server error getting filter options', error: error.message });
  }
});

// Advanced analytics endpoint
router.get('/analytics', async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments({ isActive: true });
    
    // Most popular vehicles
    const popular = await Vehicle.find({ isActive: true })
      .sort({ clickCount: -1 })
      .limit(5)
      .select('name clickCount type brand');

    // Vehicle distribution by type
    const typeDistribution = await Vehicle.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Average price by type
    const avgPriceByType = await Vehicle.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', avgPrice: { $avg: '$price' }, count: { $sum: 1 } } },
      { $sort: { avgPrice: -1 } }
    ]);

    // Recent additions
    const recentVehicles = await Vehicle.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt type brand');

    res.json({
      totalVehicles,
      popularVehicles: popular,
      typeDistribution,
      avgPriceByType,
      recentVehicles
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ message: 'Server error getting analytics', error: error.message });
  }
});

module.exports = router;
