import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../../config/api';
import toast from 'react-hot-toast';

const BookingDataComponent = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch bookings data
  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter and search bookings
  useEffect(() => {
    let filtered = [...bookings];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.bookingStatus === filterStatus);
    }

    // Search by booking ID, user name, or vehicle name
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
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

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl('api/bookings/admin/all');
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setBookings(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Error fetching bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus, notes = '') => {
    try {
      const response = await fetch(getApiUrl(`api/bookings/${bookingId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      // Refresh bookings list
      await fetchBookings();
      toast.success('Booking status updated successfully!');
    } catch (err) {
      toast.error('Error updating booking status: ' + err.message);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'confirmed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-orange-100 text-orange-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      <div className="min-h-[500px] flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-400 animate-ping"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium animate-pulse">Loading vehicle bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Bookings</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchBookings}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Vehicle Bookings
            </h1>
            <p className="text-blue-100 text-lg">Manage and track all vehicle reservations</p>
          </div>
          <button
            onClick={fetchBookings}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          Search & Filter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Bookings</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by booking ID, customer, or vehicle..."
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="pending">⏳ Pending</option>
              <option value="in-progress">🚗 In Progress</option>
              <option value="completed">✅ Completed</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { status: 'all', label: 'Total', icon: '📊', color: 'from-blue-500 to-blue-600' },
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
              className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/50 ${
                isActive ? 'ring-4 ring-white/70 scale-105' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold mb-1">{count}</div>
                  <div className="text-sm opacity-90">{label}</div>
                </div>
                <div className="text-2xl opacity-80">{icon}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modern Bookings Cards */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-500">No bookings match your current search criteria.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:scale-[1.02]">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Left Section - Booking Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Vehicle Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {booking.vehicleImage ? (
                          <img 
                            src={booking.vehicleImage} 
                            alt={booking.vehicleName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{booking.vehicleName}</h3>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(booking.bookingStatus)}`}>
                            {booking.bookingStatus}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Booking ID</p>
                            <p className="font-semibold text-gray-800">{booking.bookingId}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Customer</p>
                            <p className="font-semibold text-gray-800">{booking.userName}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Location</p>
                            <p className="font-semibold text-gray-800">{booking.vehicleLocation}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="font-semibold text-gray-800">{booking.duration.days} day{booking.duration.days > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dates */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-gray-600">From:</span>
                          <span className="font-semibold">{formatDate(booking.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-gray-600">To:</span>
                          <span className="font-semibold">{formatDate(booking.endDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Section - Payment & Actions */}
                  <div className="lg:w-80 space-y-4">
                    {/* Payment Info */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total Amount</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {formatCurrency(booking.pricing.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        via {booking.paymentMethod?.toUpperCase()}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {booking.bookingStatus === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookingStatus(booking.bookingId, 'confirmed')}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                          >
                            ✅ Confirm
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Cancellation reason:');
                              if (reason !== null) {
                                updateBookingStatus(booking.bookingId, 'cancelled', reason);
                              }
                            }}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      )}
                      {booking.bookingStatus === 'confirmed' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookingStatus(booking.bookingId, 'in-progress')}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                          >
                            🚗 Start Trip
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.bookingId, 'completed')}
                            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                          >
                            ✅ Complete
                          </button>
                        </div>
                      )}
                      {booking.bookingStatus === 'in-progress' && (
                        <button
                          onClick={() => updateBookingStatus(booking.bookingId, 'completed')}
                          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                          🎉 Complete Trip
                        </button>
                      )}
                      {(booking.bookingStatus === 'completed' || booking.bookingStatus === 'cancelled') && (
                        <div className="text-center py-2 text-gray-500 font-medium">
                          {booking.bookingStatus === 'completed' ? '🎉 Trip Completed' : '❌ Booking Cancelled'}
                        </div>
                      )}
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
        <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
          <p className="text-gray-600">
            Showing <span className="font-bold text-indigo-600">{filteredBookings.length}</span> of <span className="font-bold text-indigo-600">{bookings.length}</span> bookings
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingDataComponent;
