import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSubscription } from "@/hooks/useSubscription";
import { formatCentsAmount } from "@/utils/currency";
import { 
	TrendingUp, 
	Zap, 
	Users, 
	Camera, 
	Video, 
	Award, 
	Download,
	AlertTriangle,
	Star,
	Crown
} from "lucide-react";
import { Link } from "react-router-dom";

export const AnalyticsDashboard: React.FC = () => {
	const { 
		analyticsData, 
		creditUsageBreakdown, 
		isLoading, 
		getRecommendations 
	} = useAnalytics();
	
	const { tier, creditsBalance, isPremium } = useSubscription();

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[...Array(6)].map((_, i) => (
					<Card key={i} className="p-6">
						<div className="animate-pulse">
							<div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
							<div className="h-8 bg-gray-200 rounded w-3/4"></div>
						</div>
					</Card>
				))}
			</div>
		);
	}

	if (!analyticsData) return null;

	const recommendations = getRecommendations();

	return (
		<div className="space-y-6">
			{/* Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Subscription Status */}
				<Card className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">Plan</p>
							<p className="text-lg font-semibold capitalize">{tier}</p>
						</div>
						<div className="p-2 bg-baby-purple/10 rounded-lg">
							{tier === "lifetime" ? (
								<Crown className="w-5 h-5 text-baby-purple" />
							) : tier === "family" ? (
								<Star className="w-5 h-5 text-baby-purple" />
							) : (
								<Users className="w-5 h-5 text-baby-purple" />
							)}
						</div>
					</div>
				</Card>

				{/* Credits Balance */}
				<Card className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">Credits</p>
							<p className="text-lg font-semibold">{creditsBalance}</p>
						</div>
						<div className="p-2 bg-blue-100 rounded-lg">
							<Zap className="w-5 h-5 text-blue-600" />
						</div>
					</div>
				</Card>

				{/* Lifetime Value */}
				<Card className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">Lifetime Value</p>
							<p className="text-lg font-semibold">
								{analyticsData.lifetimeValue > 0 
									? formatCentsAmount(analyticsData.lifetimeValue, analyticsData.currency)
									: formatCentsAmount(0, analyticsData.currency)
								}
							</p>
						</div>
						<div className="p-2 bg-green-100 rounded-lg">
							<TrendingUp className="w-5 h-5 text-green-600" />
						</div>
					</div>
				</Card>

				{/* Days as User */}
				<Card className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">Days Active</p>
							<p className="text-lg font-semibold">{analyticsData.conversionMetrics.daysAsUser}</p>
						</div>
						<div className="p-2 bg-purple-100 rounded-lg">
							<Award className="w-5 h-5 text-purple-600" />
						</div>
					</div>
				</Card>
			</div>

			{/* Feature Usage */}
			<Card className="p-6">
				<h3 className="text-lg font-semibold mb-4">Feature Usage</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
					<div className="text-center">
						<div className="p-3 bg-blue-100 rounded-lg mx-auto w-fit mb-2">
							<Users className="w-6 h-6 text-blue-600" />
						</div>
						<p className="text-2xl font-bold text-blue-600">
							{analyticsData.featureUsage.babiesCreated}
						</p>
						<p className="text-sm text-gray-600">Babies</p>
					</div>

					<div className="text-center">
						<div className="p-3 bg-green-100 rounded-lg mx-auto w-fit mb-2">
							<Camera className="w-6 h-6 text-green-600" />
						</div>
						<p className="text-2xl font-bold text-green-600">
							{analyticsData.featureUsage.photosUploaded}
						</p>
						<p className="text-sm text-gray-600">Photos</p>
					</div>

					<div className="text-center">
						<div className="p-3 bg-purple-100 rounded-lg mx-auto w-fit mb-2">
							<Video className="w-6 h-6 text-purple-600" />
						</div>
						<p className="text-2xl font-bold text-purple-600">
							{analyticsData.featureUsage.videosUploaded}
						</p>
						<p className="text-sm text-gray-600">Videos</p>
					</div>

					<div className="text-center">
						<div className="p-3 bg-orange-100 rounded-lg mx-auto w-fit mb-2">
							<Award className="w-6 h-6 text-orange-600" />
						</div>
						<p className="text-2xl font-bold text-orange-600">
							{analyticsData.featureUsage.milestonesCreated}
						</p>
						<p className="text-sm text-gray-600">Milestones</p>
					</div>

					<div className="text-center">
						<div className="p-3 bg-gray-100 rounded-lg mx-auto w-fit mb-2">
							<Download className="w-6 h-6 text-gray-600" />
						</div>
						<p className="text-2xl font-bold text-gray-600">
							{analyticsData.featureUsage.exportsGenerated}
						</p>
						<p className="text-sm text-gray-600">Exports</p>
					</div>
				</div>
			</Card>

			{/* Credit Usage Breakdown */}
			{creditUsageBreakdown && analyticsData.totalCreditsSpent > 0 && (
				<Card className="p-6">
					<h3 className="text-lg font-semibold mb-4">Credit Usage Breakdown</h3>
					<div className="space-y-3">
						{Object.entries(creditUsageBreakdown).map(([key, value]) => {
							if (value === 0) return null;
							
							const percentage = (value / analyticsData.totalCreditsSpent) * 100;
							const labels = {
								extraBabies: "Extra Baby Profiles",
								videoUploads: "Video Uploads",
								extraPhotos: "Extra Photos",
								premiumTemplates: "Premium Templates",
								exports: "Exports"
							};
							
							return (
								<div key={key}>
									<div className="flex justify-between items-center mb-1">
										<span className="text-sm font-medium">{labels[key as keyof typeof labels]}</span>
										<span className="text-sm text-gray-600">{value} credits</span>
									</div>
									<Progress value={percentage} className="h-2" />
								</div>
							);
						})}
					</div>
					
					<div className="mt-4 p-3 bg-gray-50 rounded-lg">
						<p className="text-sm text-gray-600">
							Total credits spent: <span className="font-semibold">{analyticsData.totalCreditsSpent}</span>
						</p>
					</div>
				</Card>
			)}

			{/* Recommendations */}
			{recommendations.length > 0 && (
				<Card className="p-6">
					<div className="flex items-center gap-2 mb-4">
						<AlertTriangle className="w-5 h-5 text-amber-500" />
						<h3 className="text-lg font-semibold">Recommendations</h3>
					</div>
					<div className="space-y-3">
						{recommendations.map((recommendation, index) => (
							<div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
								<div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
								<p className="text-sm text-amber-800">{recommendation}</p>
							</div>
						))}
						<div className="pt-2">
							<Button asChild size="sm">
								<Link to="/app/upgrade">View Upgrade Options</Link>
							</Button>
						</div>
					</div>
				</Card>
			)}

			{/* Churn Risk Alert */}
			{analyticsData.conversionMetrics.churnRisk === "high" && (
				<Card className="p-6 border-red-200 bg-red-50">
					<div className="flex items-center gap-2 mb-3">
						<AlertTriangle className="w-5 h-5 text-red-500" />
						<h3 className="text-lg font-semibold text-red-800">We Miss You!</h3>
					</div>
					<p className="text-sm text-red-700 mb-4">
						It looks like you haven't been active lately. We'd love to help you get the most out of Tiny Tots Milestones!
					</p>
					<div className="flex gap-2">
						<Button asChild size="sm" variant="outline">
							<Link to="/help">Get Help</Link>
						</Button>
						<Button asChild size="sm">
							<Link to="/app/upgrade">Special Offers</Link>
						</Button>
					</div>
				</Card>
			)}

			{/* Engagement Milestone */}
			{analyticsData.conversionMetrics.daysAsUser > 0 && analyticsData.conversionMetrics.daysAsUser % 30 === 0 && (
				<Card className="p-6 border-baby-purple bg-baby-purple/5">
					<div className="flex items-center gap-2 mb-3">
						<Award className="w-5 h-5 text-baby-purple" />
						<h3 className="text-lg font-semibold text-baby-purple">
							{analyticsData.conversionMetrics.daysAsUser} Days Milestone! 🎉
						</h3>
					</div>
					<p className="text-sm text-gray-700 mb-4">
						Congratulations on {analyticsData.conversionMetrics.daysAsUser} days of capturing precious memories! 
						Keep up the amazing work documenting your baby's journey.
					</p>
				</Card>
			)}
		</div>
	);
};

