import { FaRegHeart, FaHeart } from "react-icons/fa6";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";

const VehicleCard = ({ vehicle, type }) => {
  const [liked, setLiked] = useState(false);

  return (
    <Link
      to={`/vehicle/${type}/${vehicle._id}`}
      state={{
        id: vehicle._id,
        name: vehicle.name,
        image: vehicle.image,
        dateRange: vehicle.dateRange,
        price: vehicle.price,
      }}
    >
      <div className="vehicle-card group w-full rounded-2xl bg-white border border-gray-200 hover:shadow-2xl transition-shadow-md duration-300 overflow-hidden">
        <div className="relative">
          <img
            className="w-full h-48 sm:h-52 object-cover object-center transition-transform duration-300 group-hover:scale-105"
            src={`http://localhost:3001/uploads/vehicles/${vehicle.image}`}
            alt={vehicle.name}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              setLiked(!liked);
            }}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-500 p-2 rounded-full shadow-md transition-all"
          >
            {liked ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        <div className="p-4 flex flex-col justify-between h-[160px]">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-gray-800 truncate">{vehicle.name}</h3>

            <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
              <FaStar className="text-base" /> {vehicle.rating || "N/A"}
            </div>

            <div className="flex items-center text-gray-500 text-sm">{vehicle.dateRange}</div>
          </div>

          <div className="mt-2 text-right">
            <p className="text-base font-semibold text-gray-800">{vehicle.price} total</p>
            <p className="text-sm text-gray-400">Before taxes</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;
