// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||  'https://vehicle-rental-system-rjvj.onrender.com';

// Helper function to construct API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Helper function to construct image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Handle different image path formats
  if (imagePath.startsWith('http')) {
    // Already a full URL
    return imagePath;
  }
  
  // For upload paths
  if (imagePath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${imagePath}`;
  }
  
  // For just filename
  return `${API_BASE_URL}/uploads/vehicles/${imagePath}`;
};

// Helper function to construct profile image URLs
export const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${imagePath}`;
  }
  
  return `${API_BASE_URL}/uploads/profiles/${imagePath}`;
};
