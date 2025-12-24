import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type Subscription = {
	id: string;
	user_id: string;
	status: string;
	tier: string;
	start_date: string;
	end_date: string | null;
	created_at: string;
	updated_at: string;
	payment_proof?: string | null;
	payment_transaction_id?: string | null;
};

export type UserCredits = {
	id: string;
	user_id: string;
	credits_balance: number;
	created_at: string;
	updated_at: string;
};

export type CreditTransaction = {
	id: string;
	user_id: string;
	amount: number;
	transaction_type: string;
	description: string | null;
	created_at: string;
	updated_at: string;
};

// Updated status values to match the database constraint
export const SUBSCRIPTION_STATUS = {
	FREE: "free",
	PREMIUM: "premium",
	PENDING: "pending",
	ACTIVE: "active",
};

export const SUBSCRIPTION_TIERS = {
	FREE: "free",
	FAMILY: "family",
	LIFETIME: "lifetime",
};

export const TRANSACTION_TYPES = {
	PURCHASE: "purchase",
	SPEND: "spend",
	REFUND: "refund",
};

export const CREDIT_COSTS = {
	EXTRA_BABY: 15,
	VIDEO_UPLOAD: 2,
	EXTRA_PHOTOS: 1, // per 10 photos
	PREMIUM_TEMPLATES: 3,
	EXPORT_FEATURES: 2,
};

