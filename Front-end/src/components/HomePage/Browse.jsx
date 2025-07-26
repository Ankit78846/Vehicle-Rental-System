import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { RiMotorbikeFill } from "react-icons/ri";
import { FaCar, FaBus } from "react-icons/fa";
import { PiTruckTrailerFill } from "react-icons/pi";
import { PiTruckFill } from "react-icons/pi";
import VehicleCard from "../VehicleCard";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { getApiUrl } from "../../config/api";


const vehicleTypes = [
  { name: 'Two-Wheeler', icon: <RiMotorbikeFill /> },
  { name: 'Pickup', icon: <PiTruckFill /> },
  { name: 'Car', icon: <FaCar /> },
  { name: 'Truck', icon: <PiTruckTrailerFill /> },
  { name: 'Bus', icon: <FaBus /> },
];


export default function VehicleBrowse() {
  const navigate = useNavigate();

  // Helper function to format vehicle type for URL (same as in SuggestedVehicle)
  const formatVehicleType = (type) => {
    if (!type) return 'car'; // fallback
    
    const typeMap = {
      'Two-Wheeler': 'two-wheeler',
      'two-wheeler': 'two-wheeler',
      'Two Wheeler': 'two-wheeler',
      'Car': 'car',
      'car': 'car',
      'Pickup': 'pickup',
      'pickup': 'pickup',
      'Truck': 'truck',
      'truck': 'truck',
      'Bus': 'bus',
      'bus': 'bus'
    };
    
    if (typeMap[type]) {
      return typeMap[type];
    }
    
    return type.toLowerCase().replace(/\s+/g, '-');
  };

  const handleClick = (type) => {
    navigate(`/vehicles/${formatVehicleType(type)}`);
  };

  return (
    <div className="vehicle-browse flex justify-center items-center flex-col my-10 p-3  w-full md:w-[80vw]">
      <h2 className="text-3xl font-bold text-center mb-7">
        Browse Our Vehicles
      </h2>

      <ul className="flex flex-wrap justify-center items-center gap-15 lg:gap-30 md:gap-20  list-none mb-4 text-2xl">
        {vehicleTypes.map((vehicle, index) => (
          <li
            key={index}
            className="text-center cursor-pointer flex flex-col items-center hover:text-red-600 transition-transform duration-200 transform hover:scale-110"
            onClick={() => handleClick(vehicle.name)}
          >
            {vehicle.icon}
            <h1 className="mt-1 text-sm font-bold">{vehicle.name}</h1>
          </li>
        ))}
      </ul>
      <SuggestedVehicle />

    </div>
  );
};


