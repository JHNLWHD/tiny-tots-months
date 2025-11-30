import { useAuth } from "@/context/AuthContext";
import React from "react";
import PlanCard from "./PlanCard";

const PricingSection = () => {
	const { isAuthenticated } = useAuth();

	const freePlan = {
		title: "Free",
		description: "Perfect for getting started",
		price: "₱0",
		pricePeriod: "forever",
		features: [
			"Track 1 baby only",
			"Track milestones up to 3 months",
			"5 photos per month (15 total)",
			"Unique shareable links",
			"Basic milestone suggestions",
			"❌ No video uploads",
		],
		ctaLink: "/auth",
		ctaText: "Get Started",
	};

	const premiumPlan = {
		title: "Premium",
		description: "For growing families",
		price: "₱500",
		pricePeriod: "one-time payment",
		features: [
			"Unlimited baby profiles",
			"Complete 12 months milestone tracking",
			"Unlimited photo uploads",
			"Video uploads (up to 50MB)",
			"Priority support",
			"Unique shareable links",
			"Advanced milestone suggestions",
		],
		ctaLink: isAuthenticated ? "/app/upgrade" : "/auth",
		ctaText: "Get Premium",
		isPremium: true,
	};

	return (
		<section
			className="bg-gradient-to-b from-gray-50 to-white py-24"
			id="pricing"
			aria-labelledby="pricing-heading"
		>
			<div className="w-full px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-20">
					<h2
						id="pricing-heading"
						className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
					>
						Simple <span className="text-baby-purple">Pricing</span> for Every Family
					</h2>
					<p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
						Choose the plan that's right for your family. Start with our free plan
						and upgrade anytime as your baby grows.
					</p>
					<div className="inline-flex items-center bg-baby-purple/10 rounded-full px-6 py-3 text-baby-purple font-semibold">
						<span className="w-2 h-2 bg-baby-purple rounded-full mr-2"></span>
						No hidden fees • Cancel anytime • 30-day money back guarantee
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
					<PlanCard {...freePlan} />
					<PlanCard {...premiumPlan} />
				</div>
				
				{/* Additional trust indicators */}
				<div className="mt-16 text-center">
					<p className="text-gray-500 mb-6">Trusted by families worldwide</p>
					<div className="flex justify-center items-center space-x-8 text-gray-400">
						<div className="flex items-center">
							<span className="text-2xl font-bold text-baby-purple mr-2">1000+</span>
							<span className="text-sm">Happy Families</span>
						</div>
						<div className="w-px h-8 bg-gray-300"></div>
						<div className="flex items-center">
							<span className="text-2xl font-bold text-baby-purple mr-2">50K+</span>
							<span className="text-sm">Milestones Tracked</span>
						</div>
						<div className="w-px h-8 bg-gray-300"></div>
						<div className="flex items-center">
							<span className="text-2xl font-bold text-baby-purple mr-2">100K+</span>
							<span className="text-sm">Photos Stored</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default PricingSection;
