/// <reference path="../_shared/deno.d.ts" />
// Edge function to spend credits atomically using Drizzle ORM
import { corsHeaders, handleCors, createCorsResponse, createCorsErrorResponse } from "../_shared/cors.ts";
import { db, getAuthenticatedUser } from "../_shared/db-drizzle.ts";
import { userCredits, creditTransactions } from "../_shared/schema.ts";
import { eq } from "https://esm.sh/drizzle-orm@0.34.0";

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
			description,
		} = await req.json();

		if (!amount || !description) {
			return createCorsErrorResponse(
				"Missing required fields: amount and description",
				400,
			);
		}

		if (amount <= 0) {
			return createCorsErrorResponse("Amount must be greater than 0", 400);
		}

		// Use Drizzle transaction to ensure atomicity
		const result = await db.transaction(async (tx) => {
			// Get current credits balance
			// Note: Drizzle transactions provide isolation, but for explicit locking
			// you may need to use raw SQL. For now, the transaction isolation should be sufficient.
			const [currentCredits] = await tx
				.select()
				.from(userCredits)
				.where(eq(userCredits.userId, user.id))
				.limit(1);

			if (!currentCredits) {
				throw new Error("User credits record not found");
			}

			const currentBalance = currentCredits.creditsBalance;

			if (currentBalance < amount) {
				throw new Error("Insufficient credits");
			}

			const newBalance = currentBalance - amount;

			// Update user credits
			await tx
				.update(userCredits)
				.set({
					creditsBalance: newBalance,
					updatedAt: new Date(),
				})
				.where(eq(userCredits.userId, user.id));

			// Create credit transaction record
			const [creditTransaction] = await tx
				.insert(creditTransactions)
				.values({
					userId: user.id,
					amount: -amount,
					transactionType: "spend",
					description: description,
				})
				.returning();

			return {
				newBalance,
				spent: amount,
				creditTransactionId: creditTransaction.id,
			};
		});

		return createCorsResponse(result, 200);
	} catch (error) {
		console.error("Error spending credits:", error);
		return createCorsErrorResponse(
			error instanceof Error ? error.message : "Internal server error",
			500,
		);
	}
});
