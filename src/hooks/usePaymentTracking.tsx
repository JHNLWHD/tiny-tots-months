import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import type { Database } from "@/integrations/supabase/types";

type PaymentTransaction = Database["public"]["Tables"]["payment_transactions"]["Row"];
type PaymentTransactionInsert = Database["public"]["Tables"]["payment_transactions"]["Insert"];
type PaymentTransactionUpdate = Database["public"]["Tables"]["payment_transactions"]["Update"];

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentMethodType = "gcash" | "stripe";
export type TransactionType = "credits" | "subscription" | "lifetime";

export type CreatePaymentTransactionData = {
	amount: number; // Amount in cents (e.g., 249900 for ₱2,499.00)
	currency: "PHP" | "USD";
	paymentMethod: PaymentMethodType;
	transactionType: TransactionType;
	description?: string;
	externalPaymentId?: string;
	paymentProofUrl?: string;
	metadata?: Record<string, any>;
};

export const usePaymentTracking = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [isProcessing, setIsProcessing] = useState(false);

	// Fetch user's payment transactions
	const {
		data: paymentTransactions,
		isLoading: isLoadingTransactions,
		refetch: refetchTransactions,
	} = useQuery({
		queryKey: ["paymentTransactions", user?.id],
		queryFn: async (): Promise<PaymentTransaction[]> => {
			if (!user) return [];

			const { data, error } = await supabase
				.from("payment_transactions")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (error) throw error;
			return data || [];
		},
		enabled: !!user,
	});

	// Create payment transaction
	const createPaymentTransaction = useMutation({
		mutationFn: async (transactionData: CreatePaymentTransactionData): Promise<PaymentTransaction> => {
			if (!user) throw new Error("User not authenticated");

			const insertData: PaymentTransactionInsert = {
				user_id: user.id,
				amount_in_cents: transactionData.amount,
				currency: transactionData.currency,
				payment_method: transactionData.paymentMethod,
				transaction_type: transactionData.transactionType,
				status: "pending",
				external_payment_id: transactionData.externalPaymentId,
				payment_proof_url: transactionData.paymentProofUrl,
				description: transactionData.description,
				metadata: transactionData.metadata,
			};

			const { data, error } = await supabase
				.from("payment_transactions")
				.insert(insertData)
				.select()
				.single();

			if (error) throw error;

			// Track the payment initiation
			trackEvent("payment_transaction_created", {
				amount: transactionData.amount,
				currency: transactionData.currency,
				payment_method: transactionData.paymentMethod,
				transaction_type: transactionData.transactionType,
				transaction_id: data.id,
			});

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["paymentTransactions", user?.id] });
			toast.success("Payment transaction created successfully");
		},
		onError: (error) => {
			console.error("Error creating payment transaction:", error);
			toast.error("Failed to create payment transaction");
		},
	});

	// Update payment transaction status
	const updatePaymentTransaction = useMutation({
		mutationFn: async ({ 
			transactionId, 
			status, 
			externalPaymentId, 
			adminNotes 
		}: {
			transactionId: string;
			status: PaymentStatus;
			externalPaymentId?: string;
			adminNotes?: string;
		}): Promise<PaymentTransaction> => {
			const updateData: PaymentTransactionUpdate = {
				status,
				external_payment_id: externalPaymentId,
				admin_notes: adminNotes,
			};

			// If completing the transaction, set verified timestamp
			if (status === "completed") {
				updateData.verified_at = new Date().toISOString();
				updateData.verified_by = user?.id; // In real app, this would be admin user
			}

			const { data, error } = await supabase
				.from("payment_transactions")
				.update(updateData)
				.eq("id", transactionId)
				.select()
				.single();

			if (error) throw error;

			// Track the status update
			trackEvent("payment_transaction_updated", {
				transaction_id: transactionId,
				old_status: "pending", // Would need to fetch old status in real implementation
				new_status: status,
			});

			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["paymentTransactions", user?.id] });
			
			if (data.status === "completed") {
				toast.success("Payment completed successfully!");
			} else if (data.status === "failed") {
				toast.error("Payment failed");
			}
		},
		onError: (error) => {
			console.error("Error updating payment transaction:", error);
			toast.error("Failed to update payment transaction");
		},
	});

	// Get payment transaction by ID
	const getPaymentTransaction = async (transactionId: string): Promise<PaymentTransaction | null> => {
		const { data, error } = await supabase
			.from("payment_transactions")
			.select("*")
			.eq("id", transactionId)
			.single();

		if (error) {
			console.error("Error fetching payment transaction:", error);
			return null;
		}

		return data;
	};

	// Get payment summary for user
	const getPaymentSummary = () => {
		if (!paymentTransactions) return null;

		const completedTransactions = paymentTransactions.filter(t => t.status === "completed");
		const pendingTransactions = paymentTransactions.filter(t => t.status === "pending");
		
		// Calculate totals per currency
		const totalSpentByCurrency = completedTransactions.reduce((acc, t) => {
			const currency = (t.currency as "PHP" | "USD") || "PHP";
			acc[currency] = (acc[currency] || 0) + t.amount_in_cents;
			return acc;
		}, {} as Record<"PHP" | "USD", number>);

		const totalPendingByCurrency = pendingTransactions.reduce((acc, t) => {
			const currency = (t.currency as "PHP" | "USD") || "PHP";
			acc[currency] = (acc[currency] || 0) + t.amount_in_cents;
			return acc;
		}, {} as Record<"PHP" | "USD", number>);

		// Get primary currency (the one with the highest total, or PHP as default)
		const currencies = Object.keys(totalSpentByCurrency) as ("PHP" | "USD")[];
		const primaryCurrency = currencies.length > 0 
			? currencies.reduce((a, b) => (totalSpentByCurrency[a] || 0) > (totalSpentByCurrency[b] || 0) ? a : b)
			: "PHP" as "PHP" | "USD";
		
		// Legacy totalSpent for backward compatibility (uses primary currency)
		const totalSpent = totalSpentByCurrency[primaryCurrency] || 0;
		const totalPending = totalPendingByCurrency[primaryCurrency] || 0;
		
		const byType = completedTransactions.reduce((acc, t) => {
			acc[t.transaction_type] = (acc[t.transaction_type] || 0) + t.amount_in_cents;
			return acc;
		}, {} as Record<string, number>);

		const byMethod = completedTransactions.reduce((acc, t) => {
			acc[t.payment_method] = (acc[t.payment_method] || 0) + t.amount_in_cents;
			return acc;
		}, {} as Record<string, number>);

		return {
			totalTransactions: paymentTransactions.length,
			completedTransactions: completedTransactions.length,
			pendingTransactions: pendingTransactions.length,
			totalSpent,
			totalPending,
			totalSpentByCurrency,
			totalPendingByCurrency,
			primaryCurrency,
			byType,
			byMethod,
			lastPayment: completedTransactions[0]?.created_at,
		};
	};

	// Link payment transaction to subscription or credits
	const linkPaymentToResource = async (
		transactionId: string, 
		resourceType: "subscription" | "credits",
		resourceId: string
	) => {
		if (resourceType === "subscription") {
			const { error } = await supabase
				.from("subscription")
				.update({ payment_transaction_id: transactionId })
				.eq("id", resourceId);

			if (error) throw error;
		} else if (resourceType === "credits") {
			const { error } = await supabase
				.from("credit_transactions")
				.update({ payment_transaction_id: transactionId })
				.eq("id", resourceId);

			if (error) throw error;
		}
	};

	return {
		// Data
		paymentTransactions,
		isLoadingTransactions,
		isProcessing,
		
		// Actions
		createPaymentTransaction: createPaymentTransaction.mutate,
		updatePaymentTransaction: updatePaymentTransaction.mutate,
		getPaymentTransaction,
		linkPaymentToResource,
		refetchTransactions,
		
		// Computed
		paymentSummary: getPaymentSummary(),
		
		// Loading states
		isCreatingTransaction: createPaymentTransaction.isPending,
		isUpdatingTransaction: updatePaymentTransaction.isPending,
	};
};
