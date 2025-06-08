import CtaSection from "@/components/landing/CtaSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import PricingSection from "@/components/landing/PricingSection";
import ProblemSolutionSection from "@/components/landing/ProblemSolutionSection";
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const Landing = () => {
	// Set page title and description dynamically
	useEffect(() => {
		document.title = "Tiny Tots Milestones - Track Your Baby's Development";
	}, []);

	return (
		<div className="min-h-screen">
			<Helmet>
				<meta
					name="description"
					content="Capture and document your baby's milestones month by month. Share precious moments with family and friends through our easy-to-use app."
				/>
				<meta
					name="keywords"
					content="baby milestones, baby development tracker, baby photos, milestone app, parenting app"
				/>

				{/* Open Graph tags for social sharing */}
				<meta
					property="og:title"
					content="Tiny Tots Milestones - Track Your Baby's Development"
				/>
				<meta
					property="og:description"
					content="Capture and document your baby's milestones month by month. Share precious moments with family and friends."
				/>
				<meta property="og:type" content="website" />
				<meta property="og:url" content={window.location.href} />

				{/* Twitter Card data */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta
					name="twitter:title"
					content="Tiny Tots Milestones - Baby Development Tracker"
				/>
				<meta
					name="twitter:description"
					content="Document and share your baby's growth journey with our easy-to-use milestone tracker."
				/>

				{/* Canonical URL */}
				<link rel="canonical" href={window.location.href} />
			</Helmet>

			{/* Hero Section */}
			<HeroSection />

			{/* Problem/Solution Section */}
			<ProblemSolutionSection />

			{/* Key Features Section */}
			<FeaturesSection />

			{/* Pricing Section */}
			<PricingSection />

			{/* CTA Section */}
			<CtaSection />

			{/* Footer */}
			<Footer />
		</div>
	);
};

export default Landing;
