import {useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddVehicleForm from './AddVehicleForm.jsx';



function AddVehiclePage() {

    const navigate = useNavigate();

      useEffect(() => {
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    if (!name || !email || !token) {
      toast.error("You must be logged in. Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } else {
      toast.success(`Welcome back, ${name}!`);
    }
  }, [navigate]);

  const handleVehicleSubmit = (vehicleData) => {
    // This callback is executed after successful vehicle creation
    console.log("Vehicle added successfully:", vehicleData);
    
    // Optional: Navigate to a different page after successful addition
    setTimeout(() => {
      toast.success("Redirecting to dashboard...");
      navigate("/dashboard"); // or wherever you want to redirect
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Vehicle</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Fill in the details below to add a new vehicle to the rental system.
                </p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <AddVehicleForm onSubmit={handleVehicleSubmit} />
        </div>
      </div>
    </div>
  )
}

export default AddVehiclePage
