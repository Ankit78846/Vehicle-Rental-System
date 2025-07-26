import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaCar, FaClock, FaMapMarkerAlt, FaReceipt, FaEye, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getApiUrl, getImageUrl } from '../config/api';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId'); // Try userId first
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get user ID from multiple possible sources
      const finalUserId = userId || user.id || user._id || user.userId;
      
      if (!token || !finalUserId) {
        setError('Please login to view your booking history');
        return;
      }

      console.log('Fetching bookings for user ID:', finalUserId); // Debug log

      const response = await fetch(getApiUrl(`api/bookings/user/${finalUserId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }

      const data = await response.json();
      console.log('Bookings data received:', data); // Debug log
      setBookings(data.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.bookingStatus?.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your booking history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Bookings</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            to="/login" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Booking History</h1>
          <p className="text-gray-600">View and manage all your vehicle bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.bookingStatus === 'confirmed').length },
                { key: 'pending', label: 'Pending', count: bookings.filter(b => b.bookingStatus === 'pending').length },
                { key: 'completed', label: 'Completed', count: bookings.filter(b => b.bookingStatus === 'completed').length },
                { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.bookingStatus === 'cancelled').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings found.`}
            </p>
            <Link
              to="/browse"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Vehicle Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-lg overflow-hidden bg-gray-100">
                        {booking.vehicleId?.images?.[0] || booking.vehicleImage ? (
                          <img
                            src={getImageUrl(booking.vehicleId?.images?.[0] || booking.vehicleImage)}
                            alt={booking.vehicleName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaCar className="text-2xl" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{booking.vehicleName}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.bookingStatus)}`}>
                              {booking.bookingStatus || 'Unknown'}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <FaReceipt className="text-gray-400" />
                              <span>Booking ID: <span className="font-medium">{booking.bookingId}</span></span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-gray-400" />
                              <span>
                                {formatDate(booking.startDate)} at {formatTime(booking.startTime)} - {formatDate(booking.endDate)} at {formatTime(booking.endTime)}
                              </span>
                            </div>
                            
                            {booking.vehicleId?.location && (
                              <div className="flex items-center gap-2">
                                <FaMapMarkerAlt className="text-gray-400" />
                                <span>{booking.vehicleId.location}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <FaClock className="text-gray-400" />
                              <span>Booked on {formatDate(booking.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="text-right">
                          <div className="mb-4">
                            <div className="text-2xl font-bold text-green-600">
                              रु{booking.pricing?.totalAmount?.toLocaleString() || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">Total Amount</div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Link
                              to={`/bookings/${booking._id}`}
                              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <FaEye className="mr-2" />
                              View Details
                            </Link>
                            
                            {booking.bookingStatus === 'confirmed' && (
                              <button className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                                Contact Support
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
