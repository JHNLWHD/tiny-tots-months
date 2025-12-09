import { useState } from "react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { PAYMENT_CONFIG, getSupportedCurrencies } from "@/config/payment";
import { usePaymentTracking } from "@/hooks/usePaymentTracking";
import { toCents, formatCentsAmount } from "@/utils/currency";
import type { PaymentMethodType, TransactionType } from "@/hooks/usePaymentTracking";
import { loadStripe, Stripe, StripeCardElement, StripeElements } from "@stripe/stripe-js";

export type PaymentMethod = {
	type: "gcash" | "stripe";
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

export type StripePaymentData = {
	paymentMethodId?: string; // For Payment Intents API
	clientSecret?: string; // Payment Intent client secret from backend
	cardElement?: StripeCardElement; // For direct card element confirmation
};

export type PaymentResult = {
	success: boolean;
	paymentId?: string;
	transactionId?: string; // Payment transaction record ID
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
	},
	{
		type: "stripe",
		name: "Credit Card",
		description: "Visa, Mastercard, etc.",
		currencies: ["USD"],
		instructions: "Secure card processing via Stripe"
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
		proofPath?: string,
		stripeData?: StripePaymentData
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

			// Process payment based on method
			if (method.type === "stripe") {
				return await processStripePayment(request, paymentTransaction.id, stripeData);
			} else {
				// For manual payment methods (GCash, PayMaya, Bank Transfer, PayPal)
				return await processManualPayment(request, method, proofPath, paymentTransaction.id);
			}
		} catch (error) {
			console.error("Payment processing error:", error);
			trackEvent("payment_error", {
				amount: request.amount,
				currency: request.currency,
				type: request.type,
				method: method.type,
				error: error instanceof Error ? error.message : "Unknown error"
			});
			
			return {
				success: false,
				error: error instanceof Error ? error.message : "Payment processing failed"
			};
		} finally {
			setIsProcessing(false);
		}
	};

	const processStripePayment = async (
		request: PaymentRequest,
		transactionId: string,
		stripeData?: StripePaymentData
	): Promise<PaymentResult> => {
		// Validate Stripe configuration
		if (!PAYMENT_CONFIG.stripePublishableKey) {
			const errorMsg = "Stripe is not configured. Please contact support.";
			trackEvent("payment_error", {
				amount: request.amount,
				currency: request.currency,
				type: request.type,
				method: "stripe",
				error: errorMsg
			});
			return {
				success: false,
				error: errorMsg
			};
		}

		// Load Stripe instance
		const stripe = await loadStripe(PAYMENT_CONFIG.stripePublishableKey);
		if (!stripe) {
			const errorMsg = "Failed to initialize Stripe. Please refresh the page and try again.";
			trackEvent("payment_error", {
				amount: request.amount,
				currency: request.currency,
				type: request.type,
				method: "stripe",
				error: errorMsg
			});
			return {
				success: false,
				error: errorMsg
			};
		}

		try {
			// Convert amount to cents for Stripe
			const amountInCents = toCents(request.amount);

			// Method 1: Payment Intent with client secret (recommended, requires backend)
			if (stripeData?.clientSecret) {
				const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
					stripeData.clientSecret,
					{
						payment_method: stripeData.paymentMethodId || undefined,
					}
				);

				if (confirmError) {
					trackEvent("payment_error", {
						amount: request.amount,
						currency: request.currency,
						type: request.type,
						method: "stripe",
						error: confirmError.message || "Payment confirmation failed"
					});

					return {
						success: false,
						error: confirmError.message || "Payment confirmation failed. Please try again."
					};
				}

				if (paymentIntent && paymentIntent.status === "succeeded") {
					trackEvent("payment_completed", {
						amount: request.amount,
						currency: request.currency,
						type: request.type,
						method: "stripe",
						paymentId: paymentIntent.id
					});

					return {
						success: true,
						paymentId: paymentIntent.id,
						transactionId: transactionId,
					};
				}

				// Handle other payment intent statuses
				if (paymentIntent?.status === "requires_action") {
					return {
						success: false,
						error: "Additional authentication required. Please complete the verification."
					};
				}

				return {
					success: false,
					error: `Payment status: ${paymentIntent?.status}. Please try again.`
				};
			}

			// Method 2: Direct card element confirmation (requires card element)
			if (stripeData?.cardElement) {
				// Create payment method from card element
				const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
					type: "card",
					card: stripeData.cardElement,
				});

				if (pmError || !paymentMethod) {
					trackEvent("payment_error", {
						amount: request.amount,
						currency: request.currency,
						type: request.type,
						method: "stripe",
						error: pmError?.message || "Failed to create payment method"
					});

					return {
						success: false,
						error: pmError?.message || "Failed to process card. Please check your card details and try again."
					};
				}

				// NOTE: This requires a backend endpoint to create a Payment Intent
				// For now, return an error indicating backend is required
				const errorMsg = "Backend payment endpoint required. Please implement a Payment Intent creation endpoint.";
				console.error(errorMsg);
				trackEvent("payment_error", {
					amount: request.amount,
					currency: request.currency,
					type: request.type,
					method: "stripe",
					error: errorMsg
				});

				return {
					success: false,
					error: "Payment processing is not fully configured. Please contact support."
				};
			}

			// No valid payment data provided
			const errorMsg = "Payment method data is required for Stripe payments.";
			trackEvent("payment_error", {
				amount: request.amount,
				currency: request.currency,
				type: request.type,
				method: "stripe",
				error: errorMsg
			});

			return {
				success: false,
				error: errorMsg
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during payment processing.";
			console.error("Stripe payment error:", error);
			
			trackEvent("payment_error", {
				amount: request.amount,
				currency: request.currency,
				type: request.type,
				method: "stripe",
				error: errorMessage
			});

			return {
				success: false,
				error: errorMessage
			};
		}
	};

	const processManualPayment = async (
		request: PaymentRequest,
		method: PaymentMethod,
		proofPath: string | undefined,
		transactionId: string
	): Promise<PaymentResult> => {
		// For manual payments, we need proof of payment
		if (!proofPath) {
			return {
				success: false,
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
			paymentId: `manual_${method.type}_${Date.now()}`,
			transactionId: transactionId,
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
			case "stripe":
				return `Secure payment processing via Stripe. Your card will be charged ${formattedAmount}.`;
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
