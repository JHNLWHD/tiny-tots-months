import { useAuth } from "@/context/AuthContext";
import { usePricing } from "@/hooks/usePricing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Star, Crown } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const PricingSection = () => {
	const { isAuthenticated } = useAuth();
	const { 
		currency, 
		setCurrency,
		formatPrice, 
		getCreditPackagePrice, 
		getSubscriptionPrice, 
		getLifetimePrice,
		isDetecting,
		isCurrencySwitcherEnabled
	} = usePricing();
	
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

	const freePlan = {
		title: "Free",
		description: "Perfect for getting started",
		icon: <CheckCircle2 className="w-8 h-8 text-green-500" />,
		price: formatPrice(0),
		pricePeriod: "forever",
		features: [
			"1 baby profile",
			"Full 12 months tracking",
			"10 photos per month",
			"Basic milestone suggestions",
			"Export/download features",
		],
		limitations: [
			"No video uploads",
			"No premium templates",
		],
		ctaLink: "/auth",
		ctaText: "Get Started",
		popular: false,
	};

	const creditPlan = {
		title: "Credits",
		description: "Pay as you go",
		icon: <Zap className="w-8 h-8 text-blue-500" />,
		price: "Starting at " + (getCreditPackagePrice(0)?.formatted || ""),
		pricePeriod: "per package",
		features: [
			"Extra baby profiles (15 credits)",
			"Video uploads (2 credits each)",
			"Extra photo storage (1 credit per 10)",
			"Premium templates (3 credits)",
			"Export features (2 credits)",
		],
		packages: [
			getCreditPackagePrice(0),
			getCreditPackagePrice(1),
			getCreditPackagePrice(2),
		],
		ctaLink: isAuthenticated ? "/app/upgrade" : "/auth",
		ctaText: "Buy Credits",
		popular: false,
	};

	const familyPlan = {
		title: "Family Subscription",
		description: "Best for growing families",
		icon: <Star className="w-8 h-8 text-purple-500" />,
		price: getSubscriptionPrice(0, billingCycle)?.formatted || "",
		pricePeriod: billingCycle,
		originalPrice: billingCycle === "yearly" ? getSubscriptionPrice(0, "monthly")?.formatted : null,
		savings: billingCycle === "yearly" ? "2 months free!" : null,
		features: [
			"Unlimited baby profiles",
			"Unlimited photos & videos",
			"Premium milestone templates",
			"Priority support",
			"Advanced analytics",
			"Family collaboration",
			"Export capabilities",
		],
		ctaLink: isAuthenticated ? "/app/upgrade" : "/auth",
		ctaText: "Start Family Plan",
		popular: true,
	};

	const lifetimePlan = {
		title: "Lifetime Premium",
		description: "One-time payment, lifetime access",
		icon: <Crown className="w-8 h-8 text-gold-500" />,
		price: getLifetimePrice()?.formatted || "",
		pricePeriod: "one-time payment",
		features: [
			"All Family Subscription features",
			"Lifetime access",
			"No recurring fees",
			"Grandfathered pricing protection",
			"Priority feature access",
		],
		ctaLink: isAuthenticated ? "/app/upgrade" : "/auth",
		ctaText: "Get Lifetime Access",
		popular: false,
	};

	if (isDetecting) {
		return (
			<section className="bg-gradient-to-b from-gray-50 to-white py-24" id="pricing">
				<div className="w-full px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<div className="animate-pulse">
							<div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
							<div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
						</div>
					</div>
				</div>
			</section>
		);
	}

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
						Flexible <span className="text-baby-purple">Pricing</span> for Every Family
					</h2>
					<p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
						Start free, pay as you grow, or go premium. Choose what works best for your family's journey.
					</p>
					
					{/* Currency Switcher or Currency Notice */}
					{isCurrencySwitcherEnabled && setCurrency ? (
						<div className="flex justify-center items-center gap-4 mb-8">
							<span className="text-sm text-gray-600">Currency:</span>
							<div className="flex bg-gray-100 rounded-lg p-1">
								<button
									onClick={() => setCurrency("PHP")}
									className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
										currency === "PHP"
											? "bg-baby-purple text-white"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									₱ PHP
								</button>
								<button
									onClick={() => setCurrency("USD")}
									className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
										currency === "USD"
											? "bg-baby-purple text-white"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									$ USD
								</button>
							</div>
						</div>
					) : (
						<div className="text-center mb-8">
							<span className="text-sm text-gray-600">
								All prices in {currency === "PHP" ? "Philippine Pesos (₱)" : "US Dollars ($)"}
							</span>
						</div>
					)}

					{/* Billing Cycle Toggle for Family Plan */}
					<div className="flex justify-center items-center gap-4 mb-8">
						<span className="text-sm text-gray-600">Family Plan Billing:</span>
						<div className="flex bg-gray-100 rounded-lg p-1">
							<button
								onClick={() => setBillingCycle("monthly")}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									billingCycle === "monthly"
										? "bg-baby-purple text-white"
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								Monthly
							</button>
							<button
								onClick={() => setBillingCycle("yearly")}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									billingCycle === "yearly"
										? "bg-baby-purple text-white"
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								Yearly
								<Badge className="ml-2 bg-green-100 text-green-800 text-xs">Save 17%</Badge>
							</button>
						</div>
					</div>
				</div>

				{/* Pricing Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
					{/* Free Plan */}
					<PricingCard plan={freePlan} />
					
					{/* Credits Plan */}
					<PricingCard plan={creditPlan} />
					
					{/* Family Subscription */}
					<PricingCard plan={familyPlan} />
					
					{/* Lifetime Plan */}
					<PricingCard plan={lifetimePlan} />
				</div>
				
				{/* Trust indicators */}
				<div className="text-center">
					<div className="inline-flex items-center bg-baby-purple/10 rounded-full px-6 py-3 text-baby-purple font-semibold mb-8">
						<span className="w-2 h-2 bg-baby-purple rounded-full mr-2"></span>
						No hidden fees • Secure payments • 30-day money back guarantee
					</div>
					
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

