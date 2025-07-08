import posthog, { type Properties } from "posthog-js";

// PostHog public key - this is fine to expose in the frontend code
const POSTHOG_API_KEY =
	import.meta.env.VITE_POSTHOG_API_KEY || "phc_YourPostHogPublicKeyHere";
const POSTHOG_HOST =
	import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";

// Initialize PostHog
export const initAnalytics = () => {
	if (typeof window !== "undefined") {
		posthog.init(POSTHOG_API_KEY, {
			api_host: POSTHOG_HOST,
			loaded: (posthog) => {
				if (process.env.NODE_ENV === "development") {
					// In development, log instead of sending events
					posthog.opt_out_capturing();
				}
			},
		});
	}
};

// Track event wrapper function
export const trackEvent = (eventName: string, properties?: Properties) => {
	if (typeof window !== "undefined") {
		posthog.capture(eventName, properties);
	}
};

// Identify user
export const identifyUser = (userId: string, userProperties?: Properties) => {
	if (typeof window !== "undefined") {
		posthog.identify(userId, userProperties);
	}
};

// Reset user (for logout)
export const resetUser = () => {
	if (typeof window !== "undefined") {
		posthog.reset();
	}
};

// Page view tracking (manual)
export const trackPageView = (url?: string) => {
	if (typeof window !== "undefined") {
		posthog.capture("$pageview", {
			$current_url: url || window.location.href,
		});
	}
};
