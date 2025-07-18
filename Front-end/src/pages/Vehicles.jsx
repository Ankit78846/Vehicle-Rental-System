import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
// import Sample from '../assets/Sample.json';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';


import { useNavigate } from 'react-router-dom';

const VehicleCard = ({ vehicle }) => {
	const navigate = useNavigate();

	const handleRentNow = () => {
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

	return (
		<Motion.div
			className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105"
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<img src={`http://localhost:3001/uploads/vehicles/${vehicle.image}`} alt={vehicle.name} className="w-full h-48 object-cover" />
			<div className="p-4">
				<h3 className="text-xl font-semibold text-gray-800">{vehicle.name}</h3>
				<p className="text-gray-600 capitalize">
					{vehicle.type.replace('two-wheeler', 'Two Wheeler')}
				</p>
				<div className="flex items-center mt-2">
					<span className="text-yellow-500">{'★'.repeat(Math.floor(vehicle.rating))}</span>
					<span className="text-gray-600 ml-1">({vehicle.rating})</span>
				</div>
				<p className="text-gray-600 mt-1">Available: {vehicle.dateRange}</p>
				<div>
					<p className="text-lg font-bold text-green-600 mt-2">{vehicle.price}</p>
					<p className="text-sm text-gray-400">Before taxes</p>
				</div>
				<button
					onClick={handleRentNow}
					className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
				>
					Rent Now
				</button>
			</div>
		</Motion.div>
	);
};

const VehicleBrowse = () => {
	const [vehicles, setVehicles] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [categories, setCategories] = useState(['All']);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchVehicles = async () => {
			try {
				const res = await fetch('http://localhost:3001/api/vehicles');
				const data = await res.json();
				setVehicles(data);

				const uniqueCategories = [
					'All',
					...new Set(data.map(vehicle => vehicle.type).sort()),
				].map(category =>
					category === 'two-wheeler'
						? 'Two Wheeler'
						: category.charAt(0).toUpperCase() + category.slice(1)
				);
				setCategories(uniqueCategories);
				setLoading(false);
			} catch (err) {
				console.error('Error fetching vehicles:', err);
				setError('Unable to load vehicles. Please try again later.');
				setLoading(false);
			}
		};

		fetchVehicles();
	}, []);

	const filteredVehicles =
		selectedCategory === 'All'
			? vehicles
			: vehicles.filter(
					vehicle =>
						vehicle.type ===
						(selectedCategory === 'Two Wheeler'
							? 'two-wheeler'
							: selectedCategory.toLowerCase())
			  );

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-gray-100">
				<main className="container mx-auto px-4 py-8">
					<Motion.div
						className="flex justify-center space-x-4 mb-8 flex-wrap"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.8 }}
					>
						{categories.map(category => (
							<button
								key={category}
								className={`px-4 py-2 rounded-lg font-semibold transition-colors m-2 ${
									selectedCategory === category
										? 'bg-red-600 text-white'
										: 'bg-white text-gray-800 hover:bg-indigo-100'
								}`}
								onClick={() => setSelectedCategory(category)}
							>
								{category}
							</button>
						))}
					</Motion.div>

					{loading ? (
						<p className="text-center text-gray-600">Loading...</p>
					) : (
						<Motion.div
							className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4, duration: 0.8 }}
						>
							{error ? (
								<p className="text-center col-span-full text-red-600">{error}</p>
							) : filteredVehicles.length > 0 ? (
								filteredVehicles.map(vehicle => (
									// The key below assumes your backend sends _id or id
									<VehicleCard key={vehicle._id || vehicle.id} vehicle={vehicle} />
								))
							) : (
								<p className="text-center col-span-full text-gray-600">No vehicles found.</p>
							)}
						</Motion.div>
					)}
				</main>
			</div>
			<Footer />
		</>
	);
};

export default VehicleBrowse;