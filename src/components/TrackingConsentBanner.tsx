import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, X, Activity, Eye } from "lucide-react";
import { optInToTracking, optOutOfTracking, getTrackingStatus } from "@/lib/analytics";

export const TrackingConsentBanner: React.FC = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [hasUserDecided, setHasUserDecided] = useState(false);

	useEffect(() => {
		// Check if user has already made a decision
		const userDecision = localStorage.getItem("tracking_consent_decision");
		const trackingStatus = getTrackingStatus();
		
		if (userDecision) {
			setHasUserDecided(true);
			setIsVisible(false);
		} else if (trackingStatus.hasOptedOut) {
			// Show banner if user hasn't made a decision and is currently opted out
			setIsVisible(true);
		}
	}, []);

	const handleOptIn = () => {
		optInToTracking();
		localStorage.setItem("tracking_consent_decision", "accepted");
		setHasUserDecided(true);
		setIsVisible(false);
	};

	const handleOptOut = () => {
		optOutOfTracking();
		localStorage.setItem("tracking_consent_decision", "declined");
		setHasUserDecided(true);
		setIsVisible(false);
	};

	const handleDismiss = () => {
		// User dismissed without choosing - respect their choice
		localStorage.setItem("tracking_consent_decision", "dismissed");
		setHasUserDecided(true);
		setIsVisible(false);
	};

	// Don't show in development mode
	if (import.meta.env.DEV || !isVisible || hasUserDecided) {
		return null;
	}

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/20 to-transparent">
			<Card className="max-w-4xl mx-auto p-4 bg-white/95 backdrop-blur-sm border-blue-200 shadow-lg">
				<div className="flex items-start gap-4">
					<div className="flex-shrink-0">
						<Shield className="h-6 w-6 text-blue-600 mt-1" />
					</div>
					
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-2">
							<h3 className="font-semibold text-gray-900">
								Help us improve your experience
							</h3>
							<Badge variant="secondary" className="bg-blue-100 text-blue-700">
								Optional
							</Badge>
						</div>
						
						<p className="text-sm text-gray-600 mb-3">
							We'd like to collect anonymous error reports to help us fix issues and improve the app. 
							This includes technical error details but no personal information. You can change this 
							setting anytime in your preferences.
						</p>
						
						<div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
							<Activity className="h-3 w-3" />
							<span>Error monitoring helps us provide better support</span>
							<span>•</span>
							<Eye className="h-3 w-3" />
							<span>No personal data is collected</span>
							<span>•</span>
							<Shield className="h-3 w-3" />
							<span>You can opt-out anytime</span>
						</div>

						<div className="flex items-center gap-3">
							<Button
								onClick={handleOptIn}
								size="sm"
								className="bg-blue-600 hover:bg-blue-700 text-white"
							>
								Enable Error Monitoring
							</Button>
							
							<Button
								onClick={handleOptOut}
								variant="outline"
								size="sm"
								className="text-gray-600 border-gray-300"
							>
								No Thanks
							</Button>
							
							<Button
								onClick={handleDismiss}
								variant="ghost"
								size="sm"
								className="text-gray-500 ml-auto"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}; 