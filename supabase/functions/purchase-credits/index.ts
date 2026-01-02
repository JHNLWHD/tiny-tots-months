/// <reference path="../_shared/deno.d.ts" />
// Edge function to purchase credits atomically using Drizzle ORM
import { corsHeaders, handleCors, createCorsResponse, createCorsErrorResponse } from "../_shared/cors.ts";
import { db, getAuthenticatedUser } from "../_shared/db-drizzle.ts";
import { userCredits, creditTransactions, paymentTransactions } from "../_shared/schema.ts";
import { eq, and } from "https://esm.sh/drizzle-orm@0.34.0";

Deno.serve(async (req) => {
	// Handle CORS preflight
	const corsResponse = handleCors(req);
	if (corsResponse) return corsResponse;

	try {
		// Verify authentication
		const user = await getAuthenticatedUser(req);
		if (!user) {
			return createCorsErrorResponse("Unauthorized", 401);
		}

		// Parse request body
		const {
			amount,
			credits,
			paymentTransactionId,
		} = await req.json();

		if (!amount || !credits || !paymentTransactionId) {
			return createCorsErrorResponse(
				"Missing required fields: amount, credits, and paymentTransactionId",
				400,
			);
		}

		if (credits <= 0) {
			return createCorsErrorResponse("Credits must be greater than 0", 400);
		}

		// Use Drizzle transaction to ensure atomicity
		const result = await db.transaction(async (tx) => {
			// Validate payment transaction exists and belongs to user
			const [paymentTransaction] = await tx
				.select()
				.from(paymentTransactions)
				.where(eq(paymentTransactions.id, paymentTransactionId))
				.limit(1);

			if (!paymentTransaction) {
				throw new Error("Payment transaction not found");
			}

			// Verify payment transaction belongs to authenticated user
			if (paymentTransaction.userId !== user.id) {
				throw new Error("Payment transaction does not belong to authenticated user");
			}

			// Verify payment transaction has completed status
			if (paymentTransaction.status !== "completed") {
				throw new Error(
					`Payment transaction must have status "completed" to grant credits. Current status: ${paymentTransaction.status}`
				);
			}

			// Verify payment transaction is for credits
			if (paymentTransaction.transactionType !== "credits") {
				throw new Error(
					`Payment transaction must be of type "credits". Current type: ${paymentTransaction.transactionType}`
				);
			}

			// Check if credits have already been granted (idempotency)
			const [existingCreditTransaction] = await tx
				.select()
				.from(creditTransactions)
				.where(
					and(
						eq(creditTransactions.paymentTransactionId, paymentTransactionId),
						eq(creditTransactions.transactionType, "purchase"),
					),
				)
				.limit(1);

			if (existingCreditTransaction) {
				throw new Error("Credits have already been granted for this payment transaction");
			}

			// Validate credits amount matches payment transaction metadata
			if (paymentTransaction.metadata) {
				const metadata = paymentTransaction.metadata as any;
				const expectedCredits = metadata.credits as number | undefined;

				if (expectedCredits !== undefined && expectedCredits !== credits) {
					throw new Error(
						`Credits amount mismatch. Expected ${expectedCredits} credits from payment transaction, but received ${credits}`
					);
				}
			}

			// Get current credits balance
			const [currentCredits] = await tx
				.select()
				.from(userCredits)
				.where(eq(userCredits.userId, user.id))
				.limit(1);

			const newBalance = (currentCredits?.creditsBalance || 0) + credits;

			// Update or insert user credits
			if (currentCredits) {
				await tx
					.update(userCredits)
					.set({
						creditsBalance: newBalance,
						updatedAt: new Date(),
					})
					.where(eq(userCredits.userId, user.id));
			} else {
				await tx.insert(userCredits).values({
					userId: user.id,
					creditsBalance: newBalance,
				});
			}

			// Create credit transaction record
			const [creditTransaction] = await tx
				.insert(creditTransactions)
				.values({
					userId: user.id,
					amount: credits,
					transactionType: "purchase",
					description: `Purchased ${credits} credits`,
					paymentTransactionId: paymentTransactionId,
				})
				.returning();

			return {
				newBalance,
				credits,
				creditTransactionId: creditTransaction.id,
			};
		});

		return createCorsResponse(result, 200);
	} catch (error) {
		console.error("Error purchasing credits:", error);
		return createCorsErrorResponse(
			error instanceof Error ? error.message : "Internal server error",
			500,
		);
	}
});
