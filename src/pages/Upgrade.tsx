import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlanComparison } from "@/components/upgrade/PlanComparison";
import { SubscriptionStatus } from "@/components/upgrade/SubscriptionStatus";
import { useSubscription } from "@/hooks/useSubscription";
import { trackEvent, trackPageView } from "@/lib/analytics";
import { ArrowLeft } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Upgrade = () => {
	const navigate = useNavigate();
	const { isPremium, isPending, loading } = useSubscription();

	// Track page view with additional details
	useEffect(() => {
		trackPageView();
		// Track additional page details
		const pageType = isPremium
			? "already_premium"
			: isPending
				? "pending_upgrade"
				: "can_upgrade";
		trackEvent("viewed_upgrade_page", { page_type: pageType });
	}, [isPremium, isPending]);

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="container mx-auto px-4">
				<Button
					variant="ghost"
					className="mb-8 flex items-center gap-2"
					onClick={() => navigate("/app")}
				>
					<ArrowLeft size={16} />
					Back to Dashboard
				</Button>

				<h1 className="text-3xl font-bold text-center mb-8">
					Upgrade to Premium
				</h1>

				<div className="max-w-4xl mx-auto">
					{loading ? (
						<Card className="p-8 text-center">
							<div className="animate-pulse text-baby-purple">
								Loading subscription status...
							</div>
						</Card>
					) : !isPremium || isPending ? (
						<PlanComparison />
					) : (
						<PlanComparison />
					)}

					<div className="mt-8 text-center text-gray-500 text-sm">
						<p>
							Need help? Contact our support team at
							hello@tinytotsmilestones.com
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Upgrade;
