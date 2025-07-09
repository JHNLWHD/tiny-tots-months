import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Activity, Eye, AlertCircle } from "lucide-react";
import { optInToTracking, optOutOfTracking, getTrackingStatus } from "@/lib/analytics";

export const TrackingSettings: React.FC = () => {
	const [trackingStatus, setTrackingStatus] = useState(getTrackingStatus());
	const [isLoading, setIsLoading] = useState(false);

	const updateTrackingStatus = () => {
		setTrackingStatus(getTrackingStatus());
	};

	useEffect(() => {
		// Update status when component mounts
		updateTrackingStatus();
	}, []);

	const handleToggleTracking = async () => {
		setIsLoading(true);
		
		try {
			if (trackingStatus.hasOptedOut) {
				optInToTracking();
				localStorage.setItem("tracking_consent_decision", "accepted");
			} else {
				optOutOfTracking();
				localStorage.setItem("tracking_consent_decision", "declined");
			}
			
			// Update status after a brief delay to allow PostHog to process
			setTimeout(() => {
				updateTrackingStatus();
				setIsLoading(false);
			}, 100);
		} catch (error) {
			console.error("Error toggling tracking:", error);
			setIsLoading(false);
		}
	};

	const resetConsentDecision = () => {
		localStorage.removeItem("tracking_consent_decision");
		// Optionally show the banner again by forcing a page reload or updating state
	};

	return (
		<Card className="w-full">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-2">
					<Shield className="h-5 w-5 text-blue-600" />
					<CardTitle className="text-lg">Privacy & Error Monitoring</CardTitle>
					<Badge variant="secondary" className="bg-blue-100 text-blue-700">
						{!trackingStatus.hasOptedOut ? "Enabled" : "Disabled"}
					</Badge>
				</div>
			</CardHeader>
			
			<CardContent className="space-y-6">
				{/* Main Toggle */}
				<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-1">
							<Activity className="h-4 w-4 text-gray-600" />
							<h4 className="font-medium text-gray-900">
								Anonymous Error Monitoring
							</h4>
						</div>
						<p className="text-sm text-gray-600">
							Help us improve the app by sending anonymous error reports when issues occur.
						</p>
					</div>
					<Switch
						checked={!trackingStatus.hasOptedOut}
						onCheckedChange={handleToggleTracking}
						disabled={isLoading}
						className="ml-4"
					/>
				</div>

				{/* Information Section */}
				<div className="space-y-3">
					<h4 className="font-medium text-gray-900 flex items-center gap-2">
						<Eye className="h-4 w-4" />
						What we collect
					</h4>
					
					<div className="space-y-2 text-sm text-gray-600">
						<div className="flex items-start gap-2">
							<div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
							<span>Technical error details (error messages, stack traces)</span>
						</div>
						<div className="flex items-start gap-2">
							<div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
							<span>App performance metrics</span>
						</div>
						<div className="flex items-start gap-2">
							<div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
							<span>General usage analytics (page views, feature usage)</span>
						</div>
					</div>

					<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
						<div className="flex items-start gap-2">
							<AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
							<div className="text-sm">
								<p className="text-amber-800 font-medium">What we DON'T collect</p>
								<p className="text-amber-700 mt-1">
									Personal information, baby photos, private data, or any content you create in the app.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Status Information */}
				<div className="pt-4 border-t border-gray-200">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
						<div>
							<span className="text-gray-500">Status:</span>
							<p className="font-medium">
								{!trackingStatus.hasOptedOut ? "Enabled" : "Disabled"}
							</p>
						</div>
						<div>
							<span className="text-gray-500">Session ID:</span>
							<p className="font-mono text-xs">
								{trackingStatus.sessionId?.slice(0, 8)}...
							</p>
						</div>
						<div>
							<span className="text-gray-500">Last Updated:</span>
							<p>{new Date().toLocaleDateString()}</p>
						</div>
					</div>
				</div>

				{/* Development Only */}
				{import.meta.env.DEV && (
					<div className="pt-4 border-t border-gray-200">
						<p className="text-xs text-gray-500 mb-2">Development Controls:</p>
						<Button
							onClick={resetConsentDecision}
							variant="outline"
							size="sm"
							className="text-xs"
						>
							Reset Consent Decision
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}; 