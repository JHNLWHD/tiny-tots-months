import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface Subscription {
	id: string;
	user_id: string;
	status: string;
	start_date: string;
	end_date: string | null;
	created_at: string;
	updated_at: string;
	payment_proof?: string | null;
}

// Updated status values to match the database constraint
export const SUBSCRIPTION_STATUS = {
	FREE: "free",
	PREMIUM: "premium",
	PENDING: "pending",
};

export const useSubscription = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	// Function to fetch user's subscription
	const fetchSubscription = async (): Promise<Subscription | null> => {
		if (!user) return null;

		console.log("Fetching subscription for user:", user.id);

		// First, check if user already has a subscription
		const { data, error } = await supabase
			.from("subscription")
			.select("*")
			.eq("user_id", user.id)
			.maybeSingle();

		if (error && error.code !== "PGRST116") {
			// PGRST116 is "no rows returned"
			console.error("Error fetching subscription:", error);
			throw error;
		}

		return data;
	};

	// Query to fetch subscription
	const {
		data: subscription,
		isLoading: loading,
		refetch,
		isError,
	} = useQuery({
		queryKey: ["subscription", user?.id],
		queryFn: fetchSubscription,
		enabled: !!user,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Check if user has premium subscription
	const isPremium = subscription?.status === SUBSCRIPTION_STATUS.PREMIUM;
	const isPending = subscription?.status === SUBSCRIPTION_STATUS.PENDING;
	const isFree = subscription?.status === SUBSCRIPTION_STATUS.FREE;

	const createSubscription = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("User not found");

			console.log("Create subscription:", user.id);

			const { data, error } = await supabase
				.from("subscription")
				.select("*")
				.eq("user_id", user.id)
				.maybeSingle();

			if (error && error.code !== "PGRST116") {
				console.error("Error creating subscription:", user.id);
				throw error;
			}

			if (data) {
				console.log("Subscription already exists");
				return;
			}

			console.log("No subscription found for user:", user.id);
			console.log("Creating new subscription:", user.id);

			const { data: newSubscription, error: newSubscriptionError } =
				await supabase
					.from("subscription")
					.insert({
						user_id: user.id,
						status: SUBSCRIPTION_STATUS.FREE,
					})
					.select()
					.single();

			if (newSubscriptionError) {
				console.error("Error creating new subscription:", newSubscriptionError);
				throw newSubscriptionError;
			}

			return newSubscription;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
			toast.success(
				"Your subscription creation request has been submitted! Free access is now available.",
			);
		},
		onError: (error) => {
			console.error("Error creating subscription:", error);
			toast.error(
				`Subscription creation request failed: ${error.message || "Please try again later"}`,
			);
		},
	});

	// Mutation to request premium upgrade
	const requestPremiumUpgrade = useMutation({
		mutationFn: async (paymentProofPath: string): Promise<Subscription> => {
			if (!user) throw new Error("User not authenticated");

			console.log(
				"Requesting premium upgrade for user:",
				user.id,
				"with payment proof:",
				paymentProofPath,
			);

			// Use upsert to handle both creation and update
			const { data, error } = await supabase
				.from("subscription")
				.upsert({
					user_id: user.id,
					status: SUBSCRIPTION_STATUS.PENDING,
					payment_proof: paymentProofPath,
				})
				.select()
				.single();

			if (error) {
				console.error("Upgrade request error:", error);
				throw error;
			}

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
			toast.success(
				"Your upgrade request has been submitted! Premium access will be activated within 24 hours.",
			);
		},
		onError: (error) => {
			console.error("Error requesting upgrade:", error);
			toast.error(
				`Subscription upgrade request failed: ${error.message || "Please try again later"}`,
			);
		},
	});

	return {
		subscription,
		loading,
		isPremium,
		isPending,
		isFree,
		createSubscription: createSubscription.mutate,
		requestPremiumUpgrade: requestPremiumUpgrade.mutate,
		isProcessing: requestPremiumUpgrade.isPending,
		refetch,
	};
};
