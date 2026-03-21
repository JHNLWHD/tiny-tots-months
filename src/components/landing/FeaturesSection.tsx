import {
	Award,
	Camera,
	Check,
	Lightbulb,
	Rocket,
	Smartphone,
	Star,
} from "lucide-react";
import React from "react";
import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
	const features = [
		{
			title: "Monthly Milestone Tracking",
			description:
				"Document your baby's development month by month with our easy-to-use milestone tracker. Select from pre-defined milestones or add your own custom achievements.",
			features: [
				{
					text: "Organized by month",
					icon: <Check className="h-5 w-5 text-green-500 mr-2" />,
				},
				{
					text: "Pre-defined milestone suggestions",
					icon: <Star className="h-5 w-5 text-baby-purple mr-2" />,
				},
				{
					text: "Custom milestone entries",
					icon: <Rocket className="h-5 w-5 text-baby-blue mr-2" />,
				},
			],
			imageTitle: "Milestone Tracker Screenshot",
			colorClass: "text-baby-purple",
			imagePosition: "left" as const,
			icon: <Lightbulb size={64} className="text-baby-purple" />,
		},
		{
			title: "Photo & Video Collection",
			description:
				"Upload and organize photos by month within your plan's storage. Add videos on Premium or Lifetime, or use credits for individual uploads.",
			features: [
				{
					text: "Generous photo storage on paid plans (10GB Family, 25GB Lifetime)",
					icon: <Camera className="h-5 w-5 text-baby-pink mr-2" />,
				},
				{
					text: "Videos on Premium/Lifetime or 2 credits each (free tier)",
					icon: <Star className="h-5 w-5 text-baby-yellow mr-2" />,
				},
				{
					text: "Add captions to remember the context",
					icon: <Check className="h-5 w-5 text-green-500 mr-2" />,
				},
			],
			imageTitle: "Photo Gallery Screenshot",
			colorClass: "text-baby-pink",
			imagePosition: "right" as const,
			icon: <Camera size={64} className="text-baby-pink" />,
		},
		{
			title: "Your memories, everywhere",
			description:
				"Sign in on any device and pick up where you left off. Photos and milestones stay organized in one place so you always have the full story.",
			features: [
				{
					text: "Works on phone, tablet, and desktop",
					icon: <Smartphone className="h-5 w-5 text-baby-mint mr-2" />,
				},
				{
					text: "Secure cloud storage",
					icon: <Star className="h-5 w-5 text-baby-blue mr-2" />,
				},
				{
					text: "Pick up where you left off after signing in",
					icon: <Check className="h-5 w-5 text-green-500 mr-2" />,
				},
			],
			imageTitle: "Cross-device access",
			colorClass: "text-baby-mint",
			imagePosition: "left" as const,
			icon: <Award size={64} className="text-baby-mint" />,
		},
	];

	return (
		<section
			className="bg-white py-12 sm:py-16 md:py-20 lg:py-24"
			id="features"
			aria-labelledby="features-heading"
		>
			<div className="w-full px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12 sm:mb-16 md:mb-20">
					<h2
						id="features-heading"
						className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 px-2"
					>
						Powerful <span className="text-baby-purple">Features</span> for Every Family
					</h2>
					<p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-2">
						Everything you need to capture and organize your baby's precious moments
						in one beautifully designed app.
					</p>
				</div>
				<div className="space-y-12 sm:space-y-16 md:space-y-20 max-w-7xl mx-auto">
					{features.map((feature, index) => (
						<div key={feature.title} className={index % 2 === 1 ? "bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16 rounded-2xl sm:rounded-3xl" : ""}>
							<FeatureCard
								title={feature.title}
								description={feature.description}
								features={feature.features}
								colorClass={feature.colorClass}
								imagePosition={feature.imagePosition}
								icon={feature.icon}
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default FeaturesSection;
