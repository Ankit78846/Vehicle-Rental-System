const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    validate: {
      validator: (value) => !/^\d/.test(value),
      message: 'Name must not start with a number',
    },
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    validate: {
      validator: (value) => !/^\d/.test(value),
      message: 'Type must not start with a number',
    },
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    validate: {
      validator: (value) => !/^\d/.test(value),
      message: 'Brand must not start with a number',
    },
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be a positive number'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  // Vehicle specifications
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [1, 'Seats must be at least 1'],
    max: [50, 'Seats cannot exceed 50'],
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: ['Gas', 'Electric', 'Hybrid'],
  },
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: [1, 'Mileage must be positive'],
  },
  transmission: {
    type: String,
    required: [true, 'Transmission type is required'],
    enum: ['Automatic', 'Manual'],
  },
  features: {
    Safety: [String],
    'Device connectivity': [String],
    'Additional features': [String],
  },
  image: {
    type: String,
    required: [true, 'Image is required'],
  },
  description: { 
    type: String, 
    required:[ true," Add description"] 
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);