import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLock, FaCheck, FaCreditCard } from "react-icons/fa";
import { MdSecurity, MdInfo } from "react-icons/md";
import { getApiUrl, getImageUrl as getVehicleImageUrl } from "../config/api";
import BackButton from "../components/BackButton";
import esewaLogo from "../images/esewa.png";

function PaymentPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const { bookingData, vehicleData } = location.state || {};

	const [paymentMethod, setPaymentMethod] = useState("card");
	const [cardData, setCardData] = useState({
		cardNumber: "",
		expiryDate: "",
		cvv: "",
		cardholderName: "",
	});
	const [billingAddress, setBillingAddress] = useState({
		address: "",
		city: "",
		state: "",
		zipCode: "",
		country: "Nepal",
	});
	const [isProcessing, setIsProcessing] = useState(false);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [currentVehicleData, setCurrentVehicleData] = useState(vehicleData);
	const [userInfo, setUserInfo] = useState({
		name: "",
		email: "",
		phone: "",
		userId: null
	});

	// Calculate total price based on booking duration and vehicle price
	const calculateTotalPrice = () => {
		if (!currentVehicleData?.price || !bookingData?.startDate || !bookingData?.endDate) {
			return {
				basePrice: 5079,
				serviceFee: 200,
				taxes: 300,
				total: 5579,
				days: 1
			};
		}

		const startDate = new Date(bookingData.startDate);
		const endDate = new Date(bookingData.endDate);
		const diffTime = Math.abs(endDate - startDate);
		const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // At least 1 day

		const basePrice = currentVehicleData.price * diffDays;
		const serviceFee = 200;
		const taxes = Math.round(basePrice * 0.05); // 5% tax

		return {
			basePrice,
			serviceFee,
			taxes,
			total: basePrice + serviceFee + taxes,
			days: diffDays
		};
	};

	const priceBreakdown = calculateTotalPrice();

	// Set user info from localStorage if user is logged in
	useEffect(() => {
		const name = localStorage.getItem("name");
		const email = localStorage.getItem("email");
		const userId = localStorage.getItem("userId");
		
		if (name || email || userId) {
			setUserInfo(prev => ({
				...prev,
				name: name || prev.name,
				email: email || prev.email,
				userId: userId || null
			}));
		}
	}, []);

	// Fetch vehicle data if not available in location.state
	useEffect(() => {
		const fetchVehicleData = async () => {
			// If we have vehicleData with id, or vehicleId from location.state, fetch complete data
			const vehicleId = vehicleData?.id || location.state?.vehicleId;
			
			if (vehicleId) {
				setLoading(true);
				try {
					const response = await fetch(getApiUrl(`api/vehicles/${vehicleId}`));
					if (response.ok) {
						const data = await response.json();
						console.log("Fetched complete vehicle data:", data);
						setCurrentVehicleData(data);
					}
				} catch (error) {
					console.error("Error fetching vehicle data:", error);
				}
				setLoading(false);
			} else if (vehicleData) {
				console.log("Using passed vehicle data:", vehicleData);
				setCurrentVehicleData(vehicleData);
			}
		};

		fetchVehicleData();
	}, [vehicleData, location.state?.vehicleId]);

	// Format card number with spaces
	const formatCardNumber = (value) => {
		const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
		const matches = v.match(/\d{4,16}/g);
		const match = matches && matches[0] || "";
		const parts = [];
		for (let i = 0, len = match.length; i < len; i += 4) {
			parts.push(match.substring(i, i + 4));
		}
		if (parts.length) {
			return parts.join(" ");
		} else {
			return v;
		}
	};

	// Format expiry date
	const formatExpiryDate = (value) => {
		const v = value.replace(/\D/g, "");
		if (v.length >= 2) {
			return v.substring(0, 2) + "/" + v.substring(2, 4);
		}
		return v;
	};

	// Validate form
	const validateForm = () => {
		const newErrors = {};

		if (paymentMethod === "card") {
			if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, "").length < 16) {
				newErrors.cardNumber = "Please enter a valid card number";
			}
			if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
				newErrors.expiryDate = "Please enter a valid expiry date";
			}
			if (!cardData.cvv || cardData.cvv.length < 3) {
				newErrors.cvv = "Please enter a valid CVV";
			}
			if (!cardData.cardholderName.trim()) {
				newErrors.cardholderName = "Please enter cardholder name";
			}
		}

		// For eSewa, only validate billing address and user info
		if (paymentMethod !== "esewa") {
			if (!billingAddress.address.trim()) {
				newErrors.address = "Please enter billing address";
			}
			if (!billingAddress.city.trim()) {
				newErrors.city = "Please enter city";
			}
			if (!billingAddress.zipCode.trim()) {
				newErrors.zipCode = "Please enter zip code";
			}
		} else {
			// For eSewa, validate user information
			if (!userInfo.name.trim()) {
				newErrors.userName = "Please enter your full name";
			}
			if (!userInfo.email.trim()) {
				newErrors.userEmail = "Please enter your email address";
			} else if (!/\S+@\S+\.\S+/.test(userInfo.email)) {
				newErrors.userEmail = "Please enter a valid email address";
			}
			if (!userInfo.phone.trim()) {
				newErrors.userPhone = "Please enter your phone number";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsProcessing(true);

		// Handle eSewa payment
		if (paymentMethod === "esewa") {
			try {
				console.log('=== eSewa Payment Debug ===');
				console.log('Current vehicle data:', JSON.stringify(currentVehicleData, null, 2));
				console.log('Booking data:', JSON.stringify(bookingData, null, 2));
				console.log('User info:', JSON.stringify(userInfo, null, 2));
				
				const payloadData = {
					amount: priceBreakdown.total,
					bookingData,
					vehicleData: currentVehicleData,
					billingAddress,
					userInfo
				};
				
				console.log('Sending payload to backend:', JSON.stringify(payloadData, null, 2));

				const apiUrl = getApiUrl('api/payment/esewa/initiate');
				console.log('API URL:', apiUrl);

				const response = await fetch(apiUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payloadData)
				});

				console.log('Response status:', response.status);
				console.log('Response headers:', response.headers);

				if (response.ok) {
					const contentType = response.headers.get('Content-Type');
					
					// Check if response is HTML (eSewa form) or JSON
					if (contentType && contentType.includes('text/html')) {
						// Response is HTML form, display it
						const htmlContent = await response.text();
						const newWindow = window.open('', '_self');
						newWindow.document.write(htmlContent);
						newWindow.document.close();
					} else {
						// Response is JSON
						const data = await response.json();
						if (data.paymentUrl) {
							window.location.href = data.paymentUrl;
						} else {
							alert('Payment URL not received from server');
							setIsProcessing(false);
						}
					}
				} else {
					const contentType = response.headers.get('Content-Type');
					let errorMessage = 'Payment initiation failed';
					
					try {
						if (contentType && contentType.includes('application/json')) {
							const errorData = await response.json();
							errorMessage = errorData.message || errorData.error || errorMessage;
						} else {
							const errorText = await response.text();
							errorMessage = errorText || errorMessage;
						}
					} catch (parseError) {
						console.error('Error parsing response:', parseError);
						errorMessage = `Server error (${response.status}): ${response.statusText}`;
					}
					
					console.error('Payment initiation failed:', errorMessage);
					alert(`Payment initiation failed: ${errorMessage}`);
					setIsProcessing(false);
				}
			} catch (error) {
				console.error('Network error during eSewa payment initiation:', error);
				let errorMessage = 'Network error: ';
				
				if (error.name === 'TypeError' && error.message.includes('fetch')) {
					errorMessage += 'Cannot connect to server. Please ensure the backend is running on port 3001.';
				} else {
					errorMessage += error.message;
				}
				
				alert(errorMessage);
				setIsProcessing(false);
			}
			return;
		}

		// Handle other payment methods (existing logic)
		// Simulate payment processing
		setTimeout(() => {
			setIsProcessing(false);
			// Navigate to confirmation page
			navigate("/booking-confirmation", {
				state: {
					bookingData,
					vehicleData: currentVehicleData,
					totalPrice: priceBreakdown.total,
					priceBreakdown,
					paymentMethod,
					transactionId: "TXN" + Date.now(),
				}
			});
		}, 3000);
	};

	const handleCardInputChange = (field, value) => {
		let formattedValue = value;

		if (field === "cardNumber") {
			formattedValue = formatCardNumber(value);
		} else if (field === "expiryDate") {
			formattedValue = formatExpiryDate(value);
		} else if (field === "cvv") {
			formattedValue = value.replace(/\D/g, "").substring(0, 4);
		}

		setCardData(prev => ({ ...prev, [field]: formattedValue }));

		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const handleBillingChange = (field, value) => {
		setBillingAddress(prev => ({ ...prev, [field]: value }));

		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const handleUserInfoChange = (field, value) => {
		setUserInfo(prev => ({ ...prev, [field]: value }));

		// Clear error when user starts typing
		const errorField = field === 'name' ? 'userName' : 
						   field === 'email' ? 'userEmail' : 
						   field === 'phone' ? 'userPhone' : field;
		if (errors[errorField]) {
			setErrors(prev => ({ ...prev, [errorField]: "" }));
		}
	};

	// Handle image URL
	const getImageUrl = (image) => {
		if (!image) return "/api/placeholder/80/60";
		return getVehicleImageUrl(image);
	};

	if (loading) {
		return (
			<>
				<div className="min-h-screen bg-gray-50 flex items-center justify-center">
					<div className="text-xl">Loading...</div>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Header */}
					<div className="mb-8">
						<div className="mb-4">
							<BackButton text="Back to vehicle details" />
						</div>
						<h1 className="text-3xl font-bold text-gray-900">Complete your booking</h1>
						<div className="flex items-center mt-2 text-sm text-gray-600">
							<FaLock className="mr-1" />
							<span>Your payment information is secure and encrypted</span>
						</div>
					</div>

					<div className="grid lg:grid-cols-3 gap-8">
						{/* Payment Form */}
						<div className="lg:col-span-2">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Payment Method Selection */}
								<div className="bg-white rounded-lg shadow-sm p-6">
									<h2 className="text-xl font-semibold mb-4">Payment Method</h2>

									<div className="grid grid-cols-2 gap-4 mb-6">
										<button
											type="button"
											onClick={() => setPaymentMethod("card")}
											className={`p-4 border rounded-lg flex flex-col items-center justify-center ${paymentMethod === "card"
												? "border-blue-500 bg-blue-50"
												: "border-gray-300 hover:border-gray-400"
												}`}
										>
											<FaCreditCard className="text-2xl mb-2" />
											<span className="text-sm font-medium">Credit Card</span>
										</button>

										<button
											type="button"
											onClick={() => setPaymentMethod("esewa")}
											className={`p-4 border rounded-lg flex flex-col items-center justify-center ${paymentMethod === "esewa"
												? "border-green-500 bg-green-50"
												: "border-gray-300 hover:border-gray-400"
												}`}
										>
											<img 
												src={esewaLogo} 
												alt="eSewa" 
												className="w-25 h-10 mb-2 object-contain"
											/>
											{/* <span className="text-sm font-medium">eSewa</span> */}
										</button>

									</div>

									{/* Card Details Form */}
									{paymentMethod === "card" && (
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Card Number
												</label>
												<input
													type="text"
													value={cardData.cardNumber}
													onChange={(e) => handleCardInputChange("cardNumber", e.target.value)}
													placeholder="1234 5678 9012 3456"
													maxLength="19"
													className={`w-full p-3 border rounded-lg ${errors.cardNumber ? "border-red-500" : "border-gray-300"
														} focus:outline-none focus:ring-2 focus:ring-blue-500`}
												/>
												{errors.cardNumber && (
													<p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
												)}
											</div>

											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Expiry Date
													</label>
													<input
														type="text"
														value={cardData.expiryDate}
														onChange={(e) => handleCardInputChange("expiryDate", e.target.value)}
														placeholder="MM/YY"
														maxLength="5"
														className={`w-full p-3 border rounded-lg ${errors.expiryDate ? "border-red-500" : "border-gray-300"
															} focus:outline-none focus:ring-2 focus:ring-blue-500`}
													/>
													{errors.expiryDate && (
														<p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
													)}
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														CVV
													</label>
													<input
														type="text"
														value={cardData.cvv}
														onChange={(e) => handleCardInputChange("cvv", e.target.value)}
														placeholder="123"
														maxLength="4"
														className={`w-full p-3 border rounded-lg ${errors.cvv ? "border-red-500" : "border-gray-300"
															} focus:outline-none focus:ring-2 focus:ring-blue-500`}
													/>
													{errors.cvv && (
														<p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
													)}
												</div>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Cardholder Name
												</label>
												<input
													type="text"
													value={cardData.cardholderName}
													onChange={(e) => handleCardInputChange("cardholderName", e.target.value)}
													placeholder="John Doe"
													className={`w-full p-3 border rounded-lg ${errors.cardholderName ? "border-red-500" : "border-gray-300"
														} focus:outline-none focus:ring-2 focus:ring-blue-500`}
												/>
												{errors.cardholderName && (
													<p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
												)}
											</div>
										</div>
									)}

									{paymentMethod === "esewa" && (
										<div className="text-center py-8">
											<img 
												src={esewaLogo} 
												alt="eSewa" 
												className="w-20 h-20 mx-auto mb-4 object-contain"
											/>
											<h3 className="text-lg font-semibold mb-2">eSewa Payment</h3>
											<p className="text-gray-600 mb-4">You will be redirected to eSewa to complete your payment securely</p>
											<div className="bg-green-50 p-4 rounded-lg">
												<p className="text-sm text-green-700">
													✓ Secure payment through eSewa<br/>
													✓ Instant payment confirmation<br/>
													✓ Support for all major banks in Nepal
												</p>
											</div>
										</div>
									)}

								</div>

								{/* User Information for eSewa */}
								{paymentMethod === "esewa" && (
									<div className="bg-white rounded-lg shadow-sm p-6">
										<h2 className="text-xl font-semibold mb-4">Your Information</h2>
										<p className="text-sm text-gray-600 mb-4">Please provide your contact information for booking confirmation</p>

										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Full Name <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={userInfo.name}
													onChange={(e) => handleUserInfoChange("name", e.target.value)}
													placeholder="Enter your full name"
													className={`w-full p-3 border rounded-lg ${errors.userName ? "border-red-500" : "border-gray-300"
														} focus:outline-none focus:ring-2 focus:ring-green-500`}
												/>
												{errors.userName && (
													<p className="text-red-500 text-sm mt-1">{errors.userName}</p>
												)}
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Email Address <span className="text-red-500">*</span>
													</label>
													<input
														type="email"
														value={userInfo.email}
														onChange={(e) => handleUserInfoChange("email", e.target.value)}
														placeholder="your.email@example.com"
														className={`w-full p-3 border rounded-lg ${errors.userEmail ? "border-red-500" : "border-gray-300"
															} focus:outline-none focus:ring-2 focus:ring-green-500`}
													/>
													{errors.userEmail && (
														<p className="text-red-500 text-sm mt-1">{errors.userEmail}</p>
													)}
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Phone Number <span className="text-red-500">*</span>
													</label>
													<input
														type="tel"
														value={userInfo.phone}
														onChange={(e) => handleUserInfoChange("phone", e.target.value)}
														placeholder="98XXXXXXXX"
														className={`w-full p-3 border rounded-lg ${errors.userPhone ? "border-red-500" : "border-gray-300"
															} focus:outline-none focus:ring-2 focus:ring-green-500`}
													/>
													{errors.userPhone && (
														<p className="text-red-500 text-sm mt-1">{errors.userPhone}</p>
													)}
												</div>
											</div>

											<div className="bg-blue-50 p-4 rounded-lg">
												<p className="text-sm text-blue-700">
													<strong>Note:</strong> This information will be used for booking confirmation and communication. 
													A booking confirmation will be sent to your email address.
												</p>
											</div>
										</div>
									</div>
								)}

								{/* Billing Address */}
								{paymentMethod !== "esewa" && (
									<div className="bg-white rounded-lg shadow-sm p-6">
										<h2 className="text-xl font-semibold mb-4">Billing Address</h2>

										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Address
												</label>
												<input
													type="text"
													value={billingAddress.address}
													onChange={(e) => handleBillingChange("address", e.target.value)}
													placeholder="eg. Jyotinagar"
													className={`w-full p-3 border rounded-lg ${errors.address ? "border-red-500" : "border-gray-300"
														} focus:outline-none focus:ring-2 focus:ring-blue-500`}
												/>
												{errors.address && (
													<p className="text-red-500 text-sm mt-1">{errors.address}</p>
												)}
											</div>

											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														City
													</label>
													<input
														type="text"
														value={billingAddress.city}
														onChange={(e) => handleBillingChange("city", e.target.value)}
														placeholder="Butwal"
														className={`w-full p-3 border rounded-lg ${errors.city ? "border-red-500" : "border-gray-300"
															} focus:outline-none focus:ring-2 focus:ring-blue-500`}
													/>
													{errors.city && (
														<p className="text-red-500 text-sm mt-1">{errors.city}</p>
													)}
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														State/Province
													</label>
													<input
														type="text"
														value={billingAddress.state}
														onChange={(e) => handleBillingChange("state", e.target.value)}
														placeholder="Lumbini"
														className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
													/>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														ZIP Code
													</label>
													<input
														type="text"
														value={billingAddress.zipCode}
														onChange={(e) => handleBillingChange("zipCode", e.target.value)}
														placeholder="32400"
														className={`w-full p-3 border rounded-lg ${errors.zipCode ? "border-red-500" : "border-gray-300"
															} focus:outline-none focus:ring-2 focus:ring-blue-500`}
													/>
													{errors.zipCode && (
														<p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
													)}
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Country
													</label>
													<select
														value={billingAddress.country}
														onChange={(e) => handleBillingChange("country", e.target.value)}
														className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
													>
														<option value="Nepal">Nepal</option>
														<option value="India">India</option>
														<option value="USA">United States</option>
														<option value="UK">United Kingdom</option>
													</select>
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Terms and Conditions */}
								<div className="bg-white rounded-lg shadow-sm p-6">
									<div className="flex items-start space-x-3">
										<input
											type="checkbox"
											id="terms"
											required
											className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
										/>
										<label htmlFor="terms" className="text-sm text-gray-700">
											I agree to the{" "}
											<a href="#" className="text-blue-600 hover:underline">
												Terms of Service
											</a>{" "}
											and{" "}
											<a href="#" className="text-blue-600 hover:underline">
												Privacy Policy
											</a>
										</label>
									</div>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									disabled={isProcessing}
									className="w-full bg-red-500 text-white font-semibold py-4 px-6 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{isProcessing ? (
										<div className="flex items-center justify-center">
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
											{paymentMethod === "esewa" ? "Redirecting to eSewa..." : "Processing Payment..."}
										</div>
									) : (
										paymentMethod === "esewa" ? 
											`Pay with eSewa - रु${priceBreakdown.total.toLocaleString()}` :
											`Complete Payment - रु${priceBreakdown.total.toLocaleString()}`
									)}
								</button>
							</form>
						</div>

						{/* Order Summary */}
						<div className="lg:col-span-1">
							<div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
								<h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

								{/* Vehicle Info */}
								<div className="mb-6">
									<div className="flex items-center space-x-3 mb-3">
										<img
											src={getImageUrl(currentVehicleData?.image)}
											alt={currentVehicleData?.name || "Vehicle"}
											className="w-16 h-12 object-cover rounded"
										/>
										<div>
											<h3 className="font-medium">{currentVehicleData?.name || "Range Rover"}</h3>
											<p className="text-sm text-gray-600">
												{currentVehicleData?.seats} seats • {currentVehicleData?.transmission}
											</p>
										</div>
									</div>
								</div>

								{/* Trip Details */}
								<div className="space-y-3 mb-6">
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Trip start</span>
										<span>{bookingData?.startDate || "Today"} at {bookingData?.startTime || "10:00"}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Trip end</span>
										<span>{bookingData?.endDate || "Today"} at {bookingData?.endTime || "18:00"}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Location</span>
										<span>{currentVehicleData?.location || "Butwal, Nepal"}</span>
									</div>
								</div>

								<hr className="my-4" />

								{/* Pricing Breakdown */}
								<div className="space-y-3 mb-6">
									<div className="flex justify-between">
										<span>Trip price ({priceBreakdown.days} day{priceBreakdown.days > 1 ? 's' : ''})</span>
										<span>रु{priceBreakdown.basePrice.toLocaleString()}</span>
									</div>
									<div className="flex justify-between text-sm text-gray-600">
										<span>Service fee</span>
										<span>रु{priceBreakdown.serviceFee.toLocaleString()}</span>
									</div>
									<div className="flex justify-between text-sm text-gray-600">
										<span>Taxes</span>
										<span>रु{priceBreakdown.taxes.toLocaleString()}</span>
									</div>
								</div>

								<hr className="my-4" />

								<div className="flex justify-between text-lg font-semibold">
									<span>Total</span>
									<span>रु{priceBreakdown.total.toLocaleString()}</span>
								</div>

								{/* Security Notice */}
								<div className="mt-6 p-4 bg-green-50 rounded-lg">
									<div className="flex items-center">
										<MdSecurity className="text-green-600 mr-2" />
										<span className="text-sm text-green-800 font-medium">
											256-bit SSL encryption
										</span>
									</div>
									<p className="text-xs text-green-700 mt-1">
										Your payment information is secure and protected
									</p>
								</div>

								{/* Cancellation Policy */}
								<div className="mt-4 p-4 bg-blue-50 rounded-lg">
									<div className="flex items-center">
										<MdInfo className="text-blue-600 mr-2" />
										<span className="text-sm text-blue-800 font-medium">
											Free cancellation
										</span>
									</div>
									<p className="text-xs text-blue-700 mt-1">
										Cancel up to 24 hours before your trip for a full refund
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default PaymentPage;