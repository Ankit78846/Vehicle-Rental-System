import { useState, useEffect, useRef } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import toast,{ Toaster } from "react-hot-toast";
// UserDetailModal component
function UserDetailModal({ user, onClose }) {
  const defaultProfileImg = "https://imgs.search.brave.com/XfEYZ8GiGdxGCdS_JsblVMJV7ufqdKMwU1a9uPFGtjg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvNS9Qcm9m/aWxlLVBORy1GcmVl/LUltYWdlLnBuZw";
  
  if (!user) return null;
  
  // Handle different image URL formats
  const getImageUrl = (imgUrl) => {
    console.log("User image URL:", imgUrl); // Debug log
    if (!imgUrl) return defaultProfileImg;
    if (imgUrl.startsWith('http')) return imgUrl;
    // For profile images, they're stored as filenames and need the full path
    const fullUrl = `http://localhost:3001/uploads/profiles/${imgUrl}`;
    console.log("Constructed profile image URL:", fullUrl); // Debug log
    return fullUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700">&times;</button>
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
          <div className="w-full text-left space-y-2">
            <div><span className="font-semibold">Email:</span> {user.email}</div>
            <div><span className="font-semibold">User Type:</span> {user.type || 'User'}</div>
            <div><span className="font-semibold">Created At:</span> {new Date(user.createdAt).toLocaleDateString()}</div>
            <div><span className="font-semibold">Last Active:</span> {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</div>
            <div><span className="font-semibold">ID:</span> {user._id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersDataComponent() {
    const [showDropdown, setShowDropdown] = useState(null);
    const [users, setUsers] = useState([]); // State to hold user data
    const [userToDelete, setUserToDelete] = useState(null);
    const [showDeletePopover, setShowDeletePopover] = useState(null); // index of row for popover
    const [viewUser, setViewUser] = useState(null); // user to view in modal
    const dropdownRef = useRef();

    useEffect(()=>{
        axios.get("http://localhost:3001/api/fetch/users")
        .then(res=>setUsers(res.data.reverse()))
        .catch(err=>toast.error("Error fetching users:", err));

    },[])

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
            const response = await axios.delete(`http://localhost:3001/api/fetch/users/delete-user/${userToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                toast.success(response.data.message || "User deleted successfully");
                // Refresh users
                axios.get("http://localhost:3001/api/fetch/users")
                  .then(res=>setUsers(res.data.reverse()))
                  .catch(err=>toast.error("Error fetching users:", err));
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
    <div className="overflow-x-auto">
      <Toaster />
        <table className='w-full'>
            <thead>
         <tr className="text-left text-sm font-medium text-gray-500 border-b">
            <th className="pb-3 px-4">Profile</th>
            <th className="pb-3 px-4">User Id</th>
            <th className="pb-3 px-4">Name</th>
            <th className="pb-3 px-4">Email</th>
            <th className="pb-3 px-4">User type</th>
            <th className="pb-3 px-4">Created At</th>
            <th className="pb-3 px-4">Last Active</th>
            <th className="pb-3 px-4">Action</th>
          </tr>
            </thead>
            <tbody>
              {users.map((user,index)=>{
                const defaultProfileImg = "https://imgs.search.brave.com/XfEYZ8GiGdxGCdS_JsblVMJV7ufqdKMwU1a9uPFGtjg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvNS9Qcm9m/aWxlLVBORy1GcmVl/LUltYWdlLnBuZw";
                
                const getImageUrl = (imgUrl) => {
                  console.log("Table row - User image URL:", imgUrl); // Debug log
                  if (!imgUrl) return defaultProfileImg;
                  if (imgUrl.startsWith('http')) return imgUrl;
                  // For profile images, they're stored as filenames and need the full path
                  const fullUrl = `http://localhost:3001/uploads/profiles/${imgUrl}`;
                  console.log("Table row - Constructed profile image URL:", fullUrl); // Debug log
                  return fullUrl;
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
            <td className="py-4 px-4 text-sm text-gray-600">{user._id}</td>
            <td className="py-4 px-4 text-sm text-gray-600">{user.name} </td>
            <td className="py-4 px-4 text-sm text-gray-600"> {user.email}</td>
            <td className="py-4 px-4 text-sm text-gray-600">{user.type || 'User'} </td>
            <td className="py-4 px-4 text-sm text-gray-600"> {new Date(user.createdAt).toLocaleDateString()}</td>
            <td className="py-4 px-4 text-sm text-gray-600"> {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
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
              })}
            </tbody>
        </table>
      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />}
    </div>
  )
}

export default UsersDataComponent;
