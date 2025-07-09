import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Bug, Database, Upload, User, Wifi, Activity, Eye, EyeOff } from "lucide-react";
import { trackError, trackApiError, trackFileUploadError, trackAuthError, trackDatabaseError, testPostHogConnection, optInToTracking, optOutOfTracking, getTrackingStatus, ErrorCategory, ErrorSeverity } from "@/lib/analytics";
import { useState, useEffect } from "react";

interface ErrorMonitoringPanelProps {
	isVisible: boolean;
	onToggle: () => void;
}

export const ErrorMonitoringPanel: React.FC<ErrorMonitoringPanelProps> = ({
	isVisible,
	onToggle,
}) => {
	const [testErrors, setTestErrors] = useState<any[]>([]);
	const [trackingStatus, setTrackingStatus] = useState(getTrackingStatus());

	// Test functions to verify error monitoring
	const testGenericError = () => {
		const error = new Error("Test generic error for monitoring");
		trackError(error, ErrorCategory.GENERAL, ErrorSeverity.MEDIUM, {
			test_context: "manual_test",
			user_action: "clicked_test_button",
		});
		setTestErrors(prev => [...prev, { type: "Generic Error", message: error.message, timestamp: new Date() }]);
	};

	const testApiError = () => {
		trackApiError(
			"/api/test-endpoint",
			"POST",
			500,
			"Internal server error during test",
			{ test_data: "sample" }
		);
		setTestErrors(prev => [...prev, { type: "API Error", message: "500: Internal server error", timestamp: new Date() }]);
	};

	const testFileUploadError = () => {
		const error = new Error("Test file upload validation error");
		trackFileUploadError(error, "image/jpeg", 15000000, "validation");
		setTestErrors(prev => [...prev, { type: "File Upload Error", message: error.message, timestamp: new Date() }]);
	};

	const testAuthError = () => {
		const error = new Error("Test authentication failure");
		trackAuthError(error, "login");
		setTestErrors(prev => [...prev, { type: "Auth Error", message: error.message, timestamp: new Date() }]);
	};

	const testDatabaseError = () => {
		const error = new Error("Test database connection error");
		trackDatabaseError(error, "insert", "test_table", "test_user_123");
		setTestErrors(prev => [...prev, { type: "Database Error", message: error.message, timestamp: new Date() }]);
	};

	const testUnhandledError = () => {
		// This will trigger the global error handler
		setTimeout(() => {
			throw new Error("Test unhandled error for global monitoring");
		}, 100);
		setTestErrors(prev => [...prev, { type: "Unhandled Error", message: "Thrown asynchronously", timestamp: new Date() }]);
	};

	const testPostHogConnectivity = () => {
		testPostHogConnection();
		setTestErrors(prev => [...prev, { type: "PostHog Test", message: "Connection test - check console", timestamp: new Date() }]);
	};

	const clearTestErrors = () => {
		setTestErrors([]);
	};

	const toggleTracking = () => {
		if (!trackingStatus.hasOptedOut) {
			optOutOfTracking();
		} else {
			optInToTracking();
		}
		setTrackingStatus(getTrackingStatus());
	};

	useEffect(() => {
		const handleTrackingStatusChange = () => {
			setTrackingStatus(getTrackingStatus());
		};

		window.addEventListener("optInToTracking", handleTrackingStatusChange);
		window.addEventListener("optOutOfTracking", handleTrackingStatusChange);

		return () => {
			window.removeEventListener("optInToTracking", handleTrackingStatusChange);
			window.removeEventListener("optOutOfTracking", handleTrackingStatusChange);
		};
	}, []);

	if (!isVisible) {
		return (
			<div className="fixed bottom-4 right-4 z-50">
				<Button
					onClick={onToggle}
					variant="outline"
					size="sm"
					className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
				>
					<Bug className="h-4 w-4 mr-2" />
					Error Monitor
				</Button>
			</div>
		);
	}

	return (
		<div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-hidden">
			<Card className="p-4 bg-white shadow-lg border-red-200">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<Bug className="h-5 w-5 text-red-600" />
						<h3 className="font-semibold text-red-800">Error Monitoring</h3>
						<Badge variant="secondary" className="bg-red-100 text-red-700">
							DEV
						</Badge>
					</div>
					<Button
						onClick={onToggle}
						variant="ghost"
						size="sm"
						className="text-gray-500"
					>
						×
					</Button>
				</div>

				<div className="space-y-2 mb-4">
					<p className="text-sm text-gray-600">
						Test error monitoring integration:
					</p>
					
					<div className="grid grid-cols-2 gap-2">
						<Button
							onClick={testGenericError}
							variant="outline"
							size="sm"
							className="text-xs"
						>
							<AlertCircle className="h-3 w-3 mr-1" />
							Generic
						</Button>
						
						<Button
							onClick={testApiError}
							variant="outline"
							size="sm"
							className="text-xs"
						>
							<Wifi className="h-3 w-3 mr-1" />
							API
						</Button>
						
						<Button
							onClick={testFileUploadError}
							variant="outline"
							size="sm"
							className="text-xs"
						>
							<Upload className="h-3 w-3 mr-1" />
							Upload
						</Button>
						
						<Button
							onClick={testAuthError}
							variant="outline"
							size="sm"
							className="text-xs"
						>
							<User className="h-3 w-3 mr-1" />
							Auth
						</Button>
						
						<Button
							onClick={testDatabaseError}
							variant="outline"
							size="sm"
							className="text-xs"
						>
							<Database className="h-3 w-3 mr-1" />
							Database
						</Button>
						
						<Button
							onClick={testUnhandledError}
							variant="outline"
							size="sm"
							className="text-xs"
						>
							<Bug className="h-3 w-3 mr-1" />
							Unhandled
						</Button>
					</div>
					
					<div className="mt-2">
						<Button
							onClick={testPostHogConnectivity}
							variant="outline"
							size="sm"
							className="text-xs w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
						>
							<Activity className="h-3 w-3 mr-1" />
							Test PostHog Connection
						</Button>
					</div>
				</div>

				<div className="mt-4 pt-3 border-t border-gray-200">
					<div className="flex items-center justify-between mb-2">
						<p className="text-xs text-gray-500">
							💡 Errors are automatically sent to PostHog for monitoring and analysis.
						</p>
						<Button
							onClick={toggleTracking}
							variant="ghost"
							size="sm"
							className="text-xs text-gray-500"
						>
							{!trackingStatus.hasOptedOut ? (
								<EyeOff className="h-3 w-3 mr-1" />
							) : (
								<Eye className="h-3 w-3 mr-1" />
							)}
							{!trackingStatus.hasOptedOut ? "Opt Out" : "Opt In"}
						</Button>
					</div>
					<p className="text-xs text-gray-500">
						Tracking Status: {!trackingStatus.hasOptedOut ? "Enabled" : "Disabled"}
					</p>
				</div>

				{testErrors.length > 0 && (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<h4 className="text-sm font-medium text-gray-700">
								Recent Test Errors:
							</h4>
							<Button
								onClick={clearTestErrors}
								variant="ghost"
								size="sm"
								className="text-xs text-gray-500"
							>
								Clear
							</Button>
						</div>
						
						<div className="max-h-48 overflow-y-auto space-y-1">
							{testErrors.slice(-10).reverse().map((error, index) => (
								<div
									key={index}
									className="text-xs p-2 bg-red-50 border border-red-200 rounded"
								>
									<div className="flex items-center justify-between">
										<span className="font-medium text-red-700">
											{error.type}
										</span>
										<span className="text-gray-500">
											{error.timestamp.toLocaleTimeString()}
										</span>
									</div>
									<div className="text-gray-600 mt-1">
										{error.message}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</Card>
		</div>
	);
}; 