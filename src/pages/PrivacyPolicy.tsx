import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import React from "react";
import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => {
	const siteUrl = "https://tinytotsmilestones.com";
	const currentUrl = typeof window !== "undefined" ? window.location.href : `${siteUrl}/privacy-policy`;
	const ogImage = `${siteUrl}/og-image.png`;

	return (
		<Layout hideHeader={false}>
			<Helmet>
				<title>Privacy Policy - Tiny Tots Milestones</title>
				<meta
					name="description"
					content="Privacy Policy for Tiny Tots Milestones - Learn how we protect your data and your baby's information. We take data security and privacy seriously."
				/>
				<meta
					name="keywords"
					content="Tiny Tots Milestones privacy policy, baby milestone app privacy, data protection, baby tracker security, parenting app privacy, child data protection"
				/>

				{/* Open Graph tags */}
				<meta property="og:title" content="Privacy Policy - Tiny Tots Milestones" />
				<meta
					property="og:description"
					content="Privacy Policy for Tiny Tots Milestones - Learn how we protect your data and your baby's information."
				/>
				<meta property="og:type" content="website" />
				<meta property="og:url" content={currentUrl} />
				<meta property="og:image" content={ogImage} />

				{/* Twitter Card */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content="Privacy Policy - Tiny Tots Milestones" />
				<meta
					name="twitter:description"
					content="Learn how Tiny Tots Milestones protects your data and your baby's information."
				/>
				<meta name="twitter:image" content={ogImage} />

				{/* Canonical URL */}
				<link rel="canonical" href={currentUrl} />
			</Helmet>

			<div className="max-w-4xl mx-auto">
				<div className="flex items-center mb-8 gap-3">
					<Shield className="h-8 w-8 text-baby-purple" aria-hidden="true" />
					<h1 className="text-3xl font-bold text-gray-800">Privacy Policy</h1>
				</div>

				<Card className="mb-8 shadow-md">
					<CardHeader>
						<CardTitle>Your Privacy Matters</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-left">
						<p>Last Updated: May 4, 2025</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							1. Introduction
						</h2>
						<p>
							At Tiny Tots Milestones ("we", "our", or "us"), we respect your
							privacy and are committed to protecting the personal information
							you share with us. This Privacy Policy explains how we collect,
							use, disclose, and safeguard your information when you use our
							website and services.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							2. Information We Collect
						</h2>
						<p>
							We collect information that you voluntarily provide to us when
							you:
						</p>
						<ul className="list-disc pl-6 space-y-2 mt-2">
							<li>Register for an account</li>
							<li>Create baby profiles</li>
							<li>Upload photos, videos, and milestone information</li>
							<li>Subscribe to our premium services</li>
							<li>Contact our support team</li>
						</ul>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							3. How We Use Your Information
						</h2>
						<p>We use your information to:</p>
						<ul className="list-disc pl-6 space-y-2 mt-2">
							<li>Provide and maintain our services</li>
							<li>Process and manage your account</li>
							<li>Store and organize your baby's milestone data and media</li>
							<li>Generate shareable links when you choose to share content</li>
							<li>Process subscription payments and verify premium status</li>
							<li>Improve our services and develop new features</li>
						</ul>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							4. Data Storage and Security
						</h2>
						<p>
							We implement industry-standard security measures to protect your
							personal information. All data is stored in secure cloud
							databases, and media files are stored with unique identifiers to
							prevent unauthorized access.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							5. Sharing Your Information
						</h2>
						<p>
							We do not sell or rent your personal information to third parties.
							Your data is only shared when:
						</p>
						<ul className="list-disc pl-6 space-y-2 mt-2">
							<li>
								You explicitly choose to share content via our sharing features
							</li>
							<li>Required by law or to protect our rights</li>
							<li>
								With service providers who assist us in operating our website
								and services (all bound by confidentiality agreements)
							</li>
						</ul>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							6. Your Rights
						</h2>
						<p>
							You have the right to access, correct, or delete your personal
							information. You can manage most of this directly within your
							account settings, or contact us for assistance.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							7. Children's Privacy
						</h2>
						<p>
							Our service is designed for parents and guardians to document
							their children's development. We do not knowingly collect
							information directly from children under 13. All child data is
							managed by parents or legal guardians.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							8. Changes to this Policy
						</h2>
						<p>
							We may update our Privacy Policy from time to time. We will notify
							you of any changes by posting the new Privacy Policy on this page
							and updating the "Last Updated" date.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							9. Contact Us
						</h2>
						<p>
							If you have questions about this Privacy Policy, please contact us
							at hello@tinytotsmilestones.com.
						</p>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
};

export default PrivacyPolicy;
