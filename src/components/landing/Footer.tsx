import { Baby, Facebook, Instagram, Twitter } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { BetaBadge } from "@/components/BetaBadge";
const Footer = () => {
	const currentYear = new Date().getFullYear();
	return (
		<footer className="bg-gradient-to-b from-white to-gray-50 py-10 sm:py-12 md:py-16 border-t border-gray-200">
			<div className="w-full px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col md:flex-row justify-between items-center mb-8 sm:mb-10 md:mb-12">
					<div className="flex items-center mb-6 sm:mb-8 md:mb-0">
						<div className="w-10 h-10 sm:w-12 sm:h-12 bg-baby-purple rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-lg">
							<Baby
								className="h-5 w-5 sm:h-6 sm:w-6 text-white"
								aria-hidden="true"
							/>
						</div>
						<div className="flex items-center gap-1.5 sm:gap-2">
							<span className="font-bold text-lg sm:text-xl md:text-2xl text-baby-purple">
								Tiny Tots Milestones
							</span>
							<BetaBadge size="sm" />
						</div>
					</div>

					<div className="flex space-x-4 sm:space-x-6">
						<a
							href="https://facebook.com"
							target="_blank"
							rel="noopener noreferrer"
							className="w-10 h-10 bg-gray-100 hover:bg-baby-purple/10 rounded-full flex items-center justify-center text-gray-500 hover:text-baby-purple transition-all duration-300 transform hover:scale-110"
							aria-label="Follow us on Facebook"
						>
							<Facebook size={20} />
						</a>
						<a
							href="https://instagram.com"
							target="_blank"
							rel="noopener noreferrer"
							className="w-10 h-10 bg-gray-100 hover:bg-baby-purple/10 rounded-full flex items-center justify-center text-gray-500 hover:text-baby-purple transition-all duration-300 transform hover:scale-110"
							aria-label="Follow us on Instagram"
						>
							<Instagram size={20} />
						</a>
						<a
							href="https://twitter.com"
							target="_blank"
							rel="noopener noreferrer"
							className="w-10 h-10 bg-gray-100 hover:bg-baby-purple/10 rounded-full flex items-center justify-center text-gray-500 hover:text-baby-purple transition-all duration-300 transform hover:scale-110"
							aria-label="Follow us on Twitter"
						>
							<Twitter size={20} />
						</a>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10 md:mb-12">
					<div>
						<h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 text-baby-purple">About Us</h3>
						<p className="text-sm sm:text-base text-gray-600 leading-relaxed">
							Tiny Tots Milestones helps parents capture and cherish their
							little one's journey from the first smile to the first steps and
							beyond. Creating memories that last a lifetime.
						</p>
					</div>

					<div>
						<h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 text-baby-purple">Quick Links</h3>
						<nav aria-label="Footer Navigation - Main">
							<ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600">
								<li>
									<Link to="/" className="hover:text-baby-purple transition-colors duration-300 flex items-center">
										Home
									</Link>
								</li>
								<li>
									<a href="#features" className="hover:text-baby-purple transition-colors duration-300">
										Features
									</a>
								</li>
								<li>
									<a href="#pricing" className="hover:text-baby-purple transition-colors duration-300">
										Pricing
									</a>
								</li>
								<li>
									<Link to="/auth" className="hover:text-baby-purple transition-colors duration-300">
										Sign Up
									</Link>
								</li>
							</ul>
						</nav>
					</div>

					<div>
						<h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 text-baby-purple">Legal & Support</h3>
						<nav aria-label="Footer Navigation - Legal">
							<ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600">
								<li>
									<Link to="/privacy-policy" className="hover:text-baby-purple transition-colors duration-300">
										Privacy Policy
									</Link>
								</li>
								<li>
									<Link
										to="/terms-of-service"
										className="hover:text-baby-purple transition-colors duration-300"
									>
										Terms of Service
									</Link>
								</li>
								<li>
									<Link to="/contact" className="hover:text-baby-purple transition-colors duration-300">
										Contact Us
									</Link>
								</li>
								<li>
									<Link to="/help" className="hover:text-baby-purple transition-colors duration-300">
										Help & Support
									</Link>
								</li>
							</ul>
						</nav>
					</div>
				</div>

				<div className="text-center pt-6 sm:pt-8 border-t border-gray-200 px-2">
					<p className="text-xs sm:text-sm text-gray-500 mb-2">
						© {currentYear} Tiny Tots Milestones. All rights reserved.
					</p>

					<p className="text-xs sm:text-sm text-gray-400">
						Helping parents document their baby's precious moments since 2025.
					</p>
					
					<div className="mt-3 sm:mt-4 flex justify-center items-center space-x-1.5 sm:space-x-2">
						<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-baby-purple rounded-full"></div>
						<span className="text-[10px] sm:text-xs text-gray-400">Made with ❤️ for families worldwide</span>
						<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-baby-purple rounded-full"></div>
					</div>
				</div>
			</div>
		</footer>
	);
};
export default Footer;
