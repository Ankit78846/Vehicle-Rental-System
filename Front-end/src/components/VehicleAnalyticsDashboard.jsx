import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import { FaEye, FaCar, FaChartBar, FaTrophy, FaCalendar } from 'react-icons/fa';

const VehicleAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('api/content/analytics'));
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Vehicle Analytics Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Vehicle Analytics Dashboard</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading analytics: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Vehicle Analytics Dashboard</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Vehicles</p>
              <p className="text-3xl font-bold">{analytics.totalVehicles}</p>
            </div>
            <FaCar className="text-4xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Most Popular</p>
              <p className="text-xl font-bold">{analytics.popularVehicles[0]?.name || 'N/A'}</p>
              <p className="text-sm text-green-200">{analytics.popularVehicles[0]?.clickCount || 0} views</p>
            </div>
            <FaTrophy className="text-4xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Top Category</p>
              <p className="text-xl font-bold capitalize">
                {analytics.typeDistribution[0]?._id.replace('two-wheeler', 'Two Wheeler') || 'N/A'}
              </p>
              <p className="text-sm text-orange-200">{analytics.typeDistribution[0]?.count || 0} vehicles</p>
            </div>
            <FaChartBar className="text-4xl text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Recent Additions</p>
              <p className="text-xl font-bold">{analytics.recentVehicles.length}</p>
              <p className="text-sm text-purple-200">This month</p>
            </div>
            <FaCalendar className="text-4xl text-purple-200" />
          </div>
        </div>
      </div>

      {/* Popular Vehicles */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <FaTrophy className="text-yellow-500 mr-2" />
          Most Popular Vehicles
        </h3>
        <div className="space-y-3">
          {analytics.popularVehicles.map((vehicle, index) => (
            <div key={vehicle._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold">{vehicle.name}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {vehicle.brand} • {vehicle.type.replace('two-wheeler', 'Two Wheeler')}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-orange-600">
                <FaEye className="mr-1" />
                <span className="font-semibold">{vehicle.clickCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Vehicle Distribution by Type</h3>
          <div className="space-y-3">
            {analytics.typeDistribution.map((type) => {
              const percentage = ((type.count / analytics.totalVehicles) * 100).toFixed(1);
              return (
                <div key={type._id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium">
                      {type._id.replace('two-wheeler', 'Two Wheeler')}
                    </span>
                    <span className="text-sm text-gray-600">{type.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Average Price by Type</h3>
          <div className="space-y-4">
            {analytics.avgPriceByType.map((type) => (
              <div key={type._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="capitalize font-medium">
                  {type._id.replace('two-wheeler', 'Two Wheeler')}
                </span>
                <div className="text-right">
                  <p className="font-bold text-green-600">रु{Math.round(type.avgPrice).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{type.count} vehicles</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Vehicles */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <FaCalendar className="text-blue-500 mr-2" />
          Recently Added Vehicles
        </h3>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Brand</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Added</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentVehicles.map((vehicle) => (
                <tr key={vehicle._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{vehicle.name}</td>
                  <td className="px-4 py-2">{vehicle.brand}</td>
                  <td className="px-4 py-2 capitalize">
                    {vehicle.type.replace('two-wheeler', 'Two Wheeler')}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(vehicle.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={fetchAnalytics}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  );
};

export default VehicleAnalyticsDashboard;
