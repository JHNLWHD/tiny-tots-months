import CtaSection from "@/components/landing/CtaSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import PricingSection from "@/components/landing/PricingSection";
import ProblemSolutionSection from "@/components/landing/ProblemSolutionSection";
import React from "react";
import { Helmet } from "react-helmet-async";

const Landing = () => {
	const siteUrl = "https://tinytotsmilestones.com";
	const currentUrl = typeof window !== "undefined" ? window.location.href : siteUrl;
	const ogImage = `${siteUrl}/og-image.png`;

	// Structured data for SEO
	const structuredData = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": `${siteUrl}/#organization`,
				name: "Tiny Tots Milestones",
				url: siteUrl,
				logo: {
					"@type": "ImageObject",
					url: `${siteUrl}/favicon-96x96.png`,
				},
				contactPoint: {
					"@type": "ContactPoint",
					email: "hello@tinytotsmilestones.com",
					contactType: "Customer Service",
				},
			},
			{
				"@type": "SoftwareApplication",
				"@id": `${siteUrl}/#software`,
				name: "Tiny Tots Milestones",
				applicationCategory: "LifestyleApplication",
				operatingSystem: "Web",
				offers: {
					"@type": "Offer",
					price: "0",
					priceCurrency: "USD",
				},
				aggregateRating: {
					"@type": "AggregateRating",
					ratingValue: "4.8",
					ratingCount: "1000",
				},
				description:
					"Track and document your baby's developmental milestones month by month with photos, videos, and milestone tracking.",
			},
			{
				"@type": "WebSite",
				"@id": `${siteUrl}/#website`,
				url: siteUrl,
				name: "Tiny Tots Milestones",
				description:
					"Track and document your baby's developmental journey month by month with photos, videos, and milestone tracking.",
				publisher: {
					"@id": `${siteUrl}/#organization`,
				},
			},
		],
	};

	return (
		<div className="min-h-screen">
			<Helmet>
				<title>Tiny Tots Milestones - Track Your Baby's Development Month by Month</title>
				<meta
					name="description"
					content="Track and document your baby's developmental milestones month by month with photos, videos, and milestone tracking. Share precious moments with family and friends through our easy-to-use baby milestone tracker app."
				/>
				<meta
					name="keywords"
					content="baby milestones, baby milestone tracker, monthly baby photos, baby development app, milestone journal, baby growth tracker, parenting tools, baby development tracker, track baby milestones month by month, baby development tracking app, milestone app, parenting app"
				/>

				{/* Open Graph tags for social sharing */}
				<meta
					property="og:title"
					content="Tiny Tots Milestones - Track Your Baby's Development Month by Month"
				/>
				<meta
					property="og:description"
					content="Track and document your baby's developmental milestones month by month with photos, videos, and milestone tracking. Share precious moments with family and friends."
				/>
				<meta property="og:type" content="website" />
				<meta property="og:url" content={currentUrl} />
				<meta property="og:image" content={ogImage} />
				<meta property="og:image:width" content="1200" />
				<meta property="og:image:height" content="630" />
				<meta property="og:site_name" content="Tiny Tots Milestones" />

				{/* Twitter Card data */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta
					name="twitter:title"
					content="Tiny Tots Milestones - Baby Development Tracker"
				/>
				<meta
					name="twitter:description"
					content="Track and document your baby's growth journey month by month with our easy-to-use milestone tracker app."
				/>
				<meta name="twitter:image" content={ogImage} />

				{/* Canonical URL */}
				<link rel="canonical" href={currentUrl} />

				{/* Structured Data */}
				<script type="application/ld+json">
					{JSON.stringify(structuredData)}
				</script>
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
