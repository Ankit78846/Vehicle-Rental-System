import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaLock, FaArrowLeft, FaCheck, FaCreditCard, FaPaypal, FaApplePay, FaGooglePay } from "react-icons/fa";
import { MdSecurity, MdInfo } from "react-icons/md";

function PaymentPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const { bookingData, vehicleData, totalPrice } = location.state || {};

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

	// Fetch vehicle data if not available in location.state
	useEffect(() => {
		const fetchVehicleData = async () => {
			if (!vehicleData && location.state?.vehicleId) {
				setLoading(true);
				try {
					const response = await fetch(`http://localhost:3001/api/vehicles/${location.state.vehicleId}`);
					if (response.ok) {
						const data = await response.json();
						setCurrentVehicleData(data);
					}
				} catch (error) {
					console.error("Error fetching vehicle data:", error);
				}
				setLoading(false);
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

		if (!billingAddress.address.trim()) {
			newErrors.address = "Please enter billing address";
		}
		if (!billingAddress.city.trim()) {
			newErrors.city = "Please enter city";
		}
		if (!billingAddress.zipCode.trim()) {
			newErrors.zipCode = "Please enter zip code";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsProcessing(true);

		// Simulate payment processing
		setTimeout(() => {
			setIsProcessing(false);
			// Navigate to confirmation page
			navigate("/booking-confirmation", {
				state: {
					bookingData,
					vehicleData: currentVehicleData,
					totalPrice,
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

	// Handle image URL
	const getImageUrl = (image) => {
		if (!image) return "/api/placeholder/80/60";
		if (image.startsWith('http')) return image;
		return `http://localhost:3001/uploads/vehicles/${image}`;
	};

	if (loading) {
		return (
			<>
				<Navbar />
				<div className="min-h-screen bg-gray-50 flex items-center justify-center">
					<div className="text-xl">Loading...</div>
				</div>
			</>
		);
	}

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Header */}
					<div className="mb-8">
						<button
							onClick={() => navigate(-1)}
							className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
						>
							<FaArrowLeft className="mr-2" />
							Back to vehicle details
						</button>
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

									<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
											onClick={() => setPaymentMethod("paypal")}
											className={`p-4 border rounded-lg flex flex-col items-center justify-center ${paymentMethod === "paypal"
												? "border-blue-500 bg-blue-50"
												: "border-gray-300 hover:border-gray-400"
												}`}
										>
											<FaPaypal className="text-2xl mb-2 text-blue-600" />
											<span className="text-sm font-medium">PayPal</span>
										</button>

										<button
											type="button"
											onClick={() => setPaymentMethod("apple")}
											className={`p-4 border rounded-lg flex flex-col items-center justify-center ${paymentMethod === "apple"
													? "border-blue-500 bg-blue-50"
													: "border-gray-300 hover:border-gray-400"
												}`}
										>
											<FaApplePay className="text-2xl mb-2" />
											<span className="text-sm font-medium">Apple Pay</span>
										</button>

										<button
											type="button"
											onClick={() => setPaymentMethod("google")}
											className={`p-4 border rounded-lg flex flex-col items-center justify-center ${paymentMethod === "google"
												? "border-blue-500 bg-blue-50"
												: "border-gray-300 hover:border-gray-400"
												}`}
										>
											<FaGooglePay className="text-2xl mb-2" />
											<span className="text-sm font-medium">Google Pay</span>
										</button>
										{/* <button
											type="button"
											onClick={() => setPaymentMethod("esewa")}
											className={`p-4 border rounded-lg flex flex-col items-center justify-center ${paymentMethod === "esewa"
												? "border-green-500 bg-green-50"
												: "border-gray-300 hover:border-gray-400"
												}`}
										>
											<img src="/esewa-logo.png" alt="eSewa" className="w-6 h-6 mb-2" />
											<span className="text-sm font-medium">eSewa</span>
										</button> */}

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

									{/* Alternative Payment Methods */}
									{paymentMethod === "paypal" && (
										<div className="text-center py-8">
											<FaPaypal className="text-6xl text-blue-600 mx-auto mb-4" />
											<p className="text-gray-600">You will be redirected to PayPal to complete your payment</p>
										</div>
									)}

									{paymentMethod === "apple" && (
										<div className="text-center py-8">
											<FaApplePay className="text-6xl mx-auto mb-4" />
											<p className="text-gray-600">Use Touch ID or Face ID to pay with Apple Pay</p>
										</div>
									)}

									{paymentMethod === "google" && (
										<div className="text-center py-8">
											<FaGooglePay className="text-6xl mx-auto mb-4" />
											<p className="text-gray-600">Pay quickly and securely with Google Pay</p>
										</div>
									)}

								</div>

								{/* Billing Address */}
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
												placeholder="123 Main Street"
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
													placeholder="Kathmandu"
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
													placeholder="Bagmati"
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
													placeholder="44600"
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
											Processing Payment...
										</div>
									) : (
										`Complete Payment - ${totalPrice || "रु3,116"}`
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
											<p className="text-sm text-gray-600">5 seats • Automatic</p>
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
										<span>Butwal, Nepal</span>
									</div>
								</div>

								<hr className="my-4" />

								{/* Pricing Breakdown */}
								<div className="space-y-3 mb-6">
									<div className="flex justify-between">
										<span>Trip price</span>
										<span>रु5,079</span>
									</div>
									<div className="flex justify-between text-green-600">
										<span>1-month discount</span>
										<span>-रु1,963</span>
									</div>
									<div className="flex justify-between text-sm text-gray-600">
										<span>Service fee</span>
										<span>रु200</span>
									</div>
									<div className="flex justify-between text-sm text-gray-600">
										<span>Taxes</span>
										<span>रु300</span>
									</div>
								</div>

								<hr className="my-4" />

								<div className="flex justify-between text-lg font-semibold">
									<span>Total</span>
									<span>{totalPrice || "रु3,616"}</span>
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