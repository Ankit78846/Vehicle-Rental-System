import { useState, useEffect } from 'react';
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaCar, FaMapMarkerAlt, FaUsers, FaGasPump } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import EditVehicleForm from './EditVehiclePage'; // Reusable Add/Edit form
import { getApiUrl, getImageUrl } from "../../../config/api";

// VehicleBookingCard Component
const VehicleBookingCard = ({ 
  vehicle, 
  index, 
  showDropdown, 
  setShowDropdown, 
  showDeletePopover,
  vehicleToDelete,
  onEdit, 
  onDeleteClick, 
  onDeleteConfirm, 
  onDeleteCancel,
  onToggleStatus 
}) => {
  const getVehicleIcon = (type) => {
    switch(type) {
      case 'two-wheeler': return '🏍️';
      case 'car': return '🚗';
      case 'truck': return '🚚';
      case 'pickup': return '🛻';
      case 'bus': return '🚌';
      default: return '🚗';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:scale-[1.02]">
      <div className="relative">
        {/* Vehicle Image */}
        <div className="h-60 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          {vehicle.image ? (
            <img
              src={getImageUrl(vehicle.image)}
              alt={vehicle.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">{getVehicleIcon(vehicle.type)}</span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              vehicle.isActive 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {vehicle.isActive ? "✅ Active" : "❌ Inactive"}
            </span>
          </div>

          {/* More Options Button */}
          <div className="absolute top-3 right-3">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-105"
              >
                <BsThreeDotsVertical className="text-gray-700" />
              </button>
              
              {showDropdown === index && (
                <div className="absolute right-0 w-60 border bg-white border-gray-200 rounded-xl shadow-xl">
                  {showDeletePopover === index ? (
                    <div className="p-4">
                      <h2 className="text-base font-bold mb-2 text-center">Confirm Deletion</h2>
                      <p className="mb-4 text-center text-sm text-gray-600">
                        Are you sure you want to delete <span className="font-semibold text-gray-800">{vehicleToDelete?.name}</span>? 
                        This action cannot be undone.
                      </p>
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={onDeleteCancel} 
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={onDeleteConfirm} 
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      {/* <button 
                        onClick={() => onEdit(vehicle)} 
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Vehicle
                      </button> */}
                      <button 
                        onClick={() => onDeleteClick(vehicle, index)} 
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Vehicle
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
                {vehicle.name}
              </h3>
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                  {vehicle.type?.replace('two-wheeler', 'Two Wheeler')}
                </span>
                <span>•</span>
                <span className="font-medium">{vehicle.brand}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Specs */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaMapMarkerAlt className="text-red-500" />
              <span>{vehicle.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaUsers className="text-blue-500" />
              <span>{vehicle.capacity || vehicle.seats || 'N/A'} seats</span>
            </div>
            {vehicle.fuelType && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaGasPump className="text-green-500" />
                <span>{vehicle.fuelType}</span>
              </div>
            )}
            {vehicle.transmission && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{vehicle.transmission}</span>
              </div>
            )}
          </div>

          {/* Price and Action */}
          <div className="flex items-end justify-between mt-6">
            <div className="flex flex-col">
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-indigo-600 bg-clip-text text-transparent">
                Rs {vehicle.price}
              </p>
              <p className="text-sm text-gray-400">per day</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(vehicle)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
              >
                Edit
              </button>
              <button 
                onClick={() => onToggleStatus(vehicle)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:scale-105 transition-transform duration-200 ${
                  vehicle.isActive
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                }`}
              >
                {vehicle.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>

          {/* Created By */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Created by: <span className="font-medium text-gray-700">{vehicle.createdBy}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VehicleDataComponent() {

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [showDeletePopover, setShowDeletePopover] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    let filtered = [...vehicles];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(vehicle => vehicle.isActive);
      } else {
        filtered = filtered.filter(vehicle => !vehicle.isActive);
      }
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, filterType, filterStatus]);

  const fetchVehicles = () => {
    setLoading(true);
    axios.get(getApiUrl("api/vehicles"))
      .then(res => {
        setVehicles(res.data.reverse());
        setLoading(false);
      })
      .catch(err => {
        toast.error("Error fetching vehicles", err);
        setLoading(false);
      });
  };

  const handleToggleStatus = async (vehicle) => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) {
      toast.error("Login required");
      return;
    }

    const newStatus = !vehicle.isActive;
    
    try {
      const response = await axios.patch(
        getApiUrl(`api/toggle-vehicle-status/${vehicle._id}`),
        { isActive: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message || `Vehicle ${newStatus ? 'activated' : 'deactivated'} successfully`);
        fetchVehicles(); // Refresh the vehicle list
      } else {
        toast.error(response.data.message || "Failed to update vehicle status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Error updating vehicle status: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowDropdown(null);
  };

  const handleUpdate = async (updatedVehicle) => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) {
      toast.error("Login required.");
      return;
    }
    try {
      const response = await axios.put(
        getApiUrl(`api/update-vehicle`),
        updatedVehicle,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success(response.data.message || "Vehicle updated successfully");
        fetchVehicles();
        setEditingVehicle(null);
      } else {
        toast.error(response.data.message || "Failed to update vehicle");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error updating vehicle"
      );
    }
  };

  const handleDeleteClick = (vehicle, index) => {
    setVehicleToDelete(vehicle);
    setShowDeletePopover(index);
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) {
      toast.error("Login required.");
      setShowDeletePopover(null);
      return;
    }
    try {
      const response = await axios.delete(getApiUrl(`api/delete-vehicle/${vehicleToDelete._id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        toast.success(response.data.message || "Vehicle deleted successfully");
        fetchVehicles();
      } else {
        toast.error(response.data.message || "Failed to delete vehicle");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting vehicle");
    } finally {
      setShowDropdown(null);
      setShowDeletePopover(null);
      setVehicleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDropdown(null);
    setShowDeletePopover(null);
    setVehicleToDelete(null);
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Vehicle Management
            </h1>
            <p className="text-blue-100 text-lg">Manage and track all vehicles in the rental system</p>
          </div>
          <button
            onClick={fetchVehicles}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          Search & Filter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Vehicles</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, type, location, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="two-wheeler">🏍️ Two Wheeler</option>
              <option value="car">🚗 Car</option>
              <option value="truck">🚚 Truck</option>
              <option value="pickup">🛻 Pickup</option>
              <option value="bus">🚌 Bus</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">✅ Active</option>
              <option value="inactive">❌ Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="min-h-[500px] flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-400 animate-ping"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium animate-pulse">Loading vehicles...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/50 ${
                filterStatus === 'all' ? 'ring-4 ring-white/70 scale-105' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold mb-1">{vehicles.length}</div>
                  <div className="text-sm opacity-90">Total Vehicles</div>
                </div>
                <FaCar className="text-2xl opacity-80" />
              </div>
            </button>
            
            <button
              onClick={() => setFilterStatus('active')}
              className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/50 ${
                filterStatus === 'active' ? 'ring-4 ring-white/70 scale-105' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold mb-1">{vehicles.filter(v => v.isActive).length}</div>
                  <div className="text-sm opacity-90">Active</div>
                </div>
                <svg className="text-2xl opacity-80 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
            
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/50 ${
                filterStatus === 'inactive' ? 'ring-4 ring-white/70 scale-105' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold mb-1">{vehicles.filter(v => !v.isActive).length}</div>
                  <div className="text-sm opacity-90">Inactive</div>
                </div>
                <svg className="text-2xl opacity-80 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold mb-1">{filteredVehicles.length}</div>
                  <div className="text-sm opacity-90">Filtered</div>
                </div>
                <svg className="text-2xl opacity-80 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="space-y-4">
            {filteredVehicles.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaCar className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Vehicles Found</h3>
                <p className="text-gray-500">Try adjusting your search filters to find vehicles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle, index) => (
                  <VehicleBookingCard
                    key={vehicle._id}
                    vehicle={vehicle}
                    index={index}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                    showDeletePopover={showDeletePopover}
                    vehicleToDelete={vehicleToDelete}
                    onEdit={handleEdit}
                    onDeleteClick={handleDeleteClick}
                    onDeleteConfirm={handleDeleteConfirm}
                    onDeleteCancel={handleDeleteCancel}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Results Summary */}
          {filteredVehicles.length > 0 && (
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <p className="text-gray-600">
                Showing <span className="font-bold text-indigo-600">{filteredVehicles.length}</span> of <span className="font-bold text-indigo-600">{vehicles.length}</span> vehicles
              </p>
            </div>
          )}
        </>
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <EditVehicleForm
              initialData={editingVehicle}
              onSubmit={handleUpdate}
              onCancel={() => setEditingVehicle(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
