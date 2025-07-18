const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle"); // Adjust path as needed
const verifyToken = require("../middleware/auth");
const { isAdmin } = require("../middleware/auth");

// Import multer for handling file uploads
const multer = require('multer');
const path = require('path');

// Configure multer for vehicle image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/vehicles'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, timestamp + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.put("/update-vehicle", verifyToken, isAdmin, async (req, res) => {
  try {
    const { _id, name, type, brand, price, location, description, features, seats, fuelType, mileage, transmission } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Vehicle ID is required" });
    }

    const updated = await Vehicle.findByIdAndUpdate(
      _id,
      {
        name,
        type,
        brand,
        price,
        location,
        seats: parseInt(seats),
        fuelType,
        mileage: parseFloat(mileage),
        transmission,
        description,
        features,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ message: "Vehicle updated successfully", vehicle: updated });
  } catch (err) {
    console.error("Update vehicle error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/delete-vehicle/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Vehicle.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error("Delete vehicle error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Add vehicle image update endpoint
router.post("/update-vehicle-image", verifyToken, isAdmin, upload.single('vehicleImage'), async (req, res) => {
  try {
    const { vehicleId } = req.body;
    
    if (!vehicleId) {
      return res.status(400).json({ message: "Vehicle ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Construct the image URL
    const imageUrl = `http://localhost:3001/uploads/vehicles/${req.file.filename}`;

    // Update the vehicle with the new image
    const updated = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { image: imageUrl },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ 
      message: "Vehicle image updated successfully", 
      imageUrl: imageUrl,
      vehicle: updated 
    });
  } catch (err) {
    console.error("Update vehicle image error:", err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: "File size too large. Maximum 5MB allowed." });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
