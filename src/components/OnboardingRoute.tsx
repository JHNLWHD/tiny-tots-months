import { useBabyProfiles } from "@/hooks/useBabyProfiles";
import { Navigate } from "react-router-dom";

type OnboardingRouteProps = {
	children: React.ReactNode;
};

/**
 * Route wrapper that ensures user has at least one baby profile.
 * Redirects to /app/onboarding if no babies exist.
 */
const OnboardingRoute = ({ children }: OnboardingRouteProps) => {
	const { babies, loading } = useBabyProfiles();

	if (loading) {
		return (
			<div className="min-h-screen joyful-gradient flex items-center justify-center">
				<div className="animate-pulse text-baby-purple">Loading...</div>
			</div>
		);
	}

	// If user has no babies, redirect to onboarding
	if (babies.length === 0) {
		return <Navigate to="/app/onboarding" replace />;
	}

	return <>{children}</>;
};

export default OnboardingRoute;
