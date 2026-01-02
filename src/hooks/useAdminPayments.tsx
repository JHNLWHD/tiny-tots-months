import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import type { Database } from "@/integrations/supabase/types";

type PaymentTransaction = Database["public"]["Tables"]["payment_transactions"]["Row"];
type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type AdminPaymentFilters = {
	status?: PaymentStatus;
	transactionType?: string;
	paymentMethod?: string;
	search?: string; // Search by user email, transaction ID, or description
};

export const useAdminPayments = (filters?: AdminPaymentFilters) => {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	// Fetch all payment transactions (admin only) via edge function to bypass RLS
	const {
		data: paymentTransactions,
		isLoading: isLoadingTransactions,
		isError: isErrorLoadingTransactions,
		error: loadingError,
		refetch: refetchTransactions,
	} = useQuery({
		queryKey: ["adminPayments", filters],
		queryFn: async (): Promise<PaymentTransaction[]> => {
			if (!user) return [];

			// Build request body with filters
			const requestBody: any = {};
			if (filters?.status) {
				requestBody.status = filters.status;
			}
			if (filters?.transactionType) {
				requestBody.transactionType = filters.transactionType;
			}
			if (filters?.paymentMethod) {
				requestBody.paymentMethod = filters.paymentMethod;
			}
			if (filters?.search) {
				requestBody.search = filters.search;
			}

			// Call edge function to get all payments (bypasses RLS)
			const { data, error } = await supabase.functions.invoke(
				"get-admin-payments",
				{
					body: requestBody,
				},
			);

			if (error) {
				throw new Error(error.message || "Failed to fetch payments");
			}

			// The edge function returns the transactions directly
			return (data as PaymentTransaction[]) || [];
		},
		enabled: !!user,
	});

	// Note: Getting user emails would require a server-side edge function
	// For now, we display user IDs in the UI

	// Update payment transaction status (admin only)
	const updatePaymentStatus = useMutation({
		mutationFn: async ({
			transactionId,
			status,
			adminNotes,
		}: {
			transactionId: string;
			status: PaymentStatus;
			adminNotes?: string;
		}): Promise<PaymentTransaction> => {
			if (!user) throw new Error("User not authenticated");

			// Fetch current transaction to get old status for analytics
			const { data: currentTransaction, error: fetchError } = await supabase
				.from("payment_transactions")
				.select("*")
				.eq("id", transactionId)
				.single();

			if (fetchError) throw fetchError;
			if (!currentTransaction) throw new Error("Transaction not found");

			// Call edge function to update payment transaction atomically
			const { data, error } = await supabase.functions.invoke(
				"update-payment-transaction",
				{
					body: {
						transactionId,
						status,
						adminNotes,
					},
				},
			);

			if (error) {
				throw new Error(error.message || "Failed to update payment transaction");
			}

			// Parse the response (edge function returns JSON)
			const updatedTransaction = data as PaymentTransaction;

			// Track the status update
			trackEvent("admin_payment_updated", {
				transaction_id: transactionId,
				old_status: currentTransaction.status,
				new_status: status,
				admin_id: user.id,
			});

			return updatedTransaction;
		},
		onSuccess: (data) => {
			// Invalidate all relevant queries
			queryClient.invalidateQueries({ queryKey: ["adminPayments"] });
			queryClient.invalidateQueries({ queryKey: ["paymentTransactions"] });
			queryClient.invalidateQueries({ queryKey: ["userCredits"] });

			if (data.status === "completed") {
				toast.success("Payment approved successfully!");
			} else if (data.status === "failed") {
				toast.success("Payment rejected");
			}
		},
		onError: (error) => {
			console.error("Error updating payment transaction:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to update payment transaction";
			toast.error(errorMessage);
		},
	});

	// Get payment statistics
	const getPaymentStats = () => {
		if (!paymentTransactions) return null;

		const pending = paymentTransactions.filter((t) => t.status === "pending");
		const completed = paymentTransactions.filter((t) => t.status === "completed");
		const failed = paymentTransactions.filter((t) => t.status === "failed");

		const totalPendingAmount = pending.reduce(
			(acc, t) => acc + t.amount_in_cents,
			0,
		);
		const totalCompletedAmount = completed.reduce(
			(acc, t) => acc + t.amount_in_cents,
			0,
		);

		return {
			total: paymentTransactions.length,
			pending: pending.length,
			completed: completed.length,
			failed: failed.length,
			totalPendingAmount,
			totalCompletedAmount,
		};
	};

	return {
		// Data
		paymentTransactions: paymentTransactions || [],
		isLoadingTransactions,
		isErrorLoadingTransactions,
		loadingError,
		paymentStats: getPaymentStats(),

		// Actions
		updatePaymentStatus: updatePaymentStatus.mutate,
		updatePaymentStatusAsync: updatePaymentStatus.mutateAsync,
		refetchTransactions,

		// Loading states
		isUpdatingStatus: updatePaymentStatus.isPending,
	};
};

