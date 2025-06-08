import { identifyUser, resetUser, trackEvent } from "@/lib/analytics";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type AuthWrapperContextType = object;

const AuthWrapperContext = createContext<AuthWrapperContextType | undefined>(
	undefined,
);

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user, isAuthenticated } = useAuth();
	const [prevAuthState, setPrevAuthState] = useState<boolean | null>(null);

	// Track authentication state changes
	useEffect(() => {
		// Skip the first render
		if (prevAuthState === null) {
			setPrevAuthState(isAuthenticated);
			return;
		}

		// User just logged in
		if (isAuthenticated && !prevAuthState) {
			if (user) {
				// Identify the user in PostHog
				identifyUser(user.id, {
					email: user.email,
				});

				// Track login event
				trackEvent("user_logged_in");
			}
		}

		// User just logged out
		if (!isAuthenticated && prevAuthState) {
			// Reset the user in PostHog
			resetUser();

			// Track logout event
			trackEvent("user_logged_out");
		}

		setPrevAuthState(isAuthenticated);
	}, [isAuthenticated, user, prevAuthState]);

	return (
		<AuthWrapperContext.Provider value={{}}>
			{children}
		</AuthWrapperContext.Provider>
	);
};

export const useAuthWrapper = () => {
	const context = useContext(AuthWrapperContext);
	if (context === undefined) {
		throw new Error("useAuthWrapper must be used within an AuthWrapper");
	}
	return context;
};
