import React, { useState, useEffect } from 'react';
import { getApiUrl, getImageUrl } from '../../../config/api';
import { FaCalendarAlt, FaCar, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import { MdCancel, MdCheckCircle, MdAccessTime, MdClose, MdCheck } from 'react-icons/md';

const CancelRequestsComponent = () => {
  const [cancelRequests, setCancelRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter requests based on status and search term
  useEffect(() => {
    let filtered = [...cancelRequests];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status (for future status filtering if needed)
    if (filterStatus !== 'all') {
      // Add status filtering logic here if different types of cancel requests exist
      // For now, all are pending cancellation requests
    }

    setFilteredRequests(filtered);
  }, [cancelRequests, filterStatus, searchTerm]);

  // Fetch cancel requests from API
  const fetchCancelRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No admin token found. Please log in as admin.');
      }
      
      const apiUrl = getApiUrl('api/bookings/admin/cancel-requests');
      console.log('🔗 Fetching cancel requests from:', apiUrl);
      
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
        console.error('❌ Failed to fetch cancel requests:', response.status, errorText);
        throw new Error(`Failed to fetch cancel requests: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Received cancel requests:', data.count || 0, 'requests');
      
      setCancelRequests(data.data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching cancel requests:', err);
      setError('Error fetching cancel requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Process cancel request (approve or reject)
  const processCancelRequest = async (bookingId, action, adminNotes = '') => {
    try {
      setProcessingBookingId(bookingId);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No admin token found. Please log in as admin.');
      }
      
      const apiUrl = getApiUrl(`api/bookings/${bookingId}/cancel-request/${action}`);
      console.log(`🔄 ${action === 'approve' ? 'Approving' : 'Rejecting'} cancel request for booking:`, bookingId);
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adminNotes: adminNotes
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to ${action} cancel request:`, response.status, errorText);
        throw new Error(`Failed to ${action} cancel request: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Cancel request ${action}d successfully`);
      
      // Refresh the cancel requests list
      fetchCancelRequests();
      
      alert(`✅ Cancellation request ${action}d successfully!`);
      
      return data;
    } catch (err) {
      console.error(`❌ Error ${action}ing cancel request:`, err);
      alert(`❌ Failed to ${action} cancel request: ` + err.message);
      throw err;
    } finally {
      setProcessingBookingId(null);
    }
  };

  // Handle approve with confirmation
  const handleApprove = async (booking) => {
    const adminNotes = prompt(
      `Approve cancellation for ${booking.vehicleName}?\n\n` +
      `Booking ID: ${booking.bookingId}\n` +
      `Customer: ${booking.userName} (${booking.userEmail})\n` +
      `Reason: ${booking.cancelRequest.reason}\n\n` +
      `Admin notes (optional):`,
      'Approved as per policy'
    );
    
    if (adminNotes !== null) { // User clicked OK
      try {
        await processCancelRequest(booking.bookingId, 'approve', adminNotes || '');
      } catch (err) {
        // Error already handled in processCancelRequest
        console.error('Error approving cancellation:', err);
      }
    }
  };

  // Handle reject with confirmation
  const handleReject = async (booking) => {
    const adminNotes = prompt(
      `Reject cancellation for ${booking.vehicleName}?\n\n` +
      `Booking ID: ${booking.bookingId}\n` +
      `Customer: ${booking.userName} (${booking.userEmail})\n` +
      `Reason: ${booking.cancelRequest.reason}\n\n` +
      `Please provide reason for rejection:`,
      'Does not meet cancellation policy'
    );
    
    if (adminNotes !== null) { // User clicked OK
      if (!adminNotes.trim()) {
        alert('Please provide a reason for rejection.');
        return;
      }
      try {
        await processCancelRequest(booking.bookingId, 'reject', adminNotes);
      } catch (err) {
        // Error already handled in processCancelRequest
        console.error('Error rejecting cancellation:', err);
      }
    }
  };

  useEffect(() => {
    fetchCancelRequests();
  }, []);

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
      <div className="min-h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading cancel requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MdCancel className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Cancel Requests</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchCancelRequests}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Cancellation Requests</h1>
            <p className="text-orange-100">Review and process customer cancellation requests</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <div className="text-2xl font-bold">{cancelRequests.length}</div>
              <div className="text-sm opacity-90">Total Requests</div>
            </div>
            <button
              onClick={fetchCancelRequests}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 border border-white/20"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Requests
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by booking ID, customer, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
          />
          <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/50 ${
            filterStatus === 'all' ? 'ring-4 ring-white/70 scale-105' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">{cancelRequests.length}</div>
              <div className="text-sm opacity-90">Total Requests</div>
            </div>
            <MdCancel className="text-2xl opacity-80" />
          </div>
        </button>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">{filteredRequests.length}</div>
              <div className="text-sm opacity-90">Filtered Results</div>
            </div>
            <svg className="text-2xl opacity-80 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">
                {cancelRequests.reduce((sum, req) => sum + (req.pricing?.totalAmount || 0), 0).toLocaleString('en-NP')}
              </div>
              <div className="text-sm opacity-90">Total Amount (NPR)</div>
            </div>
            <FaMoneyBillWave className="text-2xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Cancel Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MdCheckCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {cancelRequests.length === 0 ? 'No Pending Cancel Requests' : 'No Matching Results'}
          </h3>
          <p className="text-gray-500">
            {cancelRequests.length === 0 
              ? 'All cancellation requests have been processed or there are no new requests.'
              : 'No cancel requests match your current search criteria.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRequests.map((booking) => (
            <div key={booking._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* Left Section - Booking Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                      {/* Vehicle Image */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {booking.vehicleImage ? (
                          <img 
                            src={getImageUrl(booking.vehicleImage)} 
                            alt={booking.vehicleName}
                            className="w-full h-full object-cover"
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
                      
                      {/* Vehicle & Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{booking.vehicleName}</h3>
                          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                            <MdAccessTime className="w-4 h-4 mr-1" />
                            Cancellation Pending
                          </span>
                        </div>
                        
                        {/* Booking Info Grid */}
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
                            <span className="text-gray-500">Amount:</span>
                            <span className="font-semibold text-gray-800">{formatCurrency(booking.pricing.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Dates */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
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

                    {/* Customer Details */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Customer Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <FaUser className="w-4 h-4 text-gray-500" />
                          <span>{booking.userName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="w-4 h-4 text-gray-500" />
                          <span className="truncate">{booking.userEmail}</span>
                        </div>
                        {booking.userPhone && (
                          <div className="flex items-center gap-2">
                            <FaPhone className="w-4 h-4 text-gray-500" />
                            <span>{booking.userPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Section - Cancel Request Details & Actions */}
                  <div className="lg:w-80 space-y-4">
                    {/* Cancel Request Info */}
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Cancellation Request</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-gray-600">Requested:</span>
                          <div className="font-semibold text-gray-800">{formatDate(booking.cancelRequest.requestedAt)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Reason:</span>
                          <div className="font-semibold text-gray-800 bg-white rounded-lg p-2 mt-1 border">
                            {booking.cancelRequest.reason}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                          {formatCurrency(booking.pricing.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          Paid via {booking.paymentMethod?.toUpperCase() || 'N/A'}
                        </div>
                        <div>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleApprove(booking)}
                        disabled={processingBookingId === booking.bookingId}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        {processingBookingId === booking.bookingId ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <MdCheck className="w-5 h-5" />
                            Approve Cancellation
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleReject(booking)}
                        disabled={processingBookingId === booking.bookingId}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        {processingBookingId === booking.bookingId ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <MdClose className="w-5 h-5" />
                            Reject Request
                          </>
                        )}
                      </button>
                    </div>

                    {/* Request Timestamp */}
                    <div className="text-center text-xs text-gray-500">
                      Request submitted {formatDate(booking.cancelRequest.requestedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CancelRequestsComponent;