// Pricing Card Component
const PricingCard = ({ plan }: { plan: any }) => {
	return (
		<div className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
			plan.popular ? "border-baby-purple scale-105" : "border-gray-200 hover:border-baby-purple/50"
		}`}>
			{plan.popular && (
				<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
					<Badge className="bg-baby-purple text-white px-4 py-1 text-sm font-semibold">
						Most Popular
					</Badge>
				</div>
			)}
			
			<div className="p-8">
				<div className="flex items-center justify-center mb-4">
					{plan.icon}
				</div>
				
				<h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
					{plan.title}
				</h3>
				
				<p className="text-gray-600 text-center mb-6">
					{plan.description}
				</p>
				
				<div className="text-center mb-6">
					<div className="flex items-baseline justify-center">
						<span className="text-4xl font-bold text-gray-900">
							{plan.price}
						</span>
					</div>
					<p className="text-sm text-gray-500 mt-1">
						{plan.pricePeriod}
					</p>
					{plan.originalPrice && (
						<p className="text-sm text-gray-400 line-through">
							{plan.originalPrice}/month
						</p>
					)}
					{plan.savings && (
						<p className="text-sm text-green-600 font-semibold">
							{plan.savings}
						</p>
					)}
				</div>

				{/* Credit Packages */}
				{plan.packages && (
					<div className="mb-6 space-y-2">
						{plan.packages.map((pkg: any, index: number) => (
							<div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
								<span className="text-sm">{pkg?.credits} credits</span>
								<span className="font-semibold">{pkg?.formatted}</span>
							</div>
						))}
					</div>
				)}
				
				<ul className="space-y-3 mb-8">
					{plan.features.map((feature: string, index: number) => (
						<li key={index} className="flex items-start">
							<CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
							<span className="text-gray-700 text-sm">{feature}</span>
						</li>
					))}
					{plan.limitations?.map((limitation: string, index: number) => (
						<li key={`limit-${index}`} className="flex items-start">
							<div className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
								<div className="w-3 h-3 bg-gray-300 rounded-full"></div>
							</div>
							<span className="text-gray-500 text-sm">{limitation}</span>
						</li>
					))}
				</ul>
				
				<Button
					asChild
					className={`w-full rounded-lg py-3 text-sm font-semibold transition-all duration-300 ${
						plan.popular
							? "bg-baby-purple hover:bg-baby-purple/90 text-white shadow-lg hover:shadow-xl"
							: "border-2 border-baby-purple text-baby-purple hover:bg-baby-purple hover:text-white"
					}`}
					variant={plan.popular ? "default" : "outline"}
				>
					<Link to={plan.ctaLink}>{plan.ctaText}</Link>
				</Button>
			</div>
		</div>
	);
};

export default PricingSection;
