import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

type ProtectedRouteProps = {
	children: React.ReactNode;
	requirePremium?: boolean;
};

const ProtectedRoute = ({
	children,
	requirePremium = false,
}: ProtectedRouteProps) => {
	const { isAuthenticated, loading: authLoading } = useAuth();
	const {
		isPremium,
		isPending,
		loading: subscriptionLoading,
	} = useSubscription();
	const location = useLocation();

	const loading = authLoading || subscriptionLoading;

	if (loading) {
		return (
			<div className="min-h-screen joyful-gradient flex items-center justify-center">
				<div className="animate-pulse text-baby-purple">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/auth" replace />;
	}

	if (requirePremium && !isPremium) {
		// If subscription is pending, show a message that it's being processed
		if (isPending) {
			return (
				<div className="min-h-screen bg-gray-50 py-12">
					<div className="container mx-auto px-4 text-center">
						<div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
							<div className="text-amber-500 mb-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-12 w-12 mx-auto"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<title>Processing Premium Upgrade</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h2 className="text-2xl font-bold mb-4">
								Premium Upgrade in Process
							</h2>
							<p className="text-gray-600 mb-6">
								Your premium upgrade is currently being processed. This
								typically takes up to 24 hours. You'll gain access to this
								feature once your upgrade is approved.
							</p>
							<button
								onClick={() => window.history.back()}
								className="px-4 py-2 bg-baby-purple text-white rounded hover:bg-baby-purple/90"
								type="button"
							>
								Go Back
							</button>
						</div>
					</div>
				</div>
			);
		}

		// Otherwise redirect to upgrade page
		return <Navigate to="/app/upgrade" replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
