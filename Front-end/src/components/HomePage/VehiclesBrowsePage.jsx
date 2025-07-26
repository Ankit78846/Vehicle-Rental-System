import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getImageUrl } from "../../config/api";
import VehicleFilter from '../VehicleFilter';

const VehicleCard = ({ vehicle }) => {
	const navigate = useNavigate();
	const [liked, setLiked] = useState(false);
	const [loading, setLoading] = useState(false);

	// Check if vehicle is in favorites when component mounts
	useEffect(() => {
		const checkFavoriteStatus = async () => {
			const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
			if (!token) return;

			try {
				const response = await fetch(getApiUrl(`api/favorites/check/${vehicle._id}`), {
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				});
				
				if (response.ok) {
					const data = await response.json();
					setLiked(data.isFavorite);
				}
			} catch (error) {
				console.error('Error checking favorite status:', error);
			}
		};

		checkFavoriteStatus();
	}, [vehicle._id]);

	const handleFavoriteToggle = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		
		const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
		if (!token) {
			alert("Please login to add favorites");
			return;
		}

		setLoading(true);
		
		try {
			const url = liked 
				? getApiUrl(`api/favorites/remove/${vehicle._id}`)
				: getApiUrl(`api/favorites/add/${vehicle._id}`);
			
			const method = liked ? 'DELETE' : 'POST';
			
			const response = await fetch(url, {
				method,
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const data = await response.json();
				setLiked(data.isFavorite);
			} else {
				const errorData = await response.json();
				console.error('Error toggling favorite:', errorData.message);
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
		} finally {
			setLoading(false);
		}
	};

	const trackClick = async () => {
		try {
			await fetch(getApiUrl(`api/public/track-click/${vehicle._id}`), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			console.error('Error tracking click:', error);
		}
	};

	const handleRentNow = async () => {
		await trackClick(); // Track the click
		const type = vehicle.type === 'two-wheeler' ? 'two-wheeler' : vehicle.type.toLowerCase();
		navigate(`/vehicle/${type}/${vehicle._id}`, {
			state: {
				id: vehicle._id,
				name: vehicle.name,
				image: vehicle.image,
				dateRange: vehicle.dateRange,
				price: vehicle.price,
			},
		});
	};

	// Format features for display
	const getTopFeatures = () => {
		if (!vehicle.features) return [];
		
		const allFeatures = [];
		Object.values(vehicle.features).forEach(featureList => {
			if (Array.isArray(featureList)) {
				allFeatures.push(...featureList.filter(f => f && f.trim()));
			}
		});
		
		return allFeatures.slice(0, 3); // Show top 3 features
	};

	const topFeatures = getTopFeatures();

	return (
		<Motion.div
			className="vehicle-card group w-full rounded-3xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative"
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
			
			<div className="relative">
				<img 
					src={getImageUrl(vehicle.image)} 
					alt={vehicle.name} 
					className="w-full h-52 sm:h-56 object-cover object-center transition-transform duration-300 group-hover:scale-105"
				/>

				<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
				
				{/* Popularity badge */}
				{vehicle.clickCount > 0 && (
					<div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
						🔥 {vehicle.clickCount} views
					</div>
				)}

				<button
					onClick={handleFavoriteToggle}
					disabled={loading}
					className={`absolute top-3 right-3 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 z-20 ${
						liked 
							? 'bg-red-500 text-white' 
							: 'bg-white text-red-500 hover:text-red-600'
					} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
				>
					{liked ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
				</button>
			</div>

			<div className="p-6 flex flex-col justify-between min-h-[200px] relative">
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<h3 className="text-xl font-bold text-gray-800 truncate group-hover:text-indigo-600 transition-colors duration-200">
							{vehicle.name}
						</h3>
						<div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium capitalize">
							{vehicle.type.replace('two-wheeler', 'Two Wheeler')}
						</div>
					</div>
					
					{/* Vehicle details */}
					<div className="flex items-center justify-between text-sm text-gray-600">
						<span>{vehicle.brand}</span>
						<span>{vehicle.fuelType}</span>
						<span>{vehicle.transmission}</span>
					</div>

					<div className="flex items-center justify-between text-sm text-gray-600">
						<span>📍 {vehicle.location}</span>
						<span>👥 {vehicle.capacity} seats</span>
					</div>

					{/* Top features */}
					{topFeatures.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{topFeatures.map((feature, index) => (
								<span 
									key={index}
									className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
								>
									{feature}
								</span>
							))}
						</div>
					)}
				</div>

				<div className="mt-4 flex items-end justify-between">
					<div className="flex flex-col">
						<p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
							{typeof vehicle.price === 'number' ? `रु${vehicle.price.toLocaleString()}` : vehicle.price}
						</p>
						<p className="text-sm text-gray-400">Before taxes</p>
					</div>
					
					<button
						onClick={handleRentNow}
						className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
					>
						Rent Now
					</button>
				</div>
			</div>
		</Motion.div>
	);
};

const VehiclesBrowsePage = () => {
	const [allVehicles, setAllVehicles] = useState([]);
	const [filteredVehicles, setFilteredVehicles] = useState([]);
	const [sortBy, setSortBy] = useState('default');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchVehicles = async () => {
			try {
				console.log('Fetching vehicles from:', getApiUrl('api/vehicles'));
				const res = await fetch(getApiUrl('api/vehicles'));
				console.log('Response status:', res.status);
				
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				
				const data = await res.json();
				console.log('Fetched vehicles data:', data);
				
				const activeVehicles = data.filter(vehicle => vehicle.isActive === true);
				console.log('Active vehicles:', activeVehicles.length);
				
				setAllVehicles(activeVehicles);
				setFilteredVehicles(activeVehicles); // Initially show all vehicles
				setLoading(false);
			} catch (err) {
				console.error('Error fetching vehicles:', err);
				setError('Unable to load vehicles. Please try again later.');
				setLoading(false);
			}
		};

		fetchVehicles();
	}, []);

	// Handle filter changes from VehicleFilter component
	const handleFilterChange = (filters) => {
		console.log('Applying filters:', filters);
		
		if (!filters || Object.keys(filters).length === 0) {
			setFilteredVehicles(allVehicles);
			return;
		}

		const filtered = allVehicles.filter(vehicle => {
			// Type filter (single selection)
			if (filters.type && vehicle.type !== filters.type) {
				return false;
			}

			// Brand filter (multiple selection)
			if (filters.brands && filters.brands.length > 0 && !filters.brands.includes(vehicle.brand)) {
				return false;
			}

			// Fuel type filter (single selection)
			if (filters.fuelType && vehicle.fuelType !== filters.fuelType) {
				return false;
			}

			// Transmission filter (single selection)
			if (filters.transmission && vehicle.transmission !== filters.transmission) {
				return false;
			}

			// Location filter (multiple selection)
			if (filters.locations && filters.locations.length > 0 && !filters.locations.includes(vehicle.location)) {
				return false;
			}

			// Price range filter
			if (filters.priceRange && (filters.priceRange.min || filters.priceRange.max)) {
				const price = typeof vehicle.price === 'number' 
					? vehicle.price 
					: parseFloat(vehicle.price?.toString().replace(/[^\d.-]/g, '')) || 0;
				
				if (filters.priceRange.min && price < parseFloat(filters.priceRange.min)) {
					return false;
				}
				if (filters.priceRange.max && price > parseFloat(filters.priceRange.max)) {
					return false;
				}
			}

			// Capacity range filter
			if (filters.capacityRange && (filters.capacityRange.min || filters.capacityRange.max)) {
				const capacity = vehicle.capacity || 0;
				if (filters.capacityRange.min && capacity < parseInt(filters.capacityRange.min)) {
					return false;
				}
				if (filters.capacityRange.max && capacity > parseInt(filters.capacityRange.max)) {
					return false;
				}
			}

			// Features filter (multiple selection)
			if (filters.features && filters.features.length > 0) {
				const vehicleFeatures = [];
				if (vehicle.features) {
					Object.values(vehicle.features).forEach(featureList => {
						if (Array.isArray(featureList)) {
							vehicleFeatures.push(...featureList);
						}
					});
				}
				
				const hasAllFeatures = filters.features.every(feature => 
					vehicleFeatures.some(vFeature => 
						vFeature?.toLowerCase().includes(feature.toLowerCase())
					)
				);
				
				if (!hasAllFeatures) {
					return false;
				}
			}

			return true;
		});

		console.log('Filtered vehicles:', filtered.length);
		setFilteredVehicles(filtered);
	};

	// Handle filter reset
	const handleFilterReset = () => {
		setFilteredVehicles(allVehicles);
	};

	// Sort the filtered vehicles based on the selected sort option
	const sortedVehicles = [...filteredVehicles].sort((a, b) => {
		switch (sortBy) {
			case 'name-asc':
				return a.name.localeCompare(b.name);
			case 'name-desc':
				return b.name.localeCompare(a.name);
			case 'price-asc': {
				const getPriceValue = (priceData) => {
					if (typeof priceData === 'number') return priceData;
					if (typeof priceData === 'string') {
						return parseFloat(priceData.replace(/[^\d.-]/g, '')) || 0;
					}
					return 0;
				};
				
				const priceA = getPriceValue(a.price);
				const priceB = getPriceValue(b.price);
				return priceA - priceB;
			}
			case 'price-desc': {
				const getPriceValue = (priceData) => {
					if (typeof priceData === 'number') return priceData;
					if (typeof priceData === 'string') {
						return parseFloat(priceData.replace(/[^\d.-]/g, '')) || 0;
					}
					return 0;
				};
				
				const priceA2 = getPriceValue(a.price);
				const priceB2 = getPriceValue(b.price);
				return priceB2 - priceA2;
			}
			case 'popularity':
				return (b.clickCount || 0) - (a.clickCount || 0);
			case 'capacity-asc':
				return (a.capacity || 0) - (b.capacity || 0);
			case 'capacity-desc':
				return (b.capacity || 0) - (a.capacity || 0);
			case 'newest':
				return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
			default:
				return 0;
		}
	});

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading vehicles...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<Motion.div
					className="text-center mb-8"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<h1 className="text-4xl font-bold text-gray-800 mb-2">Find Your Perfect Vehicle</h1>
					{/* <p className="text-gray-600">
						Discover from {allVehicles.length} vehicles with advanced filtering options
					</p> */}
				</Motion.div>

				{/* Filter Component */}
				<Motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.6 }}
				>
					<VehicleFilter 
						vehicles={allVehicles}
						onFilterChange={handleFilterChange}
						onReset={handleFilterReset}
					/>
				</Motion.div>

				{/* Results Summary and Sort */}
				<Motion.div
					className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4, duration: 0.6 }}
				>
					<div className="text-gray-600">
						Showing {sortedVehicles.length} of {allVehicles.length} vehicles
					</div>

					<div className="flex items-center gap-3 flex-shrink-0">
						<label htmlFor="sort-select" className="text-gray-700 font-medium whitespace-nowrap">
							Sort by:
						</label>
						<select
							id="sort-select"
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all min-w-[180px]"
						>
							<option value="default">Default</option>
							<option value="popularity">Most Popular</option>
							<option value="newest">Newest First</option>
							<option value="name-asc">Name (A-Z)</option>
							<option value="name-desc">Name (Z-A)</option>
							<option value="price-asc">Price (Low to High)</option>
							<option value="price-desc">Price (High to Low)</option>
							<option value="capacity-asc">Capacity (Low to High)</option>
							<option value="capacity-desc">Capacity (High to Low)</option>
						</select>
					</div>
				</Motion.div>

				{/* Vehicle Grid */}
				{error ? (
					<div className="text-center py-12">
						<p className="text-red-600 text-lg">{error}</p>
					</div>
				) : sortedVehicles.length > 0 ? (
					<Motion.div
						className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6, duration: 0.8 }}
					>
						{sortedVehicles.map(vehicle => (
							<VehicleCard key={vehicle._id || vehicle.id} vehicle={vehicle} />
						))}
					</Motion.div>
				) : (
					<Motion.div
						className="text-center py-12"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6, duration: 0.6 }}
					>
						<div className="text-gray-600 text-lg mb-4">
							No vehicles found matching your filters
						</div>
						<p className="text-gray-500 mb-6">
							Try adjusting your search criteria or clearing some filters
						</p>
						<button
							onClick={handleFilterReset}
							className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
						>
							Clear All Filters
						</button>
					</Motion.div>
				)}
			</div>
		</div>
	);
};

export default VehiclesBrowsePage;
