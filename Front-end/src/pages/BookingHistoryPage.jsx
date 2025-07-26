import React, { useState, useEffect, useCallback } from 'react';
import { getApiUrl, getImageUrl } from '../config/api';
import { FaCalendarAlt, FaCar, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import { MdCancel, MdCheckCircle, MdAccessTime, MdDone } from 'react-icons/md';

const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Get user name from localStorage for display
  const userName = localStorage.getItem('name') || localStorage.getItem('adminName');

  // Debug function to set test token
  const setTestToken = () => {
    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODgzYmQxN2ZjN2EzN2EzMWI4OTY5NTQiLCJpYXQiOjE3NTM0NjQwODcsImV4cCI6MTc1NDA2ODg4N30.jr1KHY2-LGkIodcq_kp8IvnTOrDWBKjHnLsPf1a85H0";
    localStorage.setItem('token', testToken);
    localStorage.setItem('name', 'Test User');
    localStorage.setItem('email', 'abc@gmail.com');
    localStorage.setItem('userId', '6883bd17fc7a37a31b896954');
    console.log('🔧 Test token set! Refreshing bookings...');
    fetchUserBookings();
  };

  // Function to clear all tokens and show fresh bookings issue
  const clearTokensAndExplain = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    localStorage.removeItem('adminName');
    console.log('🧹 All tokens cleared!');
    
    alert(`ISSUE IDENTIFIED! 🔍

The problem is account mismatch:

✅ FRESH BOOKINGS are being created for: pokharelutkrista@gmail.com
❌ YOU'RE VIEWING bookings for: abc@gmail.com (test account)

Your fresh July 26, 2025 bookings exist, but you're logged in as the wrong user!

SOLUTION: You need to log in with your actual account (pokharelutkrista@gmail.com) instead of the test account to see your fresh bookings.

The cancel button logic is working perfectly - you just need the right user account!`);
    
    setError('Please log in with pokharelutkrista@gmail.com to see your fresh bookings from July 26, 2025. The test account (abc@gmail.com) only has old test data from July 24.');
    setLoading(false);
  };

  const cancelBooking = async (bookingId, reason = 'Cancelled by user') => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Send cancel request to admin instead of direct cancellation
      const apiUrl = getApiUrl(`api/payment/esewa/booking/${bookingId}/cancel-request`);
      console.log('� Submitting cancel request for booking:', bookingId);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: reason,
          requestedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to submit cancel request:', response.status, errorText);
        throw new Error(`Failed to submit cancel request: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Cancel request submitted successfully');
      
      // Refresh bookings after successful request submission
      fetchUserBookings();
      
      return data;
    } catch (err) {
      console.error('❌ Error submitting cancel request:', err);
      throw err;
    }
  };

  const fetchUserBookings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      
      // Debug: Show what we have in localStorage
      console.log('📱 localStorage debug:', {
        token: token ? 'Token available' : 'No token',
        name: localStorage.getItem('name'),
        email: localStorage.getItem('email'),
        userId: localStorage.getItem('userId'),
        adminName: localStorage.getItem('adminName')
      });
      
      // Use the new my-bookings endpoint that doesn't require userId in URL
      const apiUrl = getApiUrl('api/payment/esewa/bookings/my-bookings');
      console.log('🔗 API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch bookings:', response.status, errorText);
        throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Received bookings:', data.total || 0, 'bookings');
      
      setBookings(data.bookings || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching user bookings:', err);
      setError('Error fetching bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to check if booking can be cancelled
  const canCancelBooking = (booking) => {
    const cancellableStatuses = ['confirmed', 'pending', 'in-progress'];
    
    // Debug: Log the booking status
    console.log('🔍 Cancel Booking Debug:', {
      bookingId: booking.bookingId,
      status: booking.bookingStatus,
      canCancel: cancellableStatuses.includes(booking.bookingStatus),
      cancelRequestExists: booking.cancelRequest?.status
    });
    
    // Can cancel if booking is in cancellable status and no pending cancel request
    return cancellableStatuses.includes(booking.bookingStatus) && !booking.cancelRequest;
  };

  // Handle cancel booking with confirmation
  const handleCancelBooking = async (booking) => {
    const reason = prompt(
      `Submit a cancellation request for ${booking.vehicleName}?\n\n` +
      `Booking ID: ${booking.bookingId}\n` +
      `Start Date: ${formatDate(booking.startDate)}\n` +
      `Amount: ${formatCurrency(booking.pricing.totalAmount)}\n\n` +
      `Please provide a reason for cancellation (optional):`,
      'Change of plans'
    );
    
    if (reason !== null) { // User clicked OK (even if empty)
      try {
        await cancelBooking(booking.bookingId, reason || 'No reason provided');
        alert('✅ Cancellation request submitted successfully!\n\nYour request has been sent to the admin for review. You will be notified once it\'s processed.');
      } catch (error) {
        alert('❌ Failed to submit cancellation request: ' + error.message);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    
    if (token) {
      fetchUserBookings();
    } else {
      setError('Please log in to view your booking history. Authentication required.');
      setLoading(false);
    }
  }, [fetchUserBookings]);

  // Filter and search bookings
  useEffect(() => {
    let filtered = [...bookings];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.bookingStatus === filterStatus);
    }

    // Search by booking ID or vehicle name
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.vehicleLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort bookings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amount-high':
          return b.pricing.totalAmount - a.pricing.totalAmount;
        case 'amount-low':
          return a.pricing.totalAmount - b.pricing.totalAmount;
        case 'start-date':
          return new Date(a.startDate) - new Date(b.startDate);
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, filterStatus, searchTerm, sortBy]);

  const getStatusBadgeColor = (status) => {
    const colors = {
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'completed': 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'confirmed': <MdCheckCircle className="w-5 h-5" />,
      'pending': <MdAccessTime className="w-5 h-5" />,
      'cancelled': <MdCancel className="w-5 h-5" />,
      'completed': <MdDone className="w-5 h-5" />,
      'in-progress': <FaClock className="w-5 h-5" />
    };
    return icons[status] || <FaClock className="w-5 h-5" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-400 animate-ping"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium animate-pulse">Loading your booking history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdCancel className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Bookings</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchUserBookings}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={clearTokensAndExplain}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              🔍 Explain Fresh Booking Issue
            </button>
            <button
              onClick={setTestToken}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              🔧 Use Test Token (Demo)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Booking History
              </h1>
              <p className="text-blue-100 text-lg">Welcome back, {userName}! Track all your vehicle reservations</p>
              {localStorage.getItem('email') === 'abc@gmail.com' && (
                <div className="mt-3 bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-3">
                  <p className="text-yellow-100 text-sm">
                    ⚠️ <strong>Account Notice:</strong> You're viewing test data for abc@gmail.com. 
                    Fresh bookings are created under pokharelutkrista@gmail.com. 
                    <button 
                      onClick={clearTokensAndExplain}
                      className="underline hover:text-yellow-50 ml-1"
                    >
                      Click here to understand the issue
                    </button>
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={fetchUserBookings}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Bookings</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by booking ID, vehicle, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
                <span className="text-xs text-gray-500 ml-2">(or click boxes above)</span>
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">✅ Confirmed</option>
                <option value="pending">⏳ Pending</option>
                <option value="in-progress">🚗 In Progress</option>
                <option value="completed">✅ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
              >
                <option value="newest">📅 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="amount-high">💰 Amount (High to Low)</option>
                <option value="amount-low">💰 Amount (Low to High)</option>
                <option value="start-date">🗓️ Start Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { status: 'all', label: 'Total Bookings', icon: '📊', color: 'from-blue-500 to-blue-600' },
            { status: 'confirmed', label: 'Confirmed', icon: '✅', color: 'from-green-500 to-green-600' },
            { status: 'pending', label: 'Pending', icon: '⏳', color: 'from-yellow-500 to-yellow-600' },
            { status: 'completed', label: 'Completed', icon: '🎉', color: 'from-purple-500 to-purple-600' },
            { status: 'cancelled', label: 'Cancelled', icon: '❌', color: 'from-red-500 to-red-600' }
          ].map(({ status, label, icon, color }) => {
            const count = status === 'all' 
              ? bookings.length 
              : bookings.filter(b => b.bookingStatus === status).length;
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  isActive ? 'ring-4 ring-white ring-opacity-50 scale-105' : ''
                } cursor-pointer focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-30`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-3xl font-bold mb-1">{count}</div>
                    <div className="text-sm opacity-90">{label}</div>
                  </div>
                  <div className="text-2xl opacity-80">{icon}</div>
                </div>
                {isActive && (
                  <div className="mt-2 text-xs bg-white bg-opacity-20 rounded-full px-2 py-1">
                    Active Filter
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaCar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings found</h3>
              <p className="text-gray-500 mb-6">You haven't made any vehicle bookings yet or no bookings match your search criteria.</p>
              <a 
                href="/browse" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FaCar className="w-5 h-5 mr-2" />
                Browse Vehicles
              </a>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:scale-[1.02]">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    
                    {/* Left Section - Vehicle & Booking Info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                        {/* Vehicle Image */}
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {booking.vehicleImage ? (
                            <img 
                              src={getImageUrl(booking.vehicleImage)} 
                              alt={booking.vehicleName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${booking.vehicleImage ? 'hidden' : ''}`}>
                            <FaCar className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                        
                        {/* Vehicle Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{booking.vehicleName}</h3>
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(booking.bookingStatus)}`}>
                              {getStatusIcon(booking.bookingStatus)}
                              <span className="ml-1 capitalize">{booking.bookingStatus}</span>
                            </span>
                          </div>
                          
                          {/* Booking Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <FaUser className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-500">Booking ID:</span>
                              <span className="font-semibold text-gray-800">{booking.bookingId}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-500">Location:</span>
                              <span className="font-semibold text-gray-800">{booking.vehicleLocation}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaClock className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-500">Duration:</span>
                              <span className="font-semibold text-gray-800">{booking.duration.days} day{booking.duration.days > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaMoneyBillWave className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-500">Total:</span>
                              <span className="font-semibold text-gray-800">{formatCurrency(booking.pricing.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Booking Dates */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">From:</span>
                            <span className="font-semibold">{formatDate(booking.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="w-4 h-4 text-red-500" />
                            <span className="text-gray-600">To:</span>
                            <span className="font-semibold">{formatDate(booking.endDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Section - Payment & Status */}
                    <div className="lg:w-72 space-y-4">
                      {/* Payment Info */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800 mb-1">
                            {formatCurrency(booking.pricing.totalAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            via {booking.paymentMethod?.toUpperCase() || 'N/A'}
                          </div>
                          <div className="mt-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.paymentStatus === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : booking.paymentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {booking.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Customer Details</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <FaUser className="w-3 h-3 text-gray-500" />
                            <span>{booking.userName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="w-3 h-3 text-gray-500" />
                            <span className="truncate">{booking.userEmail}</span>
                          </div>
                          {booking.userPhone && (
                            <div className="flex items-center gap-2">
                              <FaPhone className="w-3 h-3 text-gray-500" />
                              <span>{booking.userPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cancel Button or Status Info */}
                      {canCancelBooking(booking) ? (
                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                          >
                            <MdCancel className="w-4 h-4" />
                            Request Cancellation
                          </button>
                          <p className="text-xs text-orange-600 mt-2 text-center">
                            Submit request to admin for review
                          </p>
                        </div>
                      ) : booking.cancelRequest ? (
                        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-yellow-700 text-sm mb-2">
                              <MdAccessTime className="w-4 h-4" />
                              Cancel Request Pending
                            </div>
                            <p className="text-xs text-yellow-600">
                              Submitted: {formatDate(booking.cancelRequest.requestedAt)}
                            </p>
                            {booking.cancelRequest.reason && (
                              <p className="text-xs text-yellow-600 mt-1">
                                Reason: {booking.cancelRequest.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : booking.bookingStatus === 'cancelled' ? (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                            <MdCancel className="w-4 h-4" />
                            Booking Cancelled
                          </div>
                        </div>
                      ) : booking.bookingStatus === 'completed' ? (
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                          <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                            <MdDone className="w-4 h-4" />
                            Trip Completed
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="text-center text-gray-700 text-xs">
                            Cannot request cancellation
                            <br />
                            <span className="text-gray-500">Status: {booking.bookingStatus}</span>
                          </div>
                        </div>
                      )}

                      {/* Booking Date */}
                      <div className="text-center text-xs text-gray-500">
                        Booked on {formatDate(booking.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results Summary */}
        {filteredBookings.length > 0 && (
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100 mt-8">
            <p className="text-gray-600">
              Showing <span className="font-bold text-blue-600">{filteredBookings.length}</span> of <span className="font-bold text-blue-600">{bookings.length}</span> bookings
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistoryPage;
