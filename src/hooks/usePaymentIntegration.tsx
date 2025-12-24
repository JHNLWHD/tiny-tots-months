import { useState } from "react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { PAYMENT_CONFIG, getSupportedCurrencies } from "@/config/payment";
import { usePaymentTracking } from "@/hooks/usePaymentTracking";
import { toCents, formatCentsAmount } from "@/utils/currency";
import type { PaymentMethodType, TransactionType } from "@/hooks/usePaymentTracking";

export type PaymentMethod = {
	type: "gcash";
	name: string;
	description: string;
	currencies: string[];
	instructions?: string;
};

export type PaymentRequest = {
	amount: number; // Amount in regular currency (e.g., 24.99), will be converted to cents internally
	currency: "PHP" | "USD";
	type: "credits" | "subscription" | "lifetime";
	description: string;
	metadata?: Record<string, any>;
};


export type PaymentResult = {
	success: boolean;
	paymentTransactionId: string; // Payment transaction record ID (required when success is true)
	error?: string;
	requiresProof?: boolean;
	instructions?: string;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
	{
		type: "gcash",
		name: "GCash",
		description: "Mobile wallet payment",
		currencies: ["PHP"],
		instructions: `Send payment to GCash: ${PAYMENT_CONFIG.gcashNumber} (${PAYMENT_CONFIG.businessName}). Upload receipt as proof.`
	}
];

export const usePaymentIntegration = () => {
	const [isProcessing, setIsProcessing] = useState(false);
	const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
	const { createPaymentTransaction } = usePaymentTracking();

	const getAvailablePaymentMethods = (currency: "PHP" | "USD"): PaymentMethod[] => {
		const supportedCurrencies = getSupportedCurrencies();
		
		return PAYMENT_METHODS.filter(method => 
			method.currencies.includes(currency) && 
			supportedCurrencies.includes(currency as "PHP" | "USD")
		);
	};

	const processPayment = async (
		request: PaymentRequest,
		method: PaymentMethod,
		proofPath?: string
	): Promise<PaymentResult> => {
		setIsProcessing(true);
		
		try {
			// First, create a payment transaction record (convert amount to cents)
			const amountInCents = toCents(request.amount);
			const paymentTransaction = await createPaymentTransaction({
				amount: amountInCents,
				currency: request.currency,
				paymentMethod: method.type as PaymentMethodType,
				transactionType: request.type as TransactionType,
				description: request.description,
				paymentProofUrl: proofPath, // Store the uploaded proof storage path
				metadata: {
					...request.metadata,
					paymentMethod: method.name,
					originalAmount: request.amount, // Store original amount for reference
				}
			});

			trackEvent("payment_initiated", {
				amount: request.amount,
				currency: request.currency,
				type: request.type,
				method: method.type,
				transaction_id: paymentTransaction.id
			});

			// Process payment (all methods are manual)
			// paymentTransactionId is always available here since transaction was created successfully
			return await processManualPayment(request, method, proofPath, paymentTransaction.id);
		} catch (error) {
			console.error("Payment processing error:", error);
			trackEvent("payment_error", {
				amount: request.amount,
				currency: request.currency,
				type: request.type,
				method: method.type,
				error: error instanceof Error ? error.message : "Unknown error"
			});
			
			// If transaction creation failed, we don't have a paymentTransactionId
			// Re-throw the error so PaymentFlow can handle it gracefully
			throw error;
		} finally {
			setIsProcessing(false);
		}
	};


	const processManualPayment = async (
		request: PaymentRequest,
		method: PaymentMethod,
		proofPath: string | undefined,
		paymentTransactionId: string
	): Promise<PaymentResult> => {
		// For manual payments, we need proof of payment
		if (!proofPath) {
			return {
				success: false,
				paymentTransactionId: paymentTransactionId, // Always include the transaction ID even on error
				error: "Payment proof is required for this payment method",
				requiresProof: true,
				instructions: method.instructions
			};
		}

		// Simulate processing pending payment
		await new Promise(resolve => setTimeout(resolve, 500));
		
		trackEvent("manual_payment_submitted", {
			amount: request.amount,
			currency: request.currency,
			type: request.type,
			method: method.type,
			proofUploaded: true,
			proofPath: proofPath
		});

		// In a real implementation, you would:
		// 1. The proof file has already been uploaded (proofPath contains the storage path)
		// 2. The payment transaction record has been created with paymentProofUrl
		// 3. Notify admin for manual verification
		// 4. Send confirmation email to user
		
		return {
			success: true,
			paymentTransactionId: paymentTransactionId,
			instructions: `Payment submitted successfully! We'll verify your ${method.name} payment within 24 hours and activate your purchase.`
		};
	};

	const validatePaymentAmount = (amount: number, currency: "PHP" | "USD"): boolean => {
		const minAmounts = { PHP: 10, USD: 0.25 };
		const maxAmounts = { PHP: 50000, USD: 1250 };
		
		return amount >= minAmounts[currency] && amount <= maxAmounts[currency];
	};

	const formatPaymentInstructions = (method: PaymentMethod, amount: number, currency: "PHP" | "USD"): string => {
		const formattedAmount = formatCentsAmount(toCents(amount), currency);
		
		switch (method.type) {
			case "gcash":
				return `Send ${formattedAmount} to GCash: ${PAYMENT_CONFIG.gcashNumber} (${PAYMENT_CONFIG.businessName}). Upload receipt as proof.`;
			default:
				return method.instructions || "Follow payment instructions.";
		}
	};

	return {
		isProcessing,
		selectedMethod,
		setSelectedMethod,
		getAvailablePaymentMethods,
		processPayment,
		validatePaymentAmount,
		formatPaymentInstructions,
		paymentMethods: PAYMENT_METHODS,
	};
};
