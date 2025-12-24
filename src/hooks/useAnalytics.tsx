import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
import { getDefaultCurrency } from "@/config/payment";

export type AnalyticsData = {
	totalCreditsEarned: number;
	totalCreditsSpent: number;
	creditBalance: number;
	subscriptionValue: number;
	lifetimeValue: number;
	currency: "PHP" | "USD"; // User's currency for displaying lifetime value
	featureUsage: {
		photosUploaded: number;
		videosUploaded: number;
		babiesCreated: number;
		milestonesCreated: number;
		exportsGenerated: number;
	};
	paymentMetrics: {
		totalPaid: number;
		paymentTransactionCount: number;
		completedPaymentCount: number;
		paymentsByMethod: Record<string, number>;
		paymentsByType: Record<string, number>;
		averagePaymentAmount: number;
		lastPaymentDate?: string;
	};
	conversionMetrics: {
		daysAsUser: number;
		upgradeDate?: string;
		churnRisk: "low" | "medium" | "high";
	};
};

export type CreditUsageBreakdown = {
	extraBabies: number;
	videoUploads: number;
	extraPhotos: number;
	premiumTemplates: number;
	exports: number;
};

export const useAnalytics = () => {
	const { user } = useAuth();

	// Fetch user analytics data
	const {
		data: analyticsData,
		isLoading: isLoadingAnalytics,
		refetch: refetchAnalytics,
	} = useQuery({
		queryKey: ["analytics", user?.id],
		queryFn: async (): Promise<AnalyticsData | null> => {
			if (!user) return null;

			// Fetch credit transactions
			const { data: creditTransactions } = await supabase
				.from("credit_transactions")
				.select("*")
				.eq("user_id", user.id);

			// Fetch payment transactions
			const { data: paymentTransactions } = await supabase
				.from("payment_transactions")
				.select("*")
				.eq("user_id", user.id);

			// Fetch user credits
			const { data: userCredits } = await supabase
				.from("user_credits")
				.select("*")
				.eq("user_id", user.id)
				.single();

			// Fetch subscription data
			const { data: subscription } = await supabase
				.from("subscription")
				.select("*")
				.eq("user_id", user.id)
				.single();

			// Fetch usage data
			const { data: babies } = await supabase
				.from("baby")
				.select("*")
				.eq("user_id", user.id);

			const { data: photos } = await supabase
				.from("photo")
				.select("*")
				.eq("user_id", user.id);

			const { data: milestones } = await supabase
				.from("milestone")
				.select("*")
				.in("baby_id", babies?.map(b => b.id) || []);

			// Calculate metrics
			const totalCreditsEarned = creditTransactions
				?.filter(t => t.transaction_type === "purchase")
				.reduce((sum, t) => sum + t.amount, 0) || 0;

			const totalCreditsSpent = Math.abs(creditTransactions
				?.filter(t => t.transaction_type === "spend")
				.reduce((sum, t) => sum + t.amount, 0) || 0);

			const photosUploaded = photos?.filter(p => !p.is_video).length || 0;
			const videosUploaded = photos?.filter(p => p.is_video).length || 0;

			// Calculate subscription value from actual payments
			let subscriptionValue = 0;
			// Get amount from linked payment transaction if available
			if (subscription?.payment_transaction_id && paymentTransactions) {
				const subscriptionPayment = paymentTransactions.find(
					pt => pt.id === subscription.payment_transaction_id && pt.status === "completed"
				);
				if (subscriptionPayment) {
					subscriptionValue = subscriptionPayment.amount_in_cents;
				}
			}
			
			// Fallback to estimated values if no payment transaction found
			if (subscriptionValue === 0 && subscription?.tier === "family") {
				subscriptionValue = 99900; // ₱999 in cents - yearly value fallback
			} else if (subscriptionValue === 0 && subscription?.tier === "lifetime") {
				subscriptionValue = 249900; // ₱2499 in cents - fallback
			}

			// Calculate payment analytics
			const completedPayments = paymentTransactions?.filter(p => p.status === "completed") || [];
			const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount_in_cents, 0);
			const paymentsByMethod = completedPayments.reduce((acc, p) => {
				acc[p.payment_method] = (acc[p.payment_method] || 0) + p.amount_in_cents;
				return acc;
			}, {} as Record<string, number>);
			const paymentsByType = completedPayments.reduce((acc, p) => {
				acc[p.transaction_type] = (acc[p.transaction_type] || 0) + p.amount_in_cents;
				return acc;
			}, {} as Record<string, number>);

			// Calculate credit purchase value from actual payment transactions
			// Credit transactions have payment_transaction_id linking to payment_transactions
			const creditPurchaseValue = creditTransactions
				?.filter(t => t.transaction_type === "purchase" && t.payment_transaction_id)
				.reduce((sum, ct) => {
					const payment = paymentTransactions?.find(pt => pt.id === ct.payment_transaction_id && pt.status === "completed");
					return sum + (payment?.amount_in_cents || 0);
				}, 0) || 0;

			// For credits without linked payment transactions, estimate value
			// Using $0.05 per credit = 5 cents per credit (converted from dollars to cents)
			const creditsWithoutPayment = totalCreditsEarned - (creditTransactions
				?.filter(t => t.transaction_type === "purchase" && t.payment_transaction_id)
				.reduce((sum, t) => sum + t.amount, 0) || 0);
			const estimatedCreditValue = creditsWithoutPayment * 5; // 5 cents per credit

			// Calculate churn risk
			const daysSinceCreation = subscription?.created_at 
				? Math.floor((Date.now() - new Date(subscription.created_at).getTime()) / (1000 * 60 * 60 * 24))
				: 0;

			let churnRisk: "low" | "medium" | "high" = "low";
			if (subscription?.tier === "free" && daysSinceCreation > 30) {
				churnRisk = "medium";
			}
			if (subscription?.tier === "free" && daysSinceCreation > 90) {
				churnRisk = "high";
			}

			// Determine user's currency from payment transactions (use most recent completed payment, or default)
			const userCurrency: "PHP" | "USD" = completedPayments.length > 0 
				? (completedPayments[0].currency as "PHP" | "USD") || getDefaultCurrency()
				: getDefaultCurrency();

			return {
				totalCreditsEarned,
				totalCreditsSpent,
				creditBalance: userCredits?.credits_balance || 0,
				subscriptionValue,
				// Lifetime value: subscription value + actual credit purchases + estimated credit value (all in cents)
				// Note: totalPaid already includes subscription and credit payments, so we use the breakdown here
				lifetimeValue: subscriptionValue + creditPurchaseValue + estimatedCreditValue,
				currency: userCurrency,
				featureUsage: {
					photosUploaded,
					videosUploaded,
					babiesCreated: babies?.length || 0,
					milestonesCreated: milestones?.length || 0,
					exportsGenerated: 0, // TODO: Track exports
				},
				paymentMetrics: {
					totalPaid,
					paymentTransactionCount: paymentTransactions?.length || 0,
					completedPaymentCount: completedPayments.length,
					paymentsByMethod,
					paymentsByType,
					averagePaymentAmount: completedPayments.length > 0 ? totalPaid / completedPayments.length : 0,
					lastPaymentDate: completedPayments[0]?.created_at,
				},
				conversionMetrics: {
					daysAsUser: daysSinceCreation,
					upgradeDate: subscription?.tier !== "free" ? subscription?.updated_at : undefined,
					churnRisk,
				},
			};
		},
		enabled: !!user,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Fetch credit usage breakdown
	const {
		data: creditUsageBreakdown,
		isLoading: isLoadingBreakdown,
	} = useQuery({
		queryKey: ["creditUsageBreakdown", user?.id],
		queryFn: async (): Promise<CreditUsageBreakdown | null> => {
			if (!user) return null;

			const { data: transactions } = await supabase
				.from("credit_transactions")
				.select("*")
				.eq("user_id", user.id)
				.eq("transaction_type", "spend");

			const breakdown: CreditUsageBreakdown = {
				extraBabies: 0,
				videoUploads: 0,
				extraPhotos: 0,
				premiumTemplates: 0,
				exports: 0,
			};

			transactions?.forEach(transaction => {
				const description = transaction.description?.toLowerCase() || "";
				if (description.includes("baby")) {
					breakdown.extraBabies += Math.abs(transaction.amount);
				} else if (description.includes("video")) {
					breakdown.videoUploads += Math.abs(transaction.amount);
				} else if (description.includes("photo")) {
					breakdown.extraPhotos += Math.abs(transaction.amount);
				} else if (description.includes("template")) {
					breakdown.premiumTemplates += Math.abs(transaction.amount);
				} else if (description.includes("export")) {
					breakdown.exports += Math.abs(transaction.amount);
				}
			});

			return breakdown;
		},
		enabled: !!user,
		staleTime: 5 * 60 * 1000,
	});

	// Track user behavior events
	const trackFeatureUsage = (feature: string, metadata?: Record<string, any>) => {
		trackEvent("feature_used", {
			feature,
			user_tier: analyticsData?.subscriptionValue ? "premium" : "free",
			credits_balance: analyticsData?.creditBalance || 0,
			...metadata,
		});
	};

	const trackConversionEvent = (event: string, metadata?: Record<string, any>) => {
		trackEvent("conversion_event", {
			event,
			days_as_user: analyticsData?.conversionMetrics.daysAsUser || 0,
			churn_risk: analyticsData?.conversionMetrics.churnRisk || "low",
			lifetime_value: analyticsData?.lifetimeValue || 0,
			...metadata,
		});
	};

	const trackCreditUsage = (action: string, creditsSpent: number, metadata?: Record<string, any>) => {
		trackEvent("credit_usage", {
			action,
			credits_spent: creditsSpent,
			credits_remaining: (analyticsData?.creditBalance || 0) - creditsSpent,
			total_credits_spent: (analyticsData?.totalCreditsSpent || 0) + creditsSpent,
			...metadata,
		});
	};

	// Auto-track user engagement metrics
	useEffect(() => {
		if (analyticsData && user) {
			// Track user segment
			trackEvent("user_segment_identified", {
				tier: analyticsData.subscriptionValue > 0 ? "premium" : "free",
				lifetime_value: analyticsData.lifetimeValue,
				churn_risk: analyticsData.conversionMetrics.churnRisk,
				days_as_user: analyticsData.conversionMetrics.daysAsUser,
				feature_usage_score: calculateFeatureUsageScore(analyticsData.featureUsage),
			});

			// Track potential upgrade opportunities
			if (analyticsData.conversionMetrics.churnRisk === "medium" && analyticsData.subscriptionValue === 0) {
				trackEvent("upgrade_opportunity_identified", {
					reason: "medium_churn_risk",
					credits_balance: analyticsData.creditBalance,
					days_as_user: analyticsData.conversionMetrics.daysAsUser,
				});
			}
		}
	}, [analyticsData, user]);

	const calculateFeatureUsageScore = (usage: AnalyticsData["featureUsage"]): number => {
		// Simple scoring algorithm
		return (
			usage.photosUploaded * 1 +
			usage.videosUploaded * 3 +
			usage.babiesCreated * 10 +
			usage.milestonesCreated * 2 +
			usage.exportsGenerated * 5
		);
	};

	const getRecommendations = (): string[] => {
		if (!analyticsData) return [];

		const recommendations: string[] = [];

		// Credit-based recommendations
		if (analyticsData.creditBalance < 5 && analyticsData.totalCreditsSpent > 0) {
			recommendations.push("Consider upgrading to Family Plan for unlimited features");
		}

		// Usage-based recommendations
		if (analyticsData.featureUsage.babiesCreated >= 1 && analyticsData.subscriptionValue === 0) {
			recommendations.push("Upgrade to track multiple babies with Family Plan");
		}

		if (analyticsData.featureUsage.videosUploaded > 5) {
			recommendations.push("Save on video uploads with a subscription plan");
		}

		// Engagement-based recommendations
		if (analyticsData.conversionMetrics.daysAsUser > 30 && analyticsData.subscriptionValue === 0) {
			recommendations.push("You're a power user! Consider Lifetime Premium for the best value");
		}

		return recommendations;
	};

	return {
		analyticsData,
		creditUsageBreakdown,
		isLoading: isLoadingAnalytics || isLoadingBreakdown,
		refetchAnalytics,
		trackFeatureUsage,
		trackConversionEvent,
		trackCreditUsage,
		getRecommendations,
	};
};
