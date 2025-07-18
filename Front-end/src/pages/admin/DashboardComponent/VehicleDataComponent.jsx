import { useState, useEffect } from 'react';
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import EditVehicleForm from './EditVehiclePage'; // Reusable Add/Edit form

export default function VehicleDataComponent() {

  const [vehicles, setVehicles] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [showDeletePopover, setShowDeletePopover] = useState(null); // index of row for popover
  // const [deletePopoverPosition, setDeletePopoverPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = () => {
    axios.get("http://localhost:3001/api/vehicles")
      .then(res => setVehicles(res.data.reverse()))
      .catch(err => toast.error("Error fetching vehicles",err));
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
        `http://localhost:3001/api/update-vehicle`,
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
      const response = await axios.delete(`http://localhost:3001/api/delete-vehicle/${vehicleToDelete._id}`, {
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
    <div className="overflow-x-auto">
      <Toaster />
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm font-medium text-gray-500 border-b">
            <th className="pb-3 px-4">Vehicle ID</th>
            <th className="pb-3 px-4">Name</th>
            <th className="pb-3 px-4">Type</th>
            <th className="pb-3 px-4">Location</th>
            <th className="pb-3 px-4">Price</th>
            <th className="pb-3 px-4">Created By</th>
            <th className="pb-3 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle, index) => (
            <tr key={vehicle._id} className="border-b border-gray-100 hover:bg-gray-100">
              <td className="py-4 px-4 text-sm text-gray-600">{vehicle._id}</td>
              <td className="py-4 px-4 text-sm text-gray-600">{vehicle.name}</td>
              <td className="py-4 px-4 text-sm text-gray-600">{vehicle.type}</td>
              <td className="py-4 px-4 text-sm text-gray-600">{vehicle.location}</td>
              <td className="py-4 px-4 text-sm text-gray-800 font-medium">Rs {vehicle.price}</td>
              <td className="py-4 px-4 text-sm text-gray-600">{vehicle.createdBy}</td>
              <td className="py-4 px-4">
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <BsThreeDotsVertical className="text-gray-600" />
                  </button>
                  {showDropdown === index && (
                    <div className="absolute right-19 top-2 w-60 border bg-white border-gray-200 rounded-lg shadow-lg z-20">
                      {showDeletePopover === index ? (
                        <div className="p-4 w-fit">
                          <h2 className="text-base font-bold mb-2 text-center">Confirm Deletion</h2>
                          <p className="mb-4 text-center text-xs">Are you sure you want to delete <span className="font-semibold">{vehicleToDelete?.name}</span>? This action cannot be undone.</p>
                          <div className="flex justify-center gap-2">
                            <button onClick={handleDeleteCancel} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-xs">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">Delete</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(vehicle)} 
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteClick(vehicle, index)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

      {/* No global delete modal needed, handled inline in dropdown */}
    </div>
  );
}
