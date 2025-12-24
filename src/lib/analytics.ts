import posthog from "posthog-js";

// PostHog public key - this is fine to expose in the frontend code
const POSTHOG_API_KEY =
	import.meta.env.VITE_POSTHOG_API_KEY || "phc_YourPostHogPublicKeyHere";
const POSTHOG_HOST =
	import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";

// Initialize PostHog with error monitoring
export const initAnalytics = () => {
	if (import.meta.env.DEV) {
		console.log("📊 Analytics: Initializing PostHog in development mode");
		console.log("📊 PostHog API Key:", POSTHOG_API_KEY);
		console.log("📊 PostHog Host:", POSTHOG_HOST);
		
		if (POSTHOG_API_KEY === "phc_YourPostHogPublicKeyHere") {
			console.warn("⚠️ Using default PostHog API key. Please set VITE_POSTHOG_API_KEY in your environment variables.");
		}
	}

	posthog.init(POSTHOG_API_KEY, {
		api_host: POSTHOG_HOST,
		// Enable debug mode in development
		loaded: (posthog) => {
			if (import.meta.env.DEV) {
				posthog.debug(true);
				console.log("📊 PostHog loaded and debug mode enabled");
				
				// Test connection immediately
				console.log("🧪 Testing PostHog connection with a ping event...");
				posthog.capture("posthog_connection_test", {
					timestamp: new Date().toISOString(),
					test_source: "analytics_init",
					url: window.location.href
				});
				
				// Check if PostHog is properly initialized
				setTimeout(() => {
					console.log("📊 PostHog status check:");
					console.log("- Is opted out?", posthog.has_opted_out_capturing());
					console.log("- Session ID:", posthog.get_session_id());
					console.log("- Distinct ID:", posthog.get_distinct_id());
					console.log("- PostHog config:", posthog.config);
				}, 1000);
			}
		},
		// Enable autocapture for better tracking
		autocapture: true,
		capture_pageview: true, // Enable pageview tracking
		disable_session_recording: import.meta.env.DEV, // Disable session recording in dev to reduce noise
		// Allow localhost in development
		opt_out_capturing_by_default: false,
		// Enable persistence
		persistence: 'localStorage',
		// Cross-domain cookie settings
		cross_subdomain_cookie: false,
	});

	// Set up global error handlers
	setupGlobalErrorHandlers();
};

// Error severity levels
export enum ErrorSeverity {
	LOW = "low",
	MEDIUM = "medium", 
	HIGH = "high",
	CRITICAL = "critical"
}

// Error categories for better organization
export enum ErrorCategory {
	API = "api",
	AUTH = "auth",
	DATABASE = "database",
	FILE_UPLOAD = "file_upload",
	VALIDATION = "validation",
	GENERAL = "general",
	UNHANDLED = "unhandled",
}

// Type for error tracking
type ErrorTrackingData = {
	message: string;
	stack?: string;
	category: ErrorCategory;
	severity: ErrorSeverity;
	context?: Record<string, any>;
	userId?: string;
	url?: string;
	userAgent?: string;
	timestamp?: string;
}

// Track errors with detailed context
export const trackError = (
	error: Error,
	category: ErrorCategory = ErrorCategory.GENERAL,
	severity: ErrorSeverity = ErrorSeverity.MEDIUM,
	additionalData?: Record<string, any>
) => {
	const errorData = {
		error_message: error.message,
		error_stack: error.stack,
		error_name: error.name,
		category,
		severity,
		timestamp: new Date().toISOString(),
		user_agent: navigator.userAgent,
		url: window.location.href,
		environment: import.meta.env.DEV ? 'development' : 'production',
		...additionalData,
	};

	// Send to PostHog
	posthog.capture("error_occurred", errorData);

	if (import.meta.env.DEV) {
		console.group(`🚨 Error tracked [${category}/${severity}]`);
		console.error("Error:", error.message);
		console.log("Error data sent to PostHog:", errorData);
		console.log("PostHog instance:", posthog);
		console.log("PostHog config:", posthog.config);
		console.groupEnd();
		
		// Also test if PostHog is working by sending a simple test event
		if (error.message.includes("Test")) {
			console.log("🧪 Sending test ping event to verify PostHog connection...");
			posthog.capture("dev_test_ping", {
				timestamp: new Date().toISOString(),
				test_type: "error_monitoring_verification"
			});
		}
	}
};

// Track performance metrics
export const trackPerformance = (metricName: string, value: number, unit: string = "ms") => {
	if (typeof window === "undefined") return;

	posthog.capture("performance_metric", {
		metric_name: metricName,
		value,
		unit,
		timestamp: new Date().toISOString(),
		url: window.location.href,
	});
};

// Track user actions with error context
export const trackUserAction = (
	actionName: string, 
	properties?: any,
	errorContext?: { hadErrors: boolean; errorCount?: number }
) => {
	if (typeof window === "undefined") return;

	posthog.capture(actionName, {
		...properties,
		...errorContext,
		timestamp: new Date().toISOString(),
	});
};

// Track API errors specifically
export const trackApiError = (
	endpoint: string,
	method: string,
	statusCode: number,
	errorMessage: string,
	requestData?: any
) => {
	trackError(
		new Error(`API Error: ${method} ${endpoint} - ${statusCode}: ${errorMessage}`),
		ErrorCategory.API,
		statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
		{
			endpoint,
			method,
			status_code: statusCode,
			request_data: requestData,
		}
	);
};

