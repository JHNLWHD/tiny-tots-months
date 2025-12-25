import Layout from "@/components/Layout";
import { PaymentApproval } from "@/components/admin/PaymentApproval";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Admin = () => {
	const navigate = useNavigate();

	return (
		<Layout hideHeader>
			<Helmet>
				<title>Admin Dashboard - Tiny Tots Milestones</title>
				<meta
					name="description"
					content="Admin dashboard for managing payment approvals and system administration."
				/>
			</Helmet>

			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<Shield className="h-8 w-8 text-baby-purple" aria-hidden="true" />
						<h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
					</div>
					<Button
						variant="ghost"
						className="flex items-center gap-2"
						onClick={() => navigate("/app")}
					>
						<ArrowLeft size={16} />
						Back to App
					</Button>
				</div>

				<div className="space-y-6">
					{/* Admin Info Card */}
					<Card>
						<CardHeader>
							<CardTitle>Payment Management</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-600 mb-4">
								Review and approve pending payment transactions. Approved payments
								will automatically grant credits or activate subscriptions.
							</p>
						</CardContent>
					</Card>

					{/* Payment Approval Component */}
					<PaymentApproval />
				</div>
			</div>
		</Layout>
	);
};

export default Admin;

