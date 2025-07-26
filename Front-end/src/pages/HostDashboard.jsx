import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaEye, FaEdit, FaTrash, FaPlus, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { getApiUrl, getImageUrl } from '../config/api';

const HostDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [hostStats, setHostStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHostData();
  }, [fetchHostData]);

  const fetchHostData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        setError('Please log in to view your dashboard');
        return;
      }

      // Fetch host vehicles
      const vehiclesResponse = await fetch(getApiUrl(`api/user/add-vehicle/user/${userId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        setVehicles(vehiclesData.data || []);
      }

      // Fetch host statistics
      const statsResponse = await fetch(getApiUrl(`api/user/add-vehicle/host-stats/${userId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setHostStats(statsData.data || {
          totalVehicles: 0,
          activeVehicles: 0,
          totalViews: 0
        });
      }

    } catch (err) {
      console.error('Error fetching host data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`api/vehicles/${vehicleId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setVehicles(vehicles.filter(vehicle => vehicle._id !== vehicleId));
        setHostStats(prev => ({
          ...prev,
          totalVehicles: prev.totalVehicles - 1,
          activeVehicles: prev.activeVehicles - 1
        }));
      } else {
        alert('Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Error deleting vehicle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            to="/login" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage your vehicles and track performance</p>
            </div>
            <Link
              to="/add-vehicle"
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add New Vehicle
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaCar className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{hostStats.totalVehicles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FaStar className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{hostStats.activeVehicles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaEye className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{hostStats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Vehicles</h2>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <FaCar className="mx-auto text-gray-400 text-4xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first vehicle to the rental platform</p>
              <Link
                to="/add-vehicle"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Add Your First Vehicle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Vehicle Image */}
                  <div className="h-48 bg-gray-100 relative">
                    <img
                      src={getImageUrl(vehicle.image)}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-gray-300 hidden items-center justify-center">
                      <FaCar className="text-gray-500 text-3xl" />
                    </div>
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                      vehicle.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{vehicle.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{vehicle.type} • {vehicle.brand}</p>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{vehicle.location}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-lg font-bold text-green-600">रु{vehicle.price?.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 ml-1">per day</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaEye className="mr-1" />
                        <span>{vehicle.clickCount || 0} views</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/vehicles/${vehicle._id}`}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm text-center hover:bg-blue-700 transition-colors"
                      >
                        <FaEye className="inline mr-1" />
                        View
                      </Link>
                      <Link
                        to={`/edit-vehicle/${vehicle._id}`}
                        className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm text-center hover:bg-gray-700 transition-colors"
                      >
                        <FaEdit className="inline mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                        className="bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
