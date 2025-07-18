import { useState } from 'react';
import { FaPen, FaSpinner } from 'react-icons/fa';
import toast,{ Toaster } from "react-hot-toast";

export const LocationPicker = ({ location, onLocationChange }) => {
  const [currentLocation, setCurrentLocation] = useState(location);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Function to get user location
  const getUserLocation = () => {
    setIsLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get address from coordinates
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`
          );
          
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted;
            // Update the location
            setCurrentLocation(address);
            onLocationChange(address);
            toast.success("Location updated successfully");
          } else {
            // Fallback to coordinates if geocoding fails
            const coordsString = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
            setCurrentLocation(coordsString);
            onLocationChange(coordsString);
            toast.success("Location coordinates captured");
          }
        } catch (err) {
          // Fallback to coordinates if API call fails
          const coordsString = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
          setCurrentLocation(coordsString);
          onLocationChange(coordsString);
          toast.success("Location coordinates captured");
          console.error('Geocoding error:', err);
        }
        
        setIsLoading(false);
      },
      (err) => {
        setLocationError(`Error getting location: ${err.message}`);
        toast.error(`Error getting location: ${err.message}`);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium text-sm text-gray-700">
          Pickup & return location
        </p>
        <p className="text-sm text-black">{currentLocation}</p>
        {locationError && <p className="text-xs text-red-500">{locationError}</p>}
      </div>
      <button 
        className="p-2 hover:bg-gray-100 rounded-full"
        onClick={getUserLocation}
        disabled={isLoading}
      >
        {isLoading ? (
          <FaSpinner className="text-sm text-gray-600 animate-spin" />
        ) : (
          <FaPen className="text-sm text-gray-600" />
        )}
      </button>
    </div>
  );
};