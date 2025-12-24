import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const CtaSection = () => {
	const { isAuthenticated } = useAuth();

	return (
		<section className="royal-blue-cta-gradient py-24 relative overflow-hidden" aria-labelledby="cta-heading">
			{/* Background decorative elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute top-10 left-10 w-32 h-32 bg-baby-purple/10 rounded-full blur-2xl"></div>
				<div className="absolute bottom-10 right-10 w-40 h-40 bg-baby-blue/10 rounded-full blur-2xl"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-baby-purple/5 rounded-full blur-3xl"></div>
			</div>
			
			<div className="w-full px-4 sm:px-6 lg:px-8 text-center relative z-10">
				<h2 id="cta-heading" className="text-4xl md:text-5xl font-bold mb-8 text-gray-800 leading-tight">
					Start Documenting Your Baby's{" "}
					<span className="text-baby-purple bg-gradient-to-r from-baby-purple to-baby-blue bg-clip-text text-transparent">
						Journey
					</span>{" "}
					Today
				</h2>
				<p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
					Don't miss a moment of your child's precious first years. Sign up now
					and start creating memories that will last a lifetime.
				</p>
				
				<div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
					<Button
						asChild
						size="lg"
						className="bg-baby-purple hover:bg-baby-purple/90 text-white rounded-full px-12 py-4 text-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
					>
						{isAuthenticated ? (
							<Link to="/app">
								Go to App{" "}
								<ArrowRight className="ml-3 h-6 w-6" aria-hidden="true" />
							</Link>
						) : (
							<Link to="/auth">
								Get Started for Free{" "}
								<ArrowRight className="ml-3 h-6 w-6" aria-hidden="true" />
							</Link>
						)}
					</Button>
					
					<div className="flex items-center text-gray-600">
						<div className="flex -space-x-2 mr-3">
							<div className="w-8 h-8 bg-baby-purple/20 rounded-full border-2 border-white"></div>
							<div className="w-8 h-8 bg-baby-blue/20 rounded-full border-2 border-white"></div>
							<div className="w-8 h-8 bg-baby-pink/20 rounded-full border-2 border-white"></div>
						</div>
						<span className="text-sm font-medium">Join 1000+ happy families</span>
					</div>
				</div>
				
				{/* Trust badges */}
				<div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
					<div className="flex items-center bg-white/60 rounded-full px-4 py-2 backdrop-blur-sm">
						<div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
						<span>100% Free to Start</span>
					</div>
					<div className="flex items-center bg-white/60 rounded-full px-4 py-2 backdrop-blur-sm">
						<div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
						<span>Secure & Private</span>
					</div>
					<div className="flex items-center bg-white/60 rounded-full px-4 py-2 backdrop-blur-sm">
						<div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
						<span>No Credit Card Required</span>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CtaSection;
