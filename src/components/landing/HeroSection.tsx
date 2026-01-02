import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { BetaBadge } from "@/components/BetaBadge";
import { ArrowRight, Baby } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
	const { isAuthenticated } = useAuth();

	return (
		<section
			className="royal-blue-hero-gradient py-20 sm:py-28 relative overflow-hidden"
			aria-labelledby="hero-heading"
		>
			{/* Background decorative elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-baby-purple/5 rounded-full blur-3xl"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-baby-blue/5 rounded-full blur-3xl"></div>
			</div>
			
			<div className="w-full px-4 sm:px-6 lg:px-8 text-center relative z-10">
				<div className="flex justify-center mb-8">
					<div className="bg-white p-6 rounded-full shadow-xl border border-baby-purple/10 transform hover:scale-105 transition-transform duration-300">
						<Baby
							size={56}
							className="text-baby-purple animate-bounce-soft"
							aria-hidden="true"
						/>
					</div>
				</div>
				<div className="flex flex-col items-center gap-4 mb-8">
					<h1
						id="hero-heading"
						className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 leading-tight"
					>
						Capture Every Precious{" "}
						<span className="text-baby-purple bg-gradient-to-r from-baby-purple to-baby-blue bg-clip-text text-transparent">
							Milestone
						</span>{" "}
						of Your Little One
					</h1>
					<BetaBadge size="lg" />
				</div>
				<p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
					Document and share your baby's developmental journey month by month
					with photos, videos, and milestone tracking in one beautiful app.
				</p>
				<div className="flex flex-wrap justify-center gap-6">
					<Button
						asChild
						size="lg"
						className="bg-baby-purple hover:bg-baby-purple/90 text-white rounded-full px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
					>
						{isAuthenticated ? (
							<Link to="/app">
								Go to App{" "}
								<ArrowRight className="ml-3 h-6 w-6" aria-hidden="true" />
							</Link>
						) : (
							<Link to="/auth">
								Get Started Free{" "}
								<ArrowRight className="ml-3 h-6 w-6" aria-hidden="true" />
							</Link>
						)}
					</Button>
					<Button
						asChild
						variant="outline"
						size="lg"
						className="border-2 border-baby-purple text-baby-purple hover:bg-baby-purple/10 rounded-full px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
					>
						<a href="#features">Learn More</a>
					</Button>
				</div>
				
				{/* Trust indicators */}
				<div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
					<div className="flex items-center">
						<div className="w-2 h-2 bg-baby-purple rounded-full mr-2"></div>
						<span>Trusted by 1000+ families</span>
					</div>
					<div className="flex items-center">
						<div className="w-2 h-2 bg-baby-purple rounded-full mr-2"></div>
						<span>100% secure & private</span>
					</div>
					<div className="flex items-center">
						<div className="w-2 h-2 bg-baby-purple rounded-full mr-2"></div>
						<span>Free to start</span>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
