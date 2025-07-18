import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AddVehicle({ onSubmit }) {
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    brand: "",
    price: "",
    location: "",
    seats: "",
    fuelType: "",
    mileage: "",
    transmission: "",
    description: "",
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

  // Cleanup effect to revoke object URLs
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Auth check

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

    if (!formData.seats || parseInt(formData.seats) < 1) newErrors.seats = "Seats must be at least 1.";

    if (!formData.fuelType.trim()) newErrors.fuelType = "Fuel type is required.";

    if (!formData.mileage || parseFloat(formData.mileage) <= 0) newErrors.mileage = "Mileage must be positive.";

    if (!formData.transmission.trim()) newErrors.transmission = "Transmission type is required.";

    if (!image) {
      newErrors.image = "Image is required.";
    } else {
      const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowed.includes(image.type)) {
        newErrors.image = "Invalid image type.";
      } else if (image.size > 5 * 1024 * 1024) {
        newErrors.image = "Image must be < 5MB.";
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

    const name = localStorage.getItem("name") ||localStorage.getItem("adminName");
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

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
      submission.append("seats", formData.seats);
      submission.append("fuelType", formData.fuelType);
      submission.append("mileage", formData.mileage);
      submission.append("transmission", formData.transmission);
      submission.append("description", formData.description);
      submission.append("features", JSON.stringify(formData.features));
      submission.append("vehicleImage", image);
      submission.append("createdBy", name || "admin");

      const res = await fetch("http://localhost:3001/api/add-vehicle", {
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
          seats: "",
          fuelType: "",
          mileage: "",
          transmission: "",
          description: "",
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
    <div className="p-6 max-w-5xl mx-auto">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Add Vehicle</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Vehicle Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["name", "type", "brand", "price", "location"].map((field) => (
            <div key={field}>
              {field === "type" ? (
                <select
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="two-wheeler">Two Wheeler</option>
                  <option value="car">Car</option>
                  <option value="truck">Truck</option>
                  <option value="pickup">Pickup</option>
                  <option value="bus">Bus</option>
                </select>
              ) : (
                <input
                  type={field === "price" ? "number" : "text"}
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  required
                  step={field === "price" ? "1" : undefined}
                  min={field === "price" ? "0" : undefined}
                />
              )}
              {errors[field] && (
                <p className="text-red-500 text-sm">{errors[field]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Vehicle Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <input
              type="number"
              name="seats"
              placeholder="Number of Seats"
              value={formData.seats}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
              min="1"
              max="50"
            />
            {errors.seats && (
              <p className="text-red-500 text-sm">{errors.seats}</p>
            )}
          </div>
          
          <div>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select Fuel Type</option>
              <option value="Gas">Gas</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            {errors.fuelType && (
              <p className="text-red-500 text-sm">{errors.fuelType}</p>
            )}
          </div>

          <div>
            <input
              type="number"
              name="mileage"
              placeholder="Mileage (MPG)"
              value={formData.mileage}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
              min="1"
              step="0.1"
            />
            {errors.mileage && (
              <p className="text-red-500 text-sm">{errors.mileage}</p>
            )}
          </div>

          <div>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select Transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
            {errors.transmission && (
              <p className="text-red-500 text-sm">{errors.transmission}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="border p-2 rounded w-full h-28"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Image *
          </label>
          
          <input
            type="file"
            id="vehicleImage"
            name="vehicleImage"
            accept="image/*"
            onChange={handleImageChange}
            className="border p-2 rounded w-full"
            required
          />
          
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image}</p>
          )}
          
          {image && (
            <p className="text-green-600 text-sm mt-1">
              Selected: {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          
          {/* Image Preview Section */}
          {imagePreview && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">Preview:</h4>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 relative">
                <img
                  src={imagePreview}
                  alt="Vehicle preview"
                  className="max-w-full h-48 object-cover rounded-lg mx-auto shadow-md"
                />
                <p className="text-center text-sm text-gray-500 mt-2">
                  Vehicle image preview
                </p>
              </div>
            </div>
          )}
          
          {/* Upload Instructions */}
          {!imagePreview && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-700">
                  Upload a clear, high-quality image of your vehicle. Supported formats: JPG, PNG. Max size: 5MB.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Vehicle Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.keys(formData.features).map((category) => (
              <div key={category} className="border rounded-lg p-4">
                <h4 className="font-bold mb-3 text-center bg-gray-100 py-2 rounded">
                  {category}
                </h4>
                {formData.features[category].map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        handleFeatureChange(category, index, e.target.value)
                      }
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                      placeholder={`Feature ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(category, index)}
                      className="text-red-500 hover:text-red-700 px-2"
                      title="Remove feature"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addFeature(category)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
                >
                  + Add Feature
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 rounded font-bold text-white py-2 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Adding Vehicle..." : "Add Vehicle"}
        </button>
      </form>
    </div>
  );
}
