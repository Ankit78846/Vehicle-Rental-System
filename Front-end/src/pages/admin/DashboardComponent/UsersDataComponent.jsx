import { useState, useEffect, useRef } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import toast,{ Toaster } from "react-hot-toast";
import { getApiUrl, getProfileImageUrl } from "../../../config/api";
// UserDetailModal component

function UserDetailModal({ user, onClose, onUserUpdate }) {
  const defaultProfileImg = "https://imgs.search.brave.com/XfEYZ8GiGdxGCdS_JsblVMJV7ufqdKMwU1a9uPFGtjg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvNS9Qcm9m/aWxlLVBORy1GcmVl/LUltYWdlLnBuZw";
  
  if (!user) return null;

  const handleVerificationToggle = async () => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) {
      toast.error("Login required. Please log in as admin first.");
      return;
    }

    try {
      const newVerifiedStatus = !user.isVerified;
      
      const response = await fetch(getApiUrl(`api/fetch/users/verify/${user._id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verified: newVerifiedStatus })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Verification status updated successfully");
        // Call the callback to refresh the user data
        if (onUserUpdate) {
          onUserUpdate();
        }
        onClose(); // Close the modal to refresh the view
      } else {
        toast.error(data.message || "Failed to update verification status");
      }
    } catch (err) {
      console.error('Verification error details:', err);
      
      // Handle specific error types
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        toast.error("Network error. Please check if the server is running.");
      } else if (err.message.includes('Network Error')) {
        toast.error("Network error. Please check if the server is running.");
      } else {
        toast.error("Error updating verification status. Please try again.");
      }
    }
  };
  
  // Handle different image URL formats
  const getImageUrl = (imgUrl) => {
    if (!imgUrl) return defaultProfileImg;
    return getProfileImageUrl(imgUrl) || defaultProfileImg;
  };

  // Handle license image URL construction
  const getLicenseImageUrl = (licenseImg) => {
    if (!licenseImg) return null;
    return getProfileImageUrl(licenseImg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700">&times;</button>
        
        <div className="flex flex-col gap-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center gap-4">
            <img 
              src={getImageUrl(user.imgUrl)} 
              alt={user.name} 
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                e.target.src = defaultProfileImg;
              }}
            />
            <h2 className="text-xl font-bold">{user.name}</h2>
          </div>

          {/* User Information */}
          <div className="w-full text-left space-y-2">
            <div><span className="font-semibold">Email:</span> {user.email}</div>
            <div><span className="font-semibold">Phone:</span> {user.phone || 'Not provided'}</div>
            <div><span className="font-semibold">User Type:</span> {user.type || 'User'}</div>
            <div><span className="font-semibold">Status:</span> {user.isActive ? 'Active' : 'Inactive'}</div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Verification Status:</span> 
              {user.isVerified ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  ✗ Not Verified
                </span>
              )}
            </div>
            {user.isVerified && user.verifiedAt && (
              <div><span className="font-semibold">Verified At:</span> {new Date(user.verifiedAt).toLocaleDateString()}</div>
            )}
            {user.isVerified && user.verifiedBy && (
              <div><span className="font-semibold">Verified By:</span> {user.verifiedBy}</div>
            )}
            <div><span className="font-semibold">Created At:</span> {new Date(user.createdAt).toLocaleDateString()}</div>
            <div><span className="font-semibold">Last Active:</span> {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</div>
            <div><span className="font-semibold">ID:</span> {user._id}</div>
          </div>

          {/* Verification Action Button */}
          <div className="w-full border-t pt-4">
            <div className="flex justify-center">
              <button
                onClick={handleVerificationToggle}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  user.isVerified 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                }`}
              >
                {user.isVerified ? (
                  <>
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Revoke Verification
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Verify User
                  </>
                )}
              </button>
            </div>
          </div>

          {/* License Images Section */}
          {(user.licenseFront || user.licenseBack) && (
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Driving License</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* License Front */}
                {user.licenseFront && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600">Front Side</h4>
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={getLicenseImageUrl(user.licenseFront)} 
                        alt="License Front" 
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0OEw4NyA3MkwxMTMgNzJMMTEzIDQ4TDg3IDQ4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
                        }}
                        onClick={() => {
                          // Open image in new tab for full view
                          window.open(getLicenseImageUrl(user.licenseFront), '_blank');
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* License Back */}
                {user.licenseBack && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600">Back Side</h4>
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={getLicenseImageUrl(user.licenseBack)} 
                        alt="License Back" 
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0OEw4NyA3MkwxMTMgNzJMMTEzIDQ4TDg3IDQ4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
                        }}
                        onClick={() => {
                          // Open image in new tab for full view
                          window.open(getLicenseImageUrl(user.licenseBack), '_blank');
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Show message if only one side is uploaded */}
                {(user.licenseFront && !user.licenseBack) && (
                  <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Back side not uploaded</p>
                    </div>
                  </div>
                )}
                
                {(!user.licenseFront && user.licenseBack) && (
                  <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Front side not uploaded</p>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Click on images to view in full size
              </p>
            </div>
          )}

          {/* No License Message */}
          {!user.licenseFront && !user.licenseBack && (
            <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-yellow-700">
                  No driving license images uploaded
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UsersDataComponent() {
    const [showDropdown, setShowDropdown] = useState(null);
    const [users, setUsers] = useState([]); // State to hold user data
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showDeletePopover, setShowDeletePopover] = useState(null); // index of row for popover
    const [viewUser, setViewUser] = useState(null); // user to view in modal
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef();

    useEffect(()=>{
        fetchUsers();
    },[])

    // Filter users based on status and search term
    useEffect(() => {
        let filtered = [...users];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user._id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by verification status
        if (filterStatus !== 'all') {
            if (filterStatus === 'verified') {
                filtered = filtered.filter(user => user.isVerified);
            } else if (filterStatus === 'unverified') {
                filtered = filtered.filter(user => !user.isVerified);
            } else if (filterStatus === 'host') {
                filtered = filtered.filter(user => user.userType === 'host');
            } else if (filterStatus === 'customer') {
                filtered = filtered.filter(user => user.userType === 'customer');
            }
        }

        setFilteredUsers(filtered);
    }, [users, filterStatus, searchTerm]);

    const fetchUsers = () => {
        axios.get(getApiUrl("api/fetch/users"))
        .then(res=>setUsers(res.data.reverse()))
        .catch(err=>toast.error("Error fetching users:", err));
    };

    // Close dropdown and popover on outside click
    useEffect(() => {
      function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          
          setShowDropdown(null);
          setShowDeletePopover(null);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  
    // Delete logic for user
    const handleDeleteClick = (user, index) => {
        setUserToDelete(user);
        setShowDeletePopover(index);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
        if (!token) {
            toast.error("Login required.");
            setShowDeletePopover(null);
            return;
        }
        try {
            const response = await axios.delete(getApiUrl(`api/fetch/users/delete-user/${userToDelete._id}`), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                toast.success(response.data.message || "User deleted successfully");
                // Refresh users
                fetchUsers();
            } else {
                toast.error(response.data.message || "Failed to delete user");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Error deleting user");
        } finally {
            setShowDropdown(null);
            setShowDeletePopover(null);
            setUserToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDropdown(null);
        setShowDeletePopover(null);
        setUserToDelete(null);
    };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Users Management
            </h1>
            <p className="text-blue-100 text-lg">Manage and verify platform users</p>
          </div>
          <button
            onClick={fetchUsers}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search & Filter Users
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
          >
            <option value="all">All Users</option>
            <option value="verified">✅ Verified</option>
            <option value="unverified">❌ Unverified</option>
            <option value="host">🏠 Hosts</option>
            <option value="customer">👤 Customers</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/50 ${
            filterStatus === 'all' ? 'ring-4 ring-white/70 scale-105' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">{users.length}</div>
              <div className="text-sm opacity-90">Total Users</div>
            </div>
            <svg className="text-2xl opacity-80 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          </div>
        </button>
        
        <button
          onClick={() => setFilterStatus('verified')}
          className={`bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/50 ${
            filterStatus === 'verified' ? 'ring-4 ring-white/70 scale-105' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">{users.filter(u => u.isVerified).length}</div>
              <div className="text-sm opacity-90">Verified</div>
            </div>
            <svg className="text-2xl opacity-80 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>
        </button>
        
        <button
          onClick={() => setFilterStatus('unverified')}
          className={`bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/50 ${
            filterStatus === 'unverified' ? 'ring-4 ring-white/70 scale-105' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">{users.filter(u => !u.isVerified).length}</div>
              <div className="text-sm opacity-90">Unverified</div>
            </div>
            <svg className="text-2xl opacity-80 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
            </svg>
          </div>
        </button>
        
        <button
          onClick={() => setFilterStatus('host')}
          className={`bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/50 ${
            filterStatus === 'host' ? 'ring-4 ring-white/70 scale-105' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">{users.filter(u => u.userType === 'host').length}</div>
              <div className="text-sm opacity-90">Hosts</div>
            </div>
            <svg className="text-2xl opacity-80 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
          </div>
        </button>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">{filteredUsers.length}</div>
              <div className="text-sm opacity-90">Filtered</div>
            </div>
            <svg className="text-2xl opacity-80 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className='w-full'>
              <thead>
           <tr className="text-left text-sm font-medium text-gray-500 border-b bg-gray-50">
              <th className="pb-3 px-4 py-4">Profile</th>
              <th className="pb-3 px-4 py-4">User Id</th>
              <th className="pb-3 px-4 py-4">Name</th>
              <th className="pb-3 px-4 py-4">Email</th>
              <th className="pb-3 px-4 py-4">User type</th>
              <th className="pb-3 px-4 py-4">Verification</th>
              <th className="pb-3 px-4 py-4">License Status</th>
              <th className="pb-3 px-4 py-4">Created At</th>
              <th className="pb-3 px-4 py-4">Action</th>
            </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No users found</h3>
                      <p className="text-gray-500">No users match your current search criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user,index)=>{
                const defaultProfileImg = "https://imgs.search.brave.com/XfEYZ8GiGdxGCdS_JsblVMJV7ufqdKMwU1a9uPFGtjg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvNS9Qcm9m/aWxlLVBORy1GcmVl/LUltYWdlLnBuZw";
                
                const getImageUrl = (imgUrl) => {
                  if (!imgUrl) return defaultProfileImg;
                  return getProfileImageUrl(imgUrl) || defaultProfileImg;
                };

                return (
            <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-100">
            <td className="py-4 px-4">
              <img 
                src={getImageUrl(user.imgUrl)} 
                alt={user.name} 
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  e.target.src = defaultProfileImg;
                }}
              />
            </td>
            <td className="py-4 px-4 text-sm text-gray-600 
            ">{user._id}</td>
            <td className="py-4 px-4 text-sm text-gray-600">{user.name} </td>
            <td className="py-4 px-4 text-sm text-gray-600"> {user.email}</td>
            <td className="py-4 px-4 text-sm text-gray-600">{user.type || 'User'} </td>
            <td className="py-4 px-4 text-sm">
              {user.isVerified ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  ⏳ Pending
                </span>
              )}
            </td>
            <td className="py-4 px-4 text-sm">
              {user.licenseFront && user.licenseBack ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Complete
                </span>
              ) : user.licenseFront || user.licenseBack ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⚠ Partial
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  ✗ Missing
                </span>
              )}
            </td>
            <td className="py-4 px-4 text-sm text-gray-600"> {new Date(user.createdAt).toLocaleDateString()}</td>
            <td className="py-4 px-4">
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                    className="p-1 hover:bg-gray-100 rounded "
                  >
                    <BsThreeDotsVertical className="text-gray-600" />
                  </button>

                  {showDropdown === index && (
                    <div ref={dropdownRef} className="absolute right-0 top-8 w-60 border  border-gray-200 rounded-lg bg-white shadow-lg z-20">
                      {showDeletePopover === index ? (
                        <div className="p-4 w-fit">
                          <h2 className="text-base font-bold mb-2 text-center">Confirm Deletion</h2>
                          <p className="mb-4 text-center text-xs">Are you sure you want to delete <span className="font-semibold">{userToDelete?.name}</span>? This action cannot be undone.</p>
                          <div className="flex justify-center gap-2">
                            <button onClick={handleDeleteCancel} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-xs">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">Delete</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => setViewUser(user)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-200 hover:rounded-t-lg">
                            View Detail
                          </button>
                          <button onClick={() => handleDeleteClick(user, index)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-200 hover:rounded-b-lg">
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}    
                  </div>
            </td>
                </tr>
                );
              })
                )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Results Summary */}
      {filteredUsers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
          <p className="text-gray-600">
            Showing <span className="font-bold text-indigo-600">{filteredUsers.length}</span> of <span className="font-bold text-indigo-600">{users.length}</span> users
          </p>
        </div>
      )}
      
      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} onUserUpdate={fetchUsers} />}
    </div>
  )
}

export default UsersDataComponent;
