import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getApiUrl } from "../../config/api";

export default function AddVehicle({ onSubmit }) {
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    brand: "",
    price: "",
    location: "",
    capacity: "",
    fuelType: "",
    mileage: "",
    transmission: "",
    description: "",
    isActive: false,
    features: {
      Safety: [],
      "Device connectivity": [],
      "Additional features": [],
    },
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Helper functions for dynamic labels
  const getMileageLabel = () => {
    return formData.fuelType === "Electric" ? "Range (KM)" : "Mileage (KMPL)";
  };

  const getMileagePlaceholder = () => {
    return formData.fuelType === "Electric" ? "Range in Kilometers" : "Mileage (KMPL)";
  };

  const getSeatsLabel = () => {
    return (formData.type === "pickup" || formData.type === "truck") ? "Capacity" : "Number of Seats";
  };

  const getSeatsPlaceholder = () => {
    return (formData.type === "pickup" || formData.type === "truck") ? "Load Capacity" : "Number of Seats";
  };

  const getMaxCapacity = () => {
    return (formData.type === "pickup" || formData.type === "truck") ? "10000" : "50";
  };

  // Cleanup effect to revoke object URLs
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Check user verification status
  useEffect(() => {
    const checkUserVerification = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      if (!token) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const response = await fetch(getApiUrl("api/fetch/users/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.data || data;
          setUserProfile(userData);
          
          // Check if user is verified (has license and profile complete)
          const hasCompleteProfile = userData.name && userData.email;
          const hasLicense = userData.licenseFront && userData.licenseBack;
          const isUserVerified = userData.isVerified || false;
          
          setIsVerified(hasCompleteProfile && hasLicense && isUserVerified);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    checkUserVerification();
  }, []);

  const validate = () => {
    const newErrors = {};
    const startsWithNumber = (value) => /^\d/.test(value);

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    else if (startsWithNumber(formData.name)) newErrors.name = "Must not start with number.";

    if (!formData.type.trim()) newErrors.type = "Type is required.";
    else if (startsWithNumber(formData.type)) newErrors.type = "Must not start with number.";

    if (!formData.brand.trim()) newErrors.brand = "Brand is required.";
    else if (startsWithNumber(formData.brand)) newErrors.brand = "Must not start with number.";

    if (!formData.price || parseFloat(formData.price) <= 1) newErrors.price = "Price must be positive.";

    if (!formData.location.trim()) newErrors.location = "Location is required.";

    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      if (formData.type === "pickup" || formData.type === "truck") {
        newErrors.capacity = "Capacity must be at least 1.";
      } else {
        newErrors.capacity = "Seats must be at least 1.";
      }
    } else if (formData.type === "pickup" || formData.type === "truck") {
      if (parseInt(formData.capacity) > 10000) {
        newErrors.capacity = "Capacity cannot exceed 10000 for trucks and pickups.";
      }
    } else if (parseInt(formData.capacity) > 50) {
      newErrors.capacity = "Seats cannot exceed 50 for passenger vehicles.";
    }

    if (!formData.fuelType.trim()) newErrors.fuelType = "Fuel type is required.";

    if (!formData.mileage || parseFloat(formData.mileage) <= 0) {
      if (formData.fuelType === "Electric") {
        newErrors.mileage = "Range must be positive.";
      } else {
        newErrors.mileage = "Mileage must be positive.";
      }
    }

    if (!formData.transmission.trim()) newErrors.transmission = "Transmission type is required.";

    if (!image) {
      newErrors.image = "Image is required.";
    } else {
      const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowed.includes(image.type)) {
        newErrors.image = "Invalid image type.";
      } else if (image.size > 10 * 1024 * 1024) {
        newErrors.image = "Image must be < 10MB.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    
    // Create preview URL
    if (file) {
      // Clean up previous preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById("vehicleImage");
    if (fileInput) fileInput.value = "";
    // Clear any image-related errors
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: undefined
      }));
    }
  };

  const handleFeatureChange = (category, index, value) => {
    const updated = [...formData.features[category]];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [category]: updated,
      },
    }));
  };

  const addFeature = (category) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [category]: [...prev.features[category], ""],
      },
    }));
  };

  const removeFeature = (category, index) => {
    const updated = formData.features[category].filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [category]: updated,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = localStorage.getItem("name") || localStorage.getItem("adminName");
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    const userId = localStorage.getItem("userId") 

    if (!name || !token ) {
      toast.error("Login required.");
      return;
    }

    if (!validate()) return;
    setLoading(true);

    try {
      const submission = new FormData();
      submission.append("name", formData.name);
      submission.append("type", formData.type);
      submission.append("brand", formData.brand);
      submission.append("price", formData.price);
      submission.append("location", formData.location);
      submission.append("capacity", formData.capacity);
      submission.append("fuelType", formData.fuelType);
      submission.append("mileage", formData.mileage);
      submission.append("transmission", formData.transmission);
      submission.append("description", formData.description);
      submission.append("features", JSON.stringify(formData.features));
      submission.append("vehicleImage", image);
      submission.append("createdBy", name || "admin");
      submission.append("createdById", userId || "admin");
      submission.append("userId", userId || "admin");
      submission.append("isActive", formData.isActive);

      const res = await fetch(getApiUrl("api/user/add-vehicle"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submission,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Vehicle added successfully");
        
        // Reset form data
        setFormData({
          name: "",
          type: "",
          brand: "",
          price: "",
          location: "",
          capacity: "",
          fuelType: "",
          mileage: "",
          transmission: "",
          description: "",
          isActive: false,
          features: {
            Safety: [],
            "Device connectivity": [],
            "Additional features": [],
          },
        });
        
        // Clean up image and preview
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setImage(null);
        setImagePreview(null);
        setErrors({});
        
        const fileInput = document.getElementById("vehicleImage");
        if (fileInput) fileInput.value = "";
        
        // Call onSubmit callback if provided
        if (onSubmit) {
          onSubmit(data);
        }
      } else {
        toast.error("Error: " + data.message);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Add Your Vehicle</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            List your vehicle on our platform and start earning. Fill out the details below to get started.
          </p>
        </div>

        {/* Loading State */}
        {isLoadingProfile && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking your profile...</p>
          </div>
        )}

        {/* Verification Check */}
        {!isLoadingProfile && !isVerified && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border-l-4 border-red-500">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-semibold text-red-800 mb-2">Complete Your Profile First</h3>
                <p className="text-red-700 mb-4">
                  To add vehicles to our platform, you need to complete your profile and verify your account.
                  {userProfile && (
                    <span className="block mt-2 text-sm">
                      Welcome, {userProfile.name || 'User'}! Please complete the following steps:
                    </span>
                  )}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <svg className={`w-4 h-4 mr-2 ${userProfile?.name && userProfile?.email ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={userProfile?.name && userProfile?.email ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                    </svg>
                    <span>Complete your profile information (name, email, etc.)</span>
                  </div>
                  <div className="flex items-center">
                    <svg className={`w-4 h-4 mr-2 ${userProfile?.licenseFront && userProfile?.licenseBack ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={userProfile?.licenseFront && userProfile?.licenseBack ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                    </svg>
                    <span>Upload your driving license (front and back)</span>
                  </div>
                  <div className="flex items-center">
                    <svg className={`w-4 h-4 mr-2 ${userProfile?.isVerified ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={userProfile?.isVerified ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                    </svg>
                    <span>Get verified by our admin team</span>
                  </div>
                </div>
                <div className="mt-6">
                  <button 
                    onClick={() => window.location.href = '#profile'}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
                  >
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        {!isLoadingProfile && isVerified && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-8 p-6 md:p-8">
              {/* Vehicle Information */}
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Vehicle Information</h2>
                  <p className="text-gray-600 text-sm">Basic details about your vehicle</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {["name", "brand", "price", "location"].map((field) => (
                    <div key={field} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {field === "price" ? "Price per day (रु)" : field} *
                      </label>
                      <input
                        type={field === "price" ? "number" : "text"}
                        name={field}
                        placeholder={
                          field === "price" 
                            ? "e.g., 2500" 
                            : `Enter vehicle ${field}`
                        }
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        required
                        step={field === "price" ? "1" : undefined}
                        min={field === "price" ? "1" : undefined}
                      />
                      {errors[field] && (
                        <p className="text-red-500 text-sm flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors[field]}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Vehicle Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    >
                      <option value="">Select Vehicle Type</option>
                      <option value="two-wheeler">🏍️ Two Wheeler</option>
                      <option value="car">🚗 Car</option>
                      <option value="truck">🚛 Truck</option>
                      <option value="pickup">🛻 Pickup</option>
                      <option value="bus">🚌 Bus</option>
                    </select>
                    {errors.type && (
                      <p className="text-red-500 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.type}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications */}
              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Vehicle Specifications</h2>
                  <p className="text-gray-600 text-sm">Technical details and performance metrics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getSeatsLabel()} *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      placeholder={getSeatsPlaceholder()}
                      value={formData.capacity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                      min="1"
                      max={getMaxCapacity()}
                    />
                    {(formData.type === "pickup" || formData.type === "truck") && (
                      <p className="text-xs text-gray-500 mt-1">
                        For pickup/truck: Enter load capacity or passenger count (max 10,000)
                      </p>
                    )}
                    {errors.capacity && (
                      <p className="text-red-500 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.capacity}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Fuel Type *</label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    >
                      <option value="">Select Fuel Type</option>
                      <option value="Petrol">⛽ Petrol</option>
                      <option value="Diesel">🚛 Diesel</option>
                      <option value="Electric">🔋 Electric</option>
                      <option value="Hybrid">🌱 Hybrid</option>
                    </select>
                    {errors.fuelType && (
                      <p className="text-red-500 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.fuelType}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getMileageLabel()} *
                    </label>
                    <input
                      type="number"
                      name="mileage"
                      placeholder={getMileagePlaceholder()}
                      value={formData.mileage}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                      min="1"
                      step="0.1"
                    />
                    {formData.fuelType === "Electric" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Electric vehicles: Enter driving range in kilometers
                      </p>
                    )}
                    {errors.mileage && (
                      <p className="text-red-500 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.mileage}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Transmission *</label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    >
                      <option value="">Select Transmission</option>
                      <option value="Automatic">🔄 Automatic</option>
                      <option value="Manual">⚙️ Manual</option>
                    </select>
                    {errors.transmission && (
                      <p className="text-red-500 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.transmission}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-6">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Description</h2>
                  <p className="text-gray-600 text-sm">Tell potential renters about your vehicle</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Vehicle Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe your vehicle's condition, special features, or any important details..."
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Vehicle Image */}
              <div className="space-y-6">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Vehicle Image</h2>
                  <p className="text-gray-600 text-sm">Upload a clear photo of your vehicle</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="file"
                    id="vehicleImage"
                    name="vehicleImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                  
                  {!imagePreview ? (
                    <div 
                      onClick={() => document.getElementById('vehicleImage').click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition duration-200 cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Vehicle Image</h3>
                      <p className="text-gray-600 mb-2">Click to browse or drag and drop</p>
                      <p className="text-sm text-gray-500">Supported formats: JPG, PNG • Max size: 10MB</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Vehicle preview"
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm font-medium">
                          ✓ Image uploaded: {image?.name} ({(image?.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {errors.image && (
                    <p className="text-red-500 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.image}
                    </p>
                  )}
                </div>
              </div>

              {/* Vehicle Features */}
              <div className="space-y-6">
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Vehicle Features</h2>
                  <p className="text-gray-600 text-sm">Add features that make your vehicle stand out</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.keys(formData.features).map((category) => (
                    <div key={category} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-gray-900 text-center py-2 bg-white rounded-lg shadow-sm">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {formData.features[category].map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) =>
                                handleFeatureChange(category, index, e.target.value)
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`${category} feature`}
                            />
                            <button
                              type="button"
                              onClick={() => removeFeature(category, index)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition duration-200"
                              title="Remove feature"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addFeature(category)}
                          className="w-full px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition duration-200 text-sm font-medium"
                        >
                          + Add {category} Feature
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Adding Vehicle...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Vehicle to Platform
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
