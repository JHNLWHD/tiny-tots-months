import Layout from "@/components/Layout";
import { TrackingSettings } from "@/components/TrackingSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, ArrowLeft, User, Bell, Shield } from "lucide-react";
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	return (
		<Layout hideHeader={false}>
			<Helmet>
				<title>Settings - Tiny Tots Milestones</title>
				<meta
					name="description"
					content="Manage your account settings, privacy preferences, and more."
				/>
			</Helmet>

			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<SettingsIcon className="h-8 w-8 text-baby-purple" aria-hidden="true" />
						<h1 className="text-3xl font-bold text-gray-800">Settings</h1>
					</div>
					<Button
						variant="ghost"
						className="flex items-center gap-2"
						onClick={() => navigate("/app")}
					>
						<ArrowLeft size={16} />
						Back to Dashboard
					</Button>
				</div>

				<div className="space-y-8">
					{/* Account Information */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<User className="h-5 w-5 text-gray-600" />
								<CardTitle>Account Information</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-sm text-gray-500">Email Address</label>
								<p className="font-medium text-gray-900">{user?.email}</p>
							</div>
							<div>
								<label className="text-sm text-gray-500">Account Created</label>
								<p className="font-medium text-gray-900">
									{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
								</p>
							</div>
							<div>
								<label className="text-sm text-gray-500">User ID</label>
								<p className="font-mono text-xs text-gray-600">{user?.id}</p>
							</div>
						</CardContent>
					</Card>

					{/* Privacy & Tracking Settings */}
					<TrackingSettings />

					{/* Notifications (Placeholder for future) */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Bell className="h-5 w-5 text-gray-600" />
								<CardTitle>Notifications</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
								<p>📧 Email notifications and preferences will be available in a future update.</p>
								<p className="mt-2">For now, important account updates will be sent to your registered email address.</p>
							</div>
						</CardContent>
					</Card>

					{/* Data & Privacy */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Shield className="h-5 w-5 text-gray-600" />
								<CardTitle>Data & Privacy</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="text-sm text-gray-600 space-y-3">
								<p>
									<strong>Data Retention:</strong> Your baby milestone data is stored securely and 
									is only accessible by you through your account.
								</p>
								<p>
									<strong>Data Export:</strong> Contact our support team if you need to export 
									your data or delete your account.
								</p>
								<p>
									<strong>Sharing:</strong> Content is only shared when you explicitly generate 
									and distribute shareable links.
								</p>
							</div>
							<div className="pt-4 border-t border-gray-200">
								<div className="flex gap-3">
									<Button variant="outline" size="sm">
										Request Data Export
									</Button>
									<Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
										Delete Account
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Support */}
					<Card>
						<CardHeader>
							<CardTitle>Need Help?</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-600 mb-4">
								Have questions about your account or need assistance? Our support team is here to help.
							</p>
							<div className="flex gap-3">
								<Button 
									variant="outline" 
									size="sm" 
									onClick={() => navigate("/help")}
								>
									Help Center
								</Button>
								<Button 
									variant="outline" 
									size="sm"
									onClick={() => navigate("/contact")}
								>
									Contact Support
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</Layout>
	);
};

export default Settings; 