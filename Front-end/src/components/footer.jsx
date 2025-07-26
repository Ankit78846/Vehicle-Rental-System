import React from 'react';
import facebook from "../images/facebook.png";
import linkedin from "../images/linkedin.png";
import instagram from "../images/instagram.png";

export default function Footer() {
	return (
		<footer className="bg-black text-white px-5 py-10">
			<div className="flex flex-wrap justify-between gap-10">
				{/* About Us */}
				<div className="flex-1 min-w-[200px]">
					<h3 className="text-lg font-semibold mb-2">About Us</h3>
					<p className="text-gray-400 text-sm">
						Easy Wheels is our 7th semester project focused on vehicle rentals.
						It helps users easily book cars, bikes, or scooters online.
						Designed to be fast, simple, and user-friendly.
					</p>
				</div>

				{/* Contact Info */}
				<div className="flex-1 min-w-[200px]">
					<h3 className="text-lg font-semibold mb-2">Contact Info</h3>
					<p className="text-gray-400 text-sm">Butwal, Rupandehi</p>
					<p className="text-gray-400 text-sm">9806418493, 9804439499</p>
					<p className="text-gray-400 text-sm">utkrista@utkristapokharel.com.np</p>
					<p className="text-gray-400 text-sm">rokeypandey6@gmail.com</p>
					<p className="text-gray-400 text-sm">bhuwan626282@gmail.com</p>
				</div>

				{/* Quick Links */}
				<div className="flex-1 min-w-[200px]">
					<h3 className="text-lg font-semibold mb-2">Quick Links</h3>
					<ul className="text-gray-400 text-sm space-y-2">
						<li><a href="/about" className="hover:underline">About</a></li>
						<li><a href="/vehicles" className="hover:underline">Vehicles</a></li>
						<li><a href="/contact" className="hover:underline">Contact</a></li>
						<li><a href="/add-vehicle" className="hover:underline">Become a host</a></li>
					</ul>
				</div>

				{/* Social Icons */}
				<div className="flex-1 min-w-[200px]">
					<h3 className="text-lg font-semibold mb-2">Social Network</h3>
					<div className="flex flex-col gap-3 text-gray-400 text-sm">
						<a href="#" className="flex items-center hover:underline">
							<img src={facebook} alt="Facebook" className="w-6 h-6 mr-2" />
							Facebook
						</a>
						<a href="#" className="flex items-center hover:underline">
							<img src={linkedin} alt="LinkedIn" className="w-6 h-6 mr-2 invert" />
							LinkedIn
						</a>
						<a href="https://www.instagram.com/utkrista_pokharel?igsh=MTVmYzVoeXY2enZ3Zw%3D%3D&utm_source=qr" className="flex items-center hover:underline">
							<img src={instagram} alt="Instagram" className="w-6 h-6 mr-2" />
							Instagram
						</a>
					</div>
				</div>
			</div>

			<div className="mt-10 pt-5 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
				<p>Copyright © 2025 EasyWheels</p>
				<a href="/privacy" className="hover:underline mt-2 md:mt-0">Privacy Policy</a>
			</div>
		</footer>
	);
}
