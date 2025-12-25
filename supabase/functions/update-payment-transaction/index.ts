/// <reference path="../_shared/deno.d.ts" />
// Edge function to update payment transaction status with atomic credit granting using Drizzle ORM
import { corsHeaders, handleCors, createCorsResponse, createCorsErrorResponse } from "../_shared/cors.ts";
import { db } from "../_shared/db-drizzle.ts";
import { requireAdminUser } from "../_shared/admin.ts";
import { paymentTransactions, userCredits, creditTransactions } from "../_shared/schema.ts";
import { eq, and } from "https://esm.sh/drizzle-orm@0.45.1";

Deno.serve(async (req) => {
	// Handle CORS preflight
	const corsResponse = handleCors(req);
	if (corsResponse) return corsResponse;

	try {
		// Verify authentication and admin access
		let adminUser;
		try {
			adminUser = await requireAdminUser(req);
		} catch (error) {
			return createCorsErrorResponse(
				"Admin access required",
				403,
			);
		}

		// Parse request body
		const {
			transactionId,
			status,
			externalPaymentId,
			adminNotes,
		} = await req.json();

		if (!transactionId || !status) {
			return createCorsErrorResponse(
				"Missing required fields: transactionId and status",
				400,
			);
		}

		// Use Drizzle transaction to ensure atomicity
		const result = await db.transaction(async (tx) => {
			// Fetch the current transaction
			const [currentTransaction] = await tx
				.select()
				.from(paymentTransactions)
				.where(eq(paymentTransactions.id, transactionId))
				.limit(1);

			if (!currentTransaction) {
				throw new Error("Transaction not found");
			}

			const oldStatus = currentTransaction.status;
			const wasCompleted = oldStatus === "completed";
			const isCompleting = status === "completed" && !wasCompleted;

			// Update payment transaction
			const updateData: any = {
				status,
				updatedAt: new Date(),
			};

			if (externalPaymentId !== undefined) {
				updateData.externalPaymentId = externalPaymentId;
			}

			if (adminNotes !== undefined) {
				updateData.adminNotes = adminNotes;
			}

			if (isCompleting) {
				updateData.verifiedAt = new Date();
				updateData.verifiedBy = adminUser.id;
			}

			const [updatedTransaction] = await tx
				.update(paymentTransactions)
				.set(updateData)
				.where(eq(paymentTransactions.id, transactionId))
				.returning();

			// If completing a credits transaction, grant credits
			if (isCompleting && currentTransaction.transactionType === "credits") {
				// Check if credits were already granted
				const [existingCreditTransaction] = await tx
					.select()
					.from(creditTransactions)
					.where(
						and(
							eq(creditTransactions.paymentTransactionId, transactionId),
							eq(creditTransactions.transactionType, "purchase"),
						),
					)
					.limit(1);

				// Only grant credits if they haven't been granted yet
				if (!existingCreditTransaction && currentTransaction.metadata) {
					const metadata = currentTransaction.metadata as any;
					const credits = metadata.credits as number | undefined;

					if (credits && credits > 0) {
						// Get or create user credits
						const [currentCredits] = await tx
							.select()
							.from(userCredits)
							.where(eq(userCredits.userId, currentTransaction.userId))
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
								.where(eq(userCredits.userId, currentTransaction.userId));
						} else {
							await tx.insert(userCredits).values({
								userId: currentTransaction.userId,
								creditsBalance: newBalance,
							});
						}

						// Create credit transaction record
						await tx.insert(creditTransactions).values({
							userId: currentTransaction.userId,
							amount: credits,
							transactionType: "purchase",
							description: `Purchased ${credits} credits`,
							paymentTransactionId: transactionId,
						});
					}
				}
			}

			return updatedTransaction;
		});

		return createCorsResponse(result, 200);
	} catch (error) {
		console.error("Error updating payment transaction:", error);
		return createCorsErrorResponse(
			error instanceof Error ? error.message : "Internal server error",
			500,
		);
	}
});
