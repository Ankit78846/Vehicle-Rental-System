import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";
import { useState } from "react";
import { getApiUrl } from "../../config/api";


const ContactUs = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		address: '',
		phone: '',
		message: '',
		country: 'Nepal'
	});

	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validateForm = () => {
		const newErrors = {};

		// Name validation
		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
		} else if (formData.name.trim().length < 2) {
			newErrors.name = 'Name must be at least 2 characters long';
		} else if (!/^[a-zA-Z\s.'-]+$/.test(formData.name.trim())) {
			newErrors.name = 'Name can only contain letters, spaces, dots, apostrophes, and hyphens';
		} else if (!/[a-zA-Z]/.test(formData.name.trim())) {
			newErrors.name = 'Name must contain at least one letter';
		} else if (/^[^a-zA-Z]*$/.test(formData.name.trim())) {
			newErrors.name = 'Name must start with a letter';
		} else if (/[.'-]{2,}/.test(formData.name.trim())) {
			newErrors.name = 'Name cannot have consecutive special characters';
		} else if (/^[.'-]|[.'-]$/.test(formData.name.trim())) {
			newErrors.name = 'Name cannot start or end with special characters';
		} else if (!/^[a-zA-Z]/.test(formData.name.trim())) {
			newErrors.name = 'Name must start with a letter';
		} else if (!/[a-zA-Z]$/.test(formData.name.trim())) {
			newErrors.name = 'Name must end with a letter';
		} else if (/(.)\1{2,}/.test(formData.name.trim())) {
			newErrors.name = 'Name cannot have more than 2 consecutive repeated characters';
		}

		// Email validation
		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address';
		} else if (/^[0-9]+@/.test(formData.email)) {
			newErrors.email = 'Email username cannot contain only numbers';
		} else if (formData.email.length > 254) {
			newErrors.email = 'Email address is too long';
		}

		// Address validation
		if (!formData.address.trim()) {
			newErrors.address = 'Address is required';
		} else if (formData.address.trim().length < 5) {
			newErrors.address = 'Address must be at least 5 characters long';
		} else if (/^[0-9\s]+$/.test(formData.address.trim())) {
			newErrors.address = 'Address cannot contain only numbers';
		} else if (!/[a-zA-Z]/.test(formData.address.trim())) {
			newErrors.address = 'Address must contain at least one letter';
		} else if (/(.)\1{4,}/.test(formData.address.trim())) {
			newErrors.address = 'Address cannot have more than 4 consecutive repeated characters';
		}

		// Phone validation
		if (formData.phone.trim() && !/^[9876]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
			newErrors.phone = 'Phone number must be 10 digits starting with 9, 8, 7, or 6';
		}

		// Message validation
		if (!formData.message.trim()) {
			newErrors.message = 'Message is required';
		} else if (formData.message.trim().length < 10) {
			newErrors.message = 'Message must be at least 10 characters long';
		} else if (/^[0-9\s]+$/.test(formData.message.trim())) {
			newErrors.message = 'Message cannot contain only numbers';
		} else if (!/[a-zA-Z]/.test(formData.message.trim())) {
			newErrors.message = 'Message must contain at least one letter';
		} else if (/(.)\1{5,}/.test(formData.message.trim())) {
			newErrors.message = 'Message cannot have more than 5 consecutive repeated characters';
		}

		return newErrors;
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));

		// Clear error for this field when user starts typing
		if (errors[name]) {
			setErrors(prev => ({
				...prev,
				[name]: ''
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formErrors = validateForm();

		if (Object.keys(formErrors).length === 0) {
			setIsSubmitting(true);
			
			try {
				const response = await fetch(getApiUrl('api/contact'), {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData)
				});

				const result = await response.json();

				if (result.success) {
					alert(result.message);
					// Reset form on successful submission
					setFormData({
						name: '',
						email: '',
						address: '',
						phone: '',
						message: '',
						country: 'Nepal'
					});
				} else {
					alert(result.message || 'There was an error sending your message. Please try again.');
				}
			} catch (error) {
				console.error('Error submitting form:', error);
				alert('There was an error sending your message. Please check your internet connection and try again.');
			} finally {
				setIsSubmitting(false);
			}
		} else {
			setErrors(formErrors);
		}
	};

	return (
		<>
			{/* <div className="bg-white min-h-screen"> */}
			<div className="w-full flex flex-col justify-center items-center" id="contactus-section">
			


			<div className="w-[95vw] md:w-[85vw] rounded-t-lg shadow-xl bg-blue-700 text-white py-8 md:py-10 px-4 md:px-10 mt-6 md:mt-10 text-center md:text-left relative max-w-screen-2xl mx-auto">			
				<div className="flex flex-col items-center md:items-start w-full md:w-1/2 md:ml-10">
					<h1 className="text-2xl md:text-4xl font-bold">Contact us</h1>
					<p className="text-sm md:text-lg mt-2">Ask your queries with us for free.</p>
				</div>

		</div >

			<div className="w-[95vw] md:w-[85vw] flex flex-col md:flex-row justify-center px-4 md:px-20 py-6 md:py-10 space-y-6 md:space-y-0 md:space-x-10 bg-gray-50 max-w-screen-2xl mx-auto">
				<div className="bg-indigo-50 p-4 md:p-6 rounded-lg shadow-md w-full md:w-1/3">
					<h2 className="text-lg md:text-xl font-semibold text-indigo-900 mb-3 md:mb-4">Contact Details</h2>
					<p className="mb-3 md:mb-4 text-xs md:text-sm text-indigo-900">
						We're here for you. We'll get to you as soon as possible.
					</p>
					<div className="space-y-3 md:space-y-4 text-gray-800 text-xs md:text-sm">
						<div className="flex items-start">
							<FaMapMarkerAlt className="text-[#fe1900] mt-1 flex-shrink-0" />
							<span className="ml-2 md:ml-3">Butwal, Rupandehi, Nepal</span>
						</div>
						<div className="flex items-start">
							<FaPhoneAlt className="text-[#2bc055] mt-1 flex-shrink-0" />
							<span className="ml-2 md:ml-3">+977 71537999</span>
						</div>
						<div className="flex items-start">
							<FaWhatsapp className="text-[#2bc055] mt-1 flex-shrink-0" />
							<span className="ml-2 md:ml-3">
								+977 9806418493<br />
								+977 9804439499
							</span>
						</div>
						<div className="flex items-start">
							<FaEnvelope className="text-[#d11919] mt-1 flex-shrink-0" />
							<span className="ml-2 md:ml-3 break-all">
								utkrista@utkristapokharel.com.np<br />
								bhuwan626282@gmail.com<br />
								rokeypandey6@gmail.com
							</span>
						</div>
					</div>
				</div>

				<div className="bg-[#f6f6f6] w-full md:w-2/3 p-4 md:p-6 border-0 rounded-lg shadow-md">
					<h2 className="text-lg md:text-xl font-semibold mb-2">
						Get in Touch with EasyWheels!
					</h2>
					<p className="text-xs md:text-sm text-gray-600 mb-4">
						<strong>Note:</strong> <span className="text-red-500">*</span> symbol represents required
					</p>

					<form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
							<div>
								<label className="text-xs md:text-sm">Name <span className="text-red-500">*</span></label>
								<input 
									type="text" 
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									placeholder="Full Name" 
									className={`w-full px-3 md:px-4 py-2 mt-1 border-0 rounded bg-white text-sm ${errors.name ? 'border-2 border-red-500' : ''}`} 
								/>
								{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
							</div>
							<div>
								<label className="text-xs md:text-sm">Email <span className="text-red-500">*</span></label>
								<input 
									type="email" 
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									placeholder="Your Email" 
									className={`w-full px-3 md:px-4 py-2 mt-1 border-0 rounded bg-white text-sm ${errors.email ? 'border-2 border-red-500' : ''}`} 
								/>
								{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
							</div>
							<div>
								<label className="text-xs md:text-sm">Your Address <span className="text-red-500">*</span></label>
								<input 
									type="text" 
									name="address"
									value={formData.address}
									onChange={handleInputChange}
									placeholder="Address" 
									className={`w-full px-3 md:px-4 py-2 mt-1 border-0 rounded bg-white text-sm ${errors.address ? 'border-2 border-red-500' : ''}`} 
								/>
								{errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
							</div>
							<div>
								<label className="text-xs md:text-sm">Phone</label>
								<div className="flex items-center">
									<span className="px-2 md:px-3 py-2 border-0 bg-white text-gray-600 rounded-l">
										<select 
											name="country" 
											value={formData.country}
											onChange={handleInputChange}
											className="outline-none bg-transparent text-xs md:text-sm"
										>
											<option value="Nepal">Nepal</option>
											<option value="India">India</option>
										</select>
									</span>
									<input 
										type="tel" 
										name="phone"
										value={formData.phone}
										onChange={handleInputChange}
										placeholder="Your Phone" 
										className={`w-full px-3 md:px-4 py-2 border-0 rounded-r bg-white text-sm ${errors.phone ? 'border-2 border-red-500' : ''}`} 
									/>
								</div>
								{errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
							</div>
						</div>
						<div>
							<label className="text-xs md:text-sm">Message <span className="text-red-500">*</span></label>
							<textarea 
								rows="4" 
								name="message"
								value={formData.message}
								onChange={handleInputChange}
								className={`w-full px-3 md:px-4 py-2 mt-1 border-0 rounded bg-white text-sm resize-none ${errors.message ? 'border-2 border-red-500' : ''}`} 
								placeholder="Your Message" 
							/>
							{errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
						</div>
						<button 
							type="submit" 
							disabled={isSubmitting}
							className={`w-full md:w-auto px-6 py-2 md:py-3 rounded text-white text-sm md:text-base font-medium ${
								isSubmitting 
									? 'bg-gray-400 cursor-not-allowed' 
									: 'bg-red-500 hover:bg-red-600 active:bg-red-700'
							} transition-colors duration-200`}
						>
							{isSubmitting ? 'Submitting...' : 'Submit'}
						</button>
					</form>
				</div>
			</div>
			</div>
	{/* </div> */ }
	{/* <Footer /> */ }
		</>
	);
};

export default ContactUs;
