import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LocationPicker } from './LocationPicker';
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { useState, useEffect } from "react";
import { FaPen, FaSpinner } from "react-icons/fa";
import toast,{ Toaster } from "react-hot-toast";
import { getApiUrl, getImageUrl as getVehicleImageUrl } from "../config/api";
import BackButton from "../components/BackButton";
import SimilarVehiclesRecommendation from "../components/SimilarVehiclesRecommendation";


function VehicleDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Add state to track booking data
  const [bookingData, setBookingData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: 'Butwal'
  });

  useEffect(() => {
    const fetchVehicleData = async () => {
      setLoading(true); // Set loading to true at the start of each fetch
      
      // Always fetch complete data from backend to ensure we have all vehicle specifications
      if (id) {
        try {
          console.log("Fetching complete vehicle data with ID:", id);
          const response = await fetch(getApiUrl(`api/vehicles/${id}`));
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched complete vehicle data:", data);
            console.log("Vehicle specifications - Seats:", data.seats, "FuelType:", data.fuelType, "Mileage:", data.mileage, "Transmission:", data.transmission);
            setVehicleData(data);
          } else {
            console.error("Vehicle not found, status:", response.status);
            setVehicleData(null);
          }
        } catch (error) {
          console.error("Error fetching vehicle data:", error);
          setVehicleData(null);
        }
      } else {
        // If no ID, check if we have complete data from location.state
        const stateData = location.state;
        if (stateData && stateData._id && stateData.seats && stateData.fuelType) {
          console.log("Using complete state data:", stateData);
          setVehicleData(stateData);
        } else {
          console.log("No ID provided and incomplete state data");
          setVehicleData(null);
        }
      }
      setLoading(false);
    };

    fetchVehicleData(); // Always call fetchVehicleData when dependencies change
  }, [id, location.state]); // Removed loading from dependencies

  // Function to handle continue to payment
  const handleContinueToPayment = () => {
    console.log("Continue button clicked!");
    console.log("Booking data:", bookingData);
    console.log("Price data:", vehicleData?.price, "Type:", typeof vehicleData?.price);
    
    // Basic validation
    if (!bookingData.startDate || !bookingData.startTime || !bookingData.endDate || !bookingData.endTime) {

      toast.error("Please fill in all trip details before continuing.");
      return;
    }

    // Validate that end date/time is after start date/time
    const startDateTime = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
    const endDateTime = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
    
    if (endDateTime <= startDateTime) {
      toast.error("End date and time must be after start date and time.");
      return;
    }

    // Handle different price formats
    let basePrice = 3116; // Default price
    
    if (vehicleData?.price) {
      if (typeof vehicleData.price === 'string') {
        // If price is a string like "रु3,116" or "Rs. 3000"
        const numericPrice = vehicleData.price.replace(/[^\d]/g, '');
        basePrice = parseInt(numericPrice) || 3116;
      } else if (typeof vehicleData.price === 'number') {
        // If price is already a number
        basePrice = vehicleData.price;
      }
    }

    console.log("Base price:", basePrice);

    const discount = 1963;
    const serviceFee = 200;
    const taxes = 300;
    const totalPrice = basePrice - discount + serviceFee + taxes;

    console.log("Total price:", totalPrice);
    console.log("Navigating to payment...");

    // Navigate to payment page with all necessary data
    navigate('/payment', {
      state: {
        bookingData: bookingData,
        vehicleData: {
          ...vehicleData, // Pass all vehicle data
          name: vehicleData?.name,
          price: vehicleData?.price,
          image: vehicleData?.image,
          id: vehicleData?._id || vehicleData?.id,
          _id: vehicleData?._id || vehicleData?.id, // Ensure both id formats are available
          dateRange: vehicleData?.dateRange,
          type: vehicleData?.type,
          brand: vehicleData?.brand,
          location: vehicleData?.location,
          capacity: vehicleData?.capacity
        },
        totalPrice: `रु${totalPrice.toLocaleString()}`,
        originalPrice: typeof vehicleData?.price === 'string' ? vehicleData.price : `रु${basePrice.toLocaleString()}`,
        discount: "रु1,963"
      }
    });
  };

  if (loading) {
    return (
      <div className="detail-page flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className="detail-page flex justify-center items-center min-h-screen">
        <div className="text-xl">Vehicle not found</div>
      </div>
    );
  }

  // Use imageError state to provide fallback image
  const imageUrl = imageError ? "/placeholder-vehicle.jpg" : getVehicleImageUrl(vehicleData?.image);

  console.log("Vehicle image field:", vehicleData?.image);
  console.log("Final constructed image URL:", imageUrl);

  return (
    <>
      <Toaster />
      <div className="detail-page flex justify-center items-center md:mb-5 mb-20">
        <div className="w-full md:w-[90vw] lg:w-[85vw] xl:w-[80vw] px-4 md:px-6 lg:px-10 mt-8 md:mt-12">
          {/* Back Button */}
          <div className="mb-4">
            <BackButton />
          </div>
          
          <div className="py-4 md:py-6 flex justify-center items-center">
            <img 
              className="w-full max-w-[600px] lg:max-w-[650px] h-auto object-cover rounded-lg shadow-md" 
              src={imageUrl} 
              alt={vehicleData.name}
              onError={() => {
                console.error("Failed to load vehicle image:", imageUrl);
                setImageError(true); // Set error state instead of directly changing src
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 w-full">
            {/* Left Column on large screens */}
            <div className="lg:col-span-3 row-span-2 space-y-4 order-1 lg:order-1">
              <BasicFeatures 
                name={vehicleData.name} 
                type={vehicleData.type}
                seats={vehicleData.seats}
                fuelType={vehicleData.fuelType}
                mileage={vehicleData.mileage}
                transmission={vehicleData.transmission}
              />
              <VehicleDescription vehicleData={vehicleData} />
            </div>

            {console.log("Vehicle data for description:", vehicleData)}

            {/* Booking Section (Right on lg, second overall on mobile) */}
            <div className="lg:col-span-2 row-span-3 space-y-4 order-2 lg:order-2">
              <BookingSection 
                price={vehicleData.price} 
                location={vehicleData.location}
                onBookingChange={setBookingData}
                onContinue={handleContinueToPayment}
              />
            </div>

            {/* Vehicle Features (Below everything) */}
            <div className="lg:col-span-3 row-span-3 order-3 lg:order-3">
              <VehicleFeatures features={vehicleData.features || features} />
            </div>
          </div>

          {/* Similar Vehicles Recommendation */}
          <div className="mt-12">
            <SimilarVehiclesRecommendation currentVehicle={vehicleData} limit={4} />
          </div>
        </div>
      </div>
    </>
  );
}

export default VehicleDetails;

export const BasicFeatures = ({ name, type, capacity,seats, fuelType, mileage , transmission = "Automatic" }) => {
  const formatType = (vehicleType) => {
    if (!vehicleType) return "Vehicle";
    return vehicleType === 'two-wheeler' ? 'Two Wheeler' : 
           vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1);
  };

  const formatFuelType = (fuel) => {
    if (!fuel) return "Petrol (Regular)";
    return fuel === "Petrol" ? "Petrol (Regular)" : fuel;
  };

  return (
    <section className="w-full p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{name}</h1>
      <p className="text-gray-500 text-sm md:text-base mb-2">{formatType(type)}</p>

      <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
        <div className="flex items-center gap-2 px-2 md:px-3 py-2 bg-gray-200 rounded text-xs md:text-sm">
          <span>👤</span>
          <span>{seats || capacity }</span>
        </div>
        <div className="flex items-center gap-2 px-2 md:px-3 py-2 bg-gray-200 rounded text-xs md:text-sm">
          <span>⛽</span>
          <span>{formatFuelType(fuelType)}</span>
        </div>
        <div className="flex items-center gap-2 px-2 md:px-3 py-2 bg-gray-200 rounded text-xs md:text-sm">
          <span>🧳</span>
          <span>{mileage} KMPL</span>
        </div>
        <div className="flex items-center gap-2 px-2 md:px-3 py-2 bg-gray-200 rounded text-xs md:text-sm">
          <span>⚙️</span>
          <span>{transmission} transmission</span>
        </div>
      </div>
    </section>
  );
};

export const VehicleDescription = ({ vehicleData }) => {
  const [expanded, setExpanded] = useState(false);

  // Default description fallback
  const defaultDescription = `The Range Rover is an iconic luxury SUV known for its unmatched combination of refinement, capability, and cutting-edge technology. With a powerful engine lineup, including hybrid and V8 options, it delivers both smooth on-road performance and exceptional off-road capabilities. The cabin features exquisite materials, advanced infotainment, and best-in-class comfort, making it a top choice for those who demand elegance and ruggedness in one vehicle. The 2024 model continues the legacy with even more tech, improved efficiency, and a bold design that stands out in any environment.`;

  const displayDescription = vehicleData?.description || defaultDescription;

  return (
    <div className="w-full px-4 md:px-5 relative mt-4 md:mt-6">
      <h3 className="text-lg md:text-xl font-semibold mb-3">About this vehicle</h3>
      <div
        className={`relative text-gray-700 text-sm md:text-base leading-relaxed transition-all duration-300 ${expanded
          ? "line-clamp-none max-h-full"
          : "line-clamp-4 md:line-clamp-5 max-h-[6rem] md:max-h-[7.5rem]"
          }`}
      >
        {displayDescription}

        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 md:h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>

      {/* Toggle Button */}
      <button
        className="mt-2 text-blue-600 font-medium hover:underline text-sm md:text-base"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
};

//Booking section

const getTodayDate = () => new Date().toISOString().split("T")[0];
const getCurrentTime = () =>
  new Date().toTimeString().split(":").slice(0, 2).join(":");

export const BookingSection = ({
  price = "रु3,116",
  location = "Butwal, Nepal",
  onBookingChange,
  onContinue
}) => {
  const [booking, setBooking] = useState({
    startDate: getTodayDate(),
    startTime: getCurrentTime(),
    endDate: getTodayDate(),
    endTime: getCurrentTime(),
    location: location // Initialize with the prop value
  });

  useEffect(() => {
    if (onBookingChange) onBookingChange(booking);
  }, [booking, onBookingChange]);

  const handleChange = (field, value) => {
    setBooking((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (newLocation) => {
    handleChange('location', newLocation);
  };

  // Format price for display
  const formatPrice = (priceValue) => {
    if (typeof priceValue === 'string') {
      return priceValue;
    } else if (typeof priceValue === 'number') {
      return `रु${priceValue.toLocaleString()}`;
    }
    return "रु3,116";
  };

  const testClick = () => {
    console.log("Button clicked!");
    if (onContinue) {
      onContinue();
    } else {
      console.log("onContinue is not defined");
    }
  };

  return (
    <div className="w-full  ">
      <div className="w-full  bg-white rounded-2xl border border-gray-300 p-4 shadow-md pb-32 md:pb-4 my-5">
        {/* Trip Form */}
        <div className="mb-4 md:mb-6">
          <h3 className="font-semibold text-lg mb-2">Your trip</h3>

          <div className="md:flex items-center justify-between max-w-lg   hidden">
            <div>
              <p className="text-lg font-bold text-black">{formatPrice(price)} total</p>
              <p className="text-xs text-gray-500">Before taxes</p>
            </div>
          </div>
          <hr className="my-4 md:block hidden" />

          <label className="text-sm text-gray-700">Trip start</label>
          <div className="flex gap-2 mt-1 mb-3">
            <div className="w-1/2 relative">
              <input
                type="date"
                value={booking.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                min={getTodayDate()}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-50 transition-colors"
                style={{
                  colorScheme: 'light',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
                onClick={(e) => {
                  e.target.showPicker && e.target.showPicker();
                  e.target.focus();
                }}
                onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                required
              />
            </div>
            <div className="w-1/2 relative">
              <input
                type="time"
                value={booking.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-50 transition-colors"
                style={{
                  colorScheme: 'light',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
                onClick={(e) => {
                  e.target.showPicker && e.target.showPicker();
                  e.target.focus();
                }}
                onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                required
              />
            </div>
          </div>

          <label className="text-sm text-gray-700">Trip end</label>
          <div className="flex gap-2 mt-1 mb-3">
            <div className="w-1/2 relative">
              <input
                type="date"
                value={booking.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                min={booking.startDate || getTodayDate()}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-50 transition-colors"
                style={{
                  colorScheme: 'light',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
                onClick={(e) => {
                  e.target.showPicker && e.target.showPicker();
                  e.target.focus();
                }}
                onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                required
              />
            </div>
            <div className="w-1/2 relative">
              <input
                type="time"
                value={booking.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-50 transition-colors"
                style={{
                  colorScheme: 'light',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
                onClick={(e) => {
                  e.target.showPicker && e.target.showPicker();
                  e.target.focus();
                }}
                onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                required
              />
            </div>
          </div>
        </div>

        <hr className="my-4" />

        {/* Location - Now using the LocationPicker component */}
        <LocationPicker 
          location={booking.location} 
          onLocationChange={handleLocationChange} 
        />

        <hr className="my-4" />

        <div>
          <button 
            onClick={testClick}
            type="button"
            className="w-full my-5 hidden md:block bg-[#ee3b3b] text-white font-semibold py-3 px-5 rounded-xl hover:bg-[#d22525] transition-colors duration-200 cursor-pointer"
          >
            Continue to Payment
          </button>
        </div>
      </div>

      {/* Fixed Bottom Section for small/medium screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-inner md:hidden md:mt-6 p-4 border-t md:border-none z-50">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-lg font-bold text-black">{formatPrice(price)} total</p>
            <p className="text-xs text-gray-500">Before taxes</p>
          </div>
          <button 
            onClick={testClick}
            type="button"
            className="bg-[#5d3bee] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#4725d2] transition-colors duration-200 cursor-pointer"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    category: "Safety",
    items: [
      "Adaptive cruise control",
      "All-wheel drive",
      "Backup camera",
      "Blind spot warning",
      "Brake assist",
    ],
  },
  {
    category: "Device connectivity",
    items: [
      "Android Auto",
      "Apple CarPlay",
      "AUX input",
      "Bluetooth",
      "USB charger",
      "USB input",
    ],
  },
  {
    category: "Additional features",
    items: ["Must be 25+ to book", "Child seat", "Sunroof"],
  },
];

export function VehicleFeatures({ features }) {
  // Handle both array format (from database) and object format (default)
  const formatFeatures = (featuresData) => {
    if (!featuresData) return features; 
    
    if (Array.isArray(featuresData) && featuresData[0]?.category) {
      return featuresData;
    }
    
    if (typeof featuresData === 'object' && !Array.isArray(featuresData)) {
      return Object.entries(featuresData).map(([category, items]) => ({
        category,
        items: Array.isArray(items) ? items : []
      }));
    }
    
    return features; // Fallback to default
  };

  const displayFeatures = formatFeatures(features);

  return (
    <div className="w-full md:w-full lg:w-[90%] py-4 md:py-6 px-4 md:px-0">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Vehicle features</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {displayFeatures.map((group) => (
          <div key={group.category} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-base md:text-lg mb-3 text-gray-800 border-b border-gray-200 pb-2">
              {group.category}
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm md:text-base">
              {group.items && group.items.length > 0 ? (
                group.items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic">No features listed</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}