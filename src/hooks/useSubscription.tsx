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

	// Query to fetch subscription
	const {
		data: subscription,
		isLoading,
		refetch,
		isError,
	} = useQuery({
		queryKey: ["subscription", user?.id],
		queryFn: async () => {
			if (!user) return null;

			const { data, error } = await supabase
				.from("subscription")
				.select("*")
				.eq("user_id", user.id)
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					// No subscription found
					return null;
				}
				throw error;
			}

			return data;
		},
		enabled: !!user,
	});

	const isPremium = subscription?.status === SUBSCRIPTION_STATUS.PREMIUM;
	const isPending = subscription?.status === SUBSCRIPTION_STATUS.PENDING;
	const isFree = subscription?.status === SUBSCRIPTION_STATUS.FREE;

	const createSubscription = useMutation({
		mutationFn: async () => {
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
						type: "free",
						status: "active",
						created_at: new Date().toISOString(),
					},
				])
				.select()
				.single();

			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
		},
	});

	const requestPremiumUpgrade = useMutation({
		mutationFn: async (paymentProofPath: string): Promise<Subscription> => {
			if (!user) throw new Error("User not authenticated");

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
		loading: isLoading,
		isPremium,
		isPending,
		isFree,
		createSubscription: createSubscription.mutate,
		requestPremiumUpgrade: requestPremiumUpgrade.mutate,
		isProcessing: requestPremiumUpgrade.isPending,
		refetch,
	};
};
