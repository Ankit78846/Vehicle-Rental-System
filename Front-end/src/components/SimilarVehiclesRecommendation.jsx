import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApiUrl, getImageUrl } from '../config/api';
import { FaArrowRight } from 'react-icons/fa';

const SimilarVehiclesRecommendation = ({ currentVehicle, limit = 4 }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentVehicle) return;

    const generateRecommendations = async () => {
      try {
        setLoading(true);
        
        // Fetch all vehicles
        const response = await fetch(getApiUrl('api/vehicles'));
        const allVehicles = await response.json();
        
        // Filter out the current vehicle and inactive vehicles
        const availableVehicles = allVehicles.filter(
          v => v._id !== currentVehicle._id && v.isActive === true
        );

      // Content-based filtering algorithm
      const scoredVehicles = availableVehicles.map(vehicle => {
        let score = 0;
        
        // Same type gets highest priority (40 points)
        if (vehicle.type === currentVehicle.type) {
          score += 40;
        }
        
        // Same brand gets high priority (30 points)
        if (vehicle.brand === currentVehicle.brand) {
          score += 30;
        }
        
        // Same fuel type (20 points)
        if (vehicle.fuelType === currentVehicle.fuelType) {
          score += 20;
        }
        
        // Same transmission (15 points)
        if (vehicle.transmission === currentVehicle.transmission) {
          score += 15;
        }
        
        // Similar location (10 points)
        if (vehicle.location === currentVehicle.location) {
          score += 10;
        }
        
        // Similar capacity (10 points for exact match, 5 for ±2 difference)
        const capacityDiff = Math.abs(vehicle.capacity - currentVehicle.capacity);
        if (capacityDiff === 0) {
          score += 10;
        } else if (capacityDiff <= 2) {
          score += 5;
        }
        
        // Similar price range (10 points for within 20%, 5 for within 40%)
        const currentPrice = typeof currentVehicle.price === 'number' ? 
          currentVehicle.price : 
          parseFloat(currentVehicle.price.replace(/[^\d.-]/g, '')) || 0;
        
        const vehiclePrice = typeof vehicle.price === 'number' ? 
          vehicle.price : 
          parseFloat(vehicle.price.replace(/[^\d.-]/g, '')) || 0;
        
        if (currentPrice > 0 && vehiclePrice > 0) {
          const priceDiffPercent = Math.abs(vehiclePrice - currentPrice) / currentPrice;
          if (priceDiffPercent <= 0.2) {
            score += 10;
          } else if (priceDiffPercent <= 0.4) {
            score += 5;
          }
        }
        
        // Feature similarity (up to 15 points)
        if (currentVehicle.features && vehicle.features) {
          const currentFeatures = extractFeaturesList(currentVehicle.features);
          const vehicleFeatures = extractFeaturesList(vehicle.features);
          
          const commonFeatures = currentFeatures.filter(feature => 
            vehicleFeatures.some(vf => vf.toLowerCase().includes(feature.toLowerCase()))
          );
          
          // Award points based on feature overlap
          const featureScore = Math.min(15, (commonFeatures.length / Math.max(currentFeatures.length, 1)) * 15);
          score += featureScore;
        }
        
        // Popularity bonus (click count) - up to 20 points
        const popularityScore = Math.min(20, (vehicle.clickCount || 0) * 2);
        score += popularityScore;
        
        return { ...vehicle, similarityScore: score };
      });

      // Sort by similarity score and select top recommendations
      const topRecommendations = scoredVehicles
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);

      setRecommendations(topRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
    };

    generateRecommendations();
  }, [currentVehicle, limit]);

  // Helper function to extract features from the features object
  const extractFeaturesList = (featuresObj) => {
    const allFeatures = [];
    if (featuresObj && typeof featuresObj === 'object') {
      Object.values(featuresObj).forEach(featureList => {
        if (Array.isArray(featureList)) {
          allFeatures.push(...featureList.filter(f => f && f.trim()));
        }
      });
    }
    return allFeatures;
  };

  const RecommendationCard = ({ vehicle }) => {
    const handleClick = async () => {
      try {
        await fetch(getApiUrl(`api/public/track-click/${vehicle._id}`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    };

    return (
      <Link
        to={`/vehicle/${vehicle.type === 'two-wheeler' ? 'two-wheeler' : vehicle.type.toLowerCase()}/${vehicle._id}`}
        onClick={handleClick}
        className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
      >
        <div className="relative">
          <img
            src={getImageUrl(vehicle.image)}
            alt={vehicle.name}
            className="w-full h-48 object-cover"
          />
          
          {/* Similarity badge */}
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {Math.round(vehicle.similarityScore)}% match
          </div>
          
          {/* Popularity badge */}
          {vehicle.clickCount > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              {vehicle.clickCount} views
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h4 className="font-semibold text-gray-800 mb-2 truncate">{vehicle.name}</h4>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{vehicle.brand}</span>
            <span className="capitalize">{vehicle.type.replace('two-wheeler', 'Two Wheeler')}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>{vehicle.fuelType}</span>
            <span>{vehicle.capacity} seats</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-green-600">
              {typeof vehicle.price === 'number' ? `रु${vehicle.price.toLocaleString()}` : vehicle.price}
            </span>
            <FaArrowRight className="text-blue-500" />
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Similar Vehicles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Similar Vehicles You Might Like
        </h3>
        <Link
          to="/vehicles"
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          View All <FaArrowRight />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map(vehicle => (
          <RecommendationCard key={vehicle._id} vehicle={vehicle} />
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Recommendations based on vehicle type, brand, features, and popularity
        </p>
      </div>
    </div>
  );
};

export default SimilarVehiclesRecommendation;