export const SuggestedVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [suggestedVehicles, setSuggestedVehicles] = useState([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const scrollRef = useRef(null);

  // Helper function to format vehicle type for URL
  const formatVehicleType = (type) => {
    if (!type) return 'car'; // fallback
    
    // Handle specific cases
    const typeMap = {
      'Two-Wheeler': 'two-wheeler',
      'two-wheeler': 'two-wheeler',
      'Two Wheeler': 'two-wheeler',
      'Car': 'car',
      'car': 'car',
      'Pickup': 'pickup',
      'pickup': 'pickup',
      'Truck': 'truck',
      'truck': 'truck',
      'Bus': 'bus',
      'bus': 'bus'
    };
    
    // Check if type exists in map
    if (typeMap[type]) {
      return typeMap[type];
    }
    
    // Fallback: convert to lowercase and replace spaces with dashes
    return type.toLowerCase().replace(/\s+/g, '-');
  };

  // Fetch all vehicles
  useEffect(() => {
    async function getVehicles() {
      try {
        const res = await fetch(getApiUrl("api/vehicles"));
        const data = await res.json();
        // Filter only active vehicles
        const activeVehicles = data.filter(vehicle => vehicle.isActive === true);
        setVehicles(activeVehicles);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    }
    getVehicles();
  }, []);

  // Function to refresh suggestions
  const refreshSuggestions = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Handle vehicle click to update local state immediately
  const handleVehicleClick = (vehicleId) => {
    // Update the clicked vehicle's count in local state
    setVehicles(prevVehicles => 
      prevVehicles.map(vehicle => 
        vehicle._id === vehicleId 
          ? { ...vehicle, clickCount: (vehicle.clickCount || 0) + 1 }
          : vehicle
      )
    );
    
    // Refresh suggestions after a short delay to show updated counts
    setTimeout(() => {
      refreshSuggestions();
    }, 100);
  };

  // Add event listener for focus to refresh suggestions when user returns to page
  useEffect(() => {
    const handleFocus = () => {
      refreshSuggestions();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Generate suggestions based on click data or show random vehicles
  useEffect(() => {
    if (!vehicles.length) return;

    const generateSuggestions = async () => {
      try {
        // Get vehicles with clicks and group by click count, then randomize within groups
        const vehiclesWithClicks = vehicles
          .filter(v => v.clickCount && v.clickCount > 0)
          .reduce((groups, vehicle) => {
            const count = vehicle.clickCount;
            if (!groups[count]) {
              groups[count] = [];
            }
            groups[count].push(vehicle);
            return groups;
          }, {});

        // Sort click counts in descending order and flatten with randomization within each group
        const sortedClickedVehicles = Object.keys(vehiclesWithClicks)
          .map(Number)
          .sort((a, b) => b - a) // Descending order (highest clicks first)
          .flatMap(clickCount => {
            // Shuffle vehicles within the same click count group
            const shuffledGroup = [...vehiclesWithClicks[clickCount]].sort(() => 0.5 - Math.random());
            return shuffledGroup;
          })
          .slice(0, 5); // Max 5 vehicles

        if (sortedClickedVehicles.length > 0) {
          const clickedVehicleIds = sortedClickedVehicles.map(v => v._id);

          // Get unclicked vehicles (clickCount = 0 or undefined)
          const unclickedVehicles = vehicles.filter(v =>
            !clickedVehicleIds.includes(v._id) &&
            v.isActive &&
            (!v.clickCount || v.clickCount === 0)
          );

          // Check if we have unclicked vehicles
          if (unclickedVehicles.length > 0) {
            // Calculate remaining slots needed (total 8)
            const remainingSlotsNeeded = 8 - sortedClickedVehicles.length;

            // Get random unclicked vehicles to fill remaining slots
            const shuffledUnclicked = [...unclickedVehicles].sort(() => 0.5 - Math.random());
            const randomUnclickedVehicles = shuffledUnclicked.slice(0, remainingSlotsNeeded);

            // Combine clicked vehicles (priority order with randomization) + random unclicked vehicles
            const mixedSuggestions = [...sortedClickedVehicles, ...randomUnclickedVehicles];

            setSuggestedVehicles(mixedSuggestions);
            setIsPersonalized(true);
            return;
          } else {
            // All vehicles are clicked, show by priority with randomization within same click counts
            const allClickedGrouped = vehicles
              .filter(v => v.clickCount && v.clickCount > 0)
              .reduce((groups, vehicle) => {
                const count = vehicle.clickCount;
                if (!groups[count]) {
                  groups[count] = [];
                }
                groups[count].push(vehicle);
                return groups;
              }, {});

            const allClickedByPriorityWithShuffle = Object.keys(allClickedGrouped)
              .map(Number)
              .sort((a, b) => b - a) // Descending order (priority)
              .flatMap(clickCount => {
                // Shuffle vehicles within the same click count group
                const shuffledGroup = [...allClickedGrouped[clickCount]].sort(() => 0.5 - Math.random());
                return shuffledGroup;
              })
              .slice(0, 8);

            setSuggestedVehicles(allClickedByPriorityWithShuffle);
            setIsPersonalized(true);
            return;
          }
        }

        // Fallback: Show random vehicles if no click data
        const count = Math.min(8, vehicles.length);
        const shuffled = [...vehicles].sort(() => 0.5 - Math.random());
        setSuggestedVehicles(shuffled.slice(0, count));
        setIsPersonalized(false);

      } catch (error) {
        console.error('Error generating suggestions:', error);
        // Fallback to random vehicles
        const count = Math.min(8, vehicles.length);
        const shuffled = [...vehicles].sort(() => 0.5 - Math.random());
        setSuggestedVehicles(shuffled.slice(0, count));
        setIsPersonalized(false);
      }
    };

    generateSuggestions();
  }, [vehicles, refreshKey]); // Added refreshKey as dependency

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full mt-8">
      {/* Header with personalization indicator and refresh button */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {isPersonalized ? "Trending & Discover More" : "Featured Vehicles"}
          </h3>
          <button
            onClick={refreshSuggestions}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Refresh
          </button>
        </div>
        {isPersonalized && (
          <p className="text-sm text-gray-600 mt-5">
            Most popular vehicles + new discoveries • Click refresh to update
          </p>
        )}
      </div>

      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hover:bg-gray-100"
      >
        <IoChevronBack size={24} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth px-10 py-4 hide-scrollbar"
      >
        {suggestedVehicles.map((vehicle) => (
          <div key={vehicle._id} className="min-w-[300px] relative">
            <VehicleCard
              vehicle={vehicle}
              type={formatVehicleType(vehicle.type)}
              onVehicleClick={handleVehicleClick}
            />
            {isPersonalized && vehicle.clickCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1 rounded-full">
                🔥 {vehicle.clickCount} {vehicle.clickCount === 1 ? 'view' : 'views'}
              </div>
            )}
            {isPersonalized && vehicle.clickCount === 0 && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xs px-2 py-1 rounded-full">
                ✨ New
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hover:bg-gray-100"
      >
        <IoChevronForward size={24} />
      </button>
    </div>
  );
};