import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import React from "react";
import { Helmet } from "react-helmet-async";

const TermsOfService = () => {
	return (
		<Layout hideHeader={false}>
			<Helmet>
				<title>Terms of Service - Tiny Tots Milestones</title>
				<meta
					name="description"
					content="Terms of Service for Tiny Tots Milestones - Please read our terms before using our service."
				/>
			</Helmet>

			<div className="max-w-4xl mx-auto">
				<div className="flex items-center mb-8 gap-3">
					<FileText className="h-8 w-8 text-baby-purple" aria-hidden="true" />
					<h1 className="text-3xl font-bold text-gray-800">Terms of Service</h1>
				</div>

				<Card className="mb-8 shadow-md">
					<CardHeader>
						<CardTitle>Terms and Conditions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-left">
						<p>Last Updated: May 4, 2025</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							1. Agreement to Terms
						</h2>
						<p>
							By accessing or using Tiny Tots Milestones, you agree to be bound
							by these Terms of Service. If you do not agree to all the terms,
							please do not access or use our services.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							2. Description of Service
						</h2>
						<p>
							Tiny Tots Milestones provides an online platform for parents to
							document and share their baby's developmental journey with
							features including milestone tracking, media uploads, and sharing
							capabilities.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							3. Account Registration
						</h2>
						<p>
							To use certain features of our service, you must register for an
							account. You agree to provide accurate information and are
							responsible for maintaining the security of your account
							credentials. You are responsible for all activities that occur
							under your account.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							4. User Content
						</h2>
						<p>
							You retain all rights to the content you upload to Tiny Tots
							Milestones. By uploading content, you grant us a license to host,
							store, and display your content to provide our services. You are
							solely responsible for the content you upload and must have the
							necessary rights to share it.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							5. Subscription and Payment
						</h2>
						<p>
							We offer both free and premium subscription plans. By subscribing
							to our premium service, you agree to pay all fees in accordance
							with our pricing terms. Subscription fees are non-refundable
							except as required by law.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							6. Sharing Features
						</h2>
						<p>
							Our service allows you to share content with others through
							generated links. You control who you share content with and are
							responsible for managing these sharing permissions. Anyone with
							access to a share link may view the content associated with that
							link.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							7. Prohibited Uses
						</h2>
						<p>You agree not to:</p>
						<ul className="list-disc pl-6 space-y-2 mt-2">
							<li>Use our service for any unlawful purpose</li>
							<li>Upload harmful or offensive content</li>
							<li>Attempt to access other users' accounts or data</li>
							<li>Interfere with or disrupt our services</li>
							<li>Attempt to reverse engineer our software</li>
						</ul>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							8. Termination
						</h2>
						<p>
							We reserve the right to suspend or terminate your account for
							violations of these terms. Upon termination, your right to use the
							service will cease immediately. All provisions that should survive
							termination shall remain in effect.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							9. Disclaimer of Warranties
						</h2>
						<p>
							Our service is provided "as is" without warranties of any kind,
							either express or implied. We do not guarantee that our service
							will be uninterrupted, timely, secure, or error-free.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							10. Limitation of Liability
						</h2>
						<p>
							To the maximum extent permitted by law, Tiny Tots Milestones shall
							not be liable for any indirect, incidental, special,
							consequential, or punitive damages resulting from your use or
							inability to use our service.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							11. Changes to Terms
						</h2>
						<p>
							We may revise these Terms of Service at any time. By continuing to
							use our service after changes become effective, you agree to be
							bound by the revised terms.
						</p>

						<h2 className="text-xl font-semibold text-gray-800 mt-6">
							12. Contact
						</h2>
						<p>
							If you have questions about these Terms, please contact us at
							hello@tinytotsmilestones.com.
						</p>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
};

export default TermsOfService;