// Track file upload errors
export const trackFileUploadError = (
	error: Error,
	fileType?: string,
	fileSize?: number,
	uploadStage?: string
) => {
	trackError(error, ErrorCategory.FILE_UPLOAD, ErrorSeverity.MEDIUM, {
		file_type: fileType,
		file_size: fileSize,
		upload_stage: uploadStage,
	});
};

// Track authentication errors
export const trackAuthError = (error: Error, authAction?: string) => {
	trackError(error, ErrorCategory.AUTH, ErrorSeverity.HIGH, {
		auth_action: authAction,
	});
};

// Track database/Supabase errors
export const trackDatabaseError = (
	error: Error,
	operation?: string,
	table?: string,
	userId?: string
) => {
	trackError(error, ErrorCategory.DATABASE, ErrorSeverity.HIGH, {
		db_operation: operation,
		db_table: table,
		user_id: userId,
	});
};

// Set up global error handlers for unhandled errors
const setupGlobalErrorHandlers = () => {
	// Handle unhandled JavaScript errors
	window.addEventListener('error', (event) => {
		trackError(
			event.error || new Error(event.message),
			ErrorCategory.UNHANDLED,
			ErrorSeverity.HIGH,
			{
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno,
				source: 'window.error'
			}
		);
	});

	// Handle unhandled promise rejections
	window.addEventListener('unhandledrejection', (event) => {
		trackError(
			event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
			ErrorCategory.UNHANDLED,
			ErrorSeverity.HIGH,
			{
				source: 'unhandledrejection',
				reason_type: typeof event.reason
			}
		);
	});

	if (import.meta.env.DEV) {
		console.log("🛡️ Analytics: Global error handlers set up");
	}
};

// Track event wrapper function (existing)
export const trackEvent = (eventName: string, properties?: any) => {
	posthog.capture(eventName, properties);
};

// Identify user (existing)
export const identifyUser = (userId: string, properties?: any) => {
	posthog.identify(userId, properties);
};

// Reset user (existing)
export const resetUser = () => {
	if (typeof window !== "undefined") {
		posthog.reset();
	}
};

// Page view tracking (existing)
export const trackPageView = (url?: string) => {
	if (typeof window !== "undefined") {
		posthog.capture("$pageview", {
			$current_url: url || window.location.href,
		});
	}
};

// Feature flag helper
export const isFeatureEnabled = (flagKey: string): boolean => {
	if (typeof window === "undefined") return false;
	return posthog.isFeatureEnabled(flagKey) ?? false;
};

// Set user properties for better segmentation
export const setUserProperties = (properties: any) => {
	if (typeof window !== "undefined") {
		posthog.setPersonProperties(properties);
	}
};

// Group analytics for organization-level tracking
export const identifyGroup = (groupType: string, groupKey: string, properties?: any) => {
	if (typeof window !== "undefined") {
		posthog.group(groupType, groupKey, properties);
	}
};

export const trackValidationError = (
	error: Error,
	field?: string,
	value?: any
) => {
	trackError(error, ErrorCategory.VALIDATION, ErrorSeverity.LOW, {
		field_name: field,
		field_value: typeof value === 'string' ? value : JSON.stringify(value),
	});
};

// Debug function for development - test PostHog connectivity
export const testPostHogConnection = () => {
	if (!import.meta.env.DEV) return;
	
	console.log("🧪 Testing PostHog connection...");
	
	// Check if user has opted out
	const hasOptedOut = posthog.has_opted_out_capturing();
	if (hasOptedOut) {
		console.warn("⚠️ PostHog tracking is OPTED OUT! This is why events aren't being sent.");
		console.log("🔧 To enable tracking, call posthog.opt_in_capturing()");
		
		// Auto opt-in for development testing
		console.log("🔧 Auto-opting in for development testing...");
		posthog.opt_in_capturing();
		console.log("✅ Opted back in to PostHog tracking");
	}
	
	// Test basic event
	posthog.capture("debug_test_event", {
		timestamp: new Date().toISOString(),
		test_type: "manual_connection_test",
		user_agent: navigator.userAgent,
		url: window.location.href
	});
	
	// Check PostHog status
	console.log("📊 PostHog Debug Info:");
	console.log("- PostHog loaded:", !!posthog);
	console.log("- Has opted out:", posthog.has_opted_out_capturing());
	console.log("- Distinct ID:", posthog.get_distinct_id());
	console.log("- Session ID:", posthog.get_session_id());
	console.log("- Config:", posthog.config);
	
	// Check network
	console.log("🌐 Making direct test call to PostHog...");
	fetch('https://app.posthog.com/capture/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			api_key: POSTHOG_API_KEY,
			event: 'debug_network_test',
			properties: {
				timestamp: new Date().toISOString(),
				source: 'direct_fetch_test'
			},
			distinct_id: posthog.get_distinct_id()
		})
	})
	.then(response => {
		console.log("✅ Direct PostHog API test response:", response.status, response.statusText);
		if (response.status === 200) {
			console.log("🎉 PostHog connection is working! Events should now be sent successfully.");
		}
	})
	.catch(error => {
		console.error("❌ Direct PostHog API test failed:", error);
	});
};

// Utility functions for managing opt-in/opt-out
export const optInToTracking = () => {
	posthog.opt_in_capturing();
	if (import.meta.env.DEV) {
		console.log("✅ Opted in to PostHog tracking");
	}
};

export const optOutOfTracking = () => {
	posthog.opt_out_capturing();
	if (import.meta.env.DEV) {
		console.log("❌ Opted out of PostHog tracking");
	}
};

export const getTrackingStatus = () => {
	return {
		hasOptedOut: posthog.has_opted_out_capturing(),
		distinctId: posthog.get_distinct_id(),
		sessionId: posthog.get_session_id(),
	};
};