export const useSubscription = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	// Function to fetch user's subscription
	const fetchSubscription = async (): Promise<Subscription | null> => {
		if (!user) return null;

		const { data, error } = await supabase
			.from("subscription")
			.select("*")
			.eq("user_id", user.id)
			.maybeSingle();

		if (error && error.code !== "PGRST116") {
			// PGRST116 is "no rows returned"
			throw error;
		}

		return data;
	};

	// Function to fetch user's credits
	const fetchUserCredits = async (): Promise<UserCredits | null> => {
		if (!user) return null;

		const { data, error } = await supabase
			.from("user_credits")
			.select("*")
			.eq("user_id", user.id)
			.maybeSingle();

		if (error && error.code !== "PGRST116") {
			throw error;
		}

		return data;
	};

	// Query to fetch subscription
	const {
		data: subscription,
		isLoading: isLoadingSubscription,
		refetch: refetchSubscription,
		isError,
	} = useQuery({
		queryKey: ["subscription", user?.id],
		queryFn: fetchSubscription,
		enabled: !!user,
	});

	// Query to fetch user credits
	const {
		data: userCredits,
		isLoading: isLoadingCredits,
		refetch: refetchCredits,
	} = useQuery({
		queryKey: ["userCredits", user?.id],
		queryFn: fetchUserCredits,
		enabled: !!user,
	});

	const isLoading = isLoadingSubscription || isLoadingCredits;

	// Determine subscription tier and status
	const tier = subscription?.tier || SUBSCRIPTION_TIERS.FREE;
	const status = subscription?.status || SUBSCRIPTION_STATUS.FREE;
	
	const isFree = tier === SUBSCRIPTION_TIERS.FREE;
	const isFamily = tier === SUBSCRIPTION_TIERS.FAMILY && status === SUBSCRIPTION_STATUS.ACTIVE;
	const isLifetime = tier === SUBSCRIPTION_TIERS.LIFETIME && status === SUBSCRIPTION_STATUS.ACTIVE;
	const isPremium = isFamily || isLifetime; // Legacy compatibility
	const isPending = status === SUBSCRIPTION_STATUS.PENDING;
	
	const creditsBalance = userCredits?.credits_balance || 0;

	const createSubscription = useMutation({
		mutationFn: async (currency: string = "PHP") => {
			if (!user) throw new Error("No user found");

			const { data: existingSubscription } = await supabase
				.from("subscription")
				.select("id")
				.eq("user_id", user.id)
				.single();

			if (existingSubscription) {
				return existingSubscription;
			}

			const { data, error } = await supabase
				.from("subscription")
				.insert([
					{
						user_id: user.id,
						tier: SUBSCRIPTION_TIERS.FREE,
						status: SUBSCRIPTION_STATUS.ACTIVE,
						currency: currency,
						start_date: new Date().toISOString(),
					},
				])
				.select()
				.single();

			if (error) throw error;

			// Also create user credits record
			await supabase
				.from("user_credits")
				.insert([
					{
						user_id: user.id,
						credits_balance: 0,
					},
				]);

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["userCredits", user?.id] });
		},
	});

	// Credit purchase mutation
	const purchaseCredits = useMutation({
		mutationFn: async ({ amount, credits }: { amount: number; credits: number }) => {
			if (!user) throw new Error("User not authenticated");

			// Add credits to user balance
			const { data: currentCredits } = await supabase
				.from("user_credits")
				.select("credits_balance")
				.eq("user_id", user.id)
				.single();

			const newBalance = (currentCredits?.credits_balance || 0) + credits;

			const { error: updateError } = await supabase
				.from("user_credits")
				.upsert({
					user_id: user.id,
					credits_balance: newBalance,
				});

			if (updateError) throw updateError;

			// Log the transaction
			const { error: transactionError } = await supabase
				.from("credit_transactions")
				.insert({
					user_id: user.id,
					amount: credits,
					transaction_type: TRANSACTION_TYPES.PURCHASE,
					description: `Purchased ${credits} credits`,
				});

			if (transactionError) throw transactionError;

			return { newBalance, credits };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userCredits", user?.id] });
			toast.success("Credits purchased successfully!");
		},
		onError: (error) => {
			console.error("Error purchasing credits:", error);
			toast.error("Failed to purchase credits. Please try again.");
		},
	});

	// Spend credits mutation
	const spendCredits = useMutation({
		mutationFn: async ({ amount, description }: { amount: number; description: string }) => {
			if (!user) throw new Error("User not authenticated");

			const { data: currentCredits } = await supabase
				.from("user_credits")
				.select("credits_balance")
				.eq("user_id", user.id)
				.single();

			const currentBalance = currentCredits?.credits_balance || 0;
			
			if (currentBalance < amount) {
				throw new Error("Insufficient credits");
			}

			const newBalance = currentBalance - amount;

			const { error: updateError } = await supabase
				.from("user_credits")
				.upsert({
					user_id: user.id,
					credits_balance: newBalance,
				});

			if (updateError) throw updateError;

			// Log the transaction
			const { error: transactionError } = await supabase
				.from("credit_transactions")
				.insert({
					user_id: user.id,
					amount: -amount,
					transaction_type: TRANSACTION_TYPES.SPEND,
					description: description,
				});

			if (transactionError) throw transactionError;

			return { newBalance, spent: amount };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userCredits", user?.id] });
		},
		onError: (error) => {
			console.error("Error spending credits:", error);
			toast.error(error.message || "Failed to spend credits");
		},
	});

	const requestSubscriptionUpgrade = useMutation({
		mutationFn: async ({ 
			tier, 
			paymentProofPath 
		}: { 
			tier: string; 
			paymentProofPath?: string; 
		}): Promise<Subscription> => {
			if (!user) throw new Error("User not authenticated");

			const updateData: any = {
				user_id: user.id,
				tier: tier,
				status: tier === SUBSCRIPTION_TIERS.LIFETIME ? SUBSCRIPTION_STATUS.PENDING : SUBSCRIPTION_STATUS.ACTIVE,
			};

			if (paymentProofPath) {
				updateData.payment_proof = paymentProofPath;
			}

			if (tier === SUBSCRIPTION_TIERS.FAMILY) {
				updateData.start_date = new Date().toISOString();
				// Set end date to 1 year from now for annual, or 1 month for monthly
				const endDate = new Date();
				endDate.setFullYear(endDate.getFullYear() + 1);
				updateData.end_date = endDate.toISOString();
			}

			const { data, error } = await supabase
				.from("subscription")
				.upsert(updateData)
				.select()
				.single();

			if (error) {
				throw error;
			}

			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
			
			if (data.tier === SUBSCRIPTION_TIERS.LIFETIME) {
				toast.success(
					"Your lifetime upgrade request has been submitted! Access will be activated within 24 hours.",
				);
			} else {
				toast.success("Subscription upgraded successfully!");
			}
		},
		onError: (error) => {
			console.error("Error upgrading subscription:", error);
			toast.error(
				`Subscription upgrade failed: ${error.message || "Please try again later"}`,
			);
		},
	});

	// Helper function to check if user can perform action
	const canPerformAction = (requiredCredits: number = 0) => {
		if (isPremium) return true;
		return creditsBalance >= requiredCredits;
	};

	// Helper function to get user's currency (from payment transaction or default to PHP)
	const getUserCurrency = () => {
		// TODO: Get currency from payment_transactions table via payment_transaction_id
		// For now, default to PHP since we're PHP-only
		return "PHP";
	};

	return {
		subscription,
		userCredits,
		loading: isLoading,
		tier,
		status,
		isPremium,
		isFamily,
		isLifetime,
		isPending,
		isFree,
		creditsBalance,
		createSubscription: createSubscription.mutate,
		purchaseCredits: purchaseCredits.mutate,
		spendCredits: spendCredits.mutateAsync,
		requestSubscriptionUpgrade: requestSubscriptionUpgrade.mutate,
		canPerformAction,
		getUserCurrency,
		isProcessing: requestSubscriptionUpgrade.isPending || purchaseCredits.isPending || spendCredits.isPending,
		refetch: () => {
			refetchSubscription();
			refetchCredits();
		},
		// Legacy compatibility
		requestPremiumUpgrade: (paymentProofPath: string) => 
			requestSubscriptionUpgrade.mutate({ 
				tier: SUBSCRIPTION_TIERS.LIFETIME, 
				paymentProofPath 
			}),
	};
};
