/// <reference path="../_shared/deno.d.ts" />
// Edge function to get all payment transactions for admin users
import { corsHeaders, handleCors, createCorsResponse, createCorsErrorResponse } from "../_shared/cors.ts";
import { db } from "../_shared/db-drizzle.ts";
import { getAdminUser } from "../_shared/admin.ts";
import { paymentTransactions } from "../_shared/schema.ts";
import { eq } from "https://esm.sh/drizzle-orm@0.34.0";

Deno.serve(async (req) => {
	// Handle CORS preflight
	const corsResponse = handleCors(req);
	if (corsResponse) return corsResponse;

	try {
		// Verify authentication and admin access
		const adminUser = await getAdminUser(req);
		if (!adminUser) {
			return createCorsErrorResponse(
				"Admin access required",
				403,
			);
		}

		// Parse request body or URL params for filters
		let requestBody: any = {};
		try {
			if (req.method === "POST") {
				requestBody = await req.json();
			} else if (req.method === "GET") {
				// Parse query parameters from URL
				const url = new URL(req.url);
				const statusParam = url.searchParams.get("status");
				if (statusParam) {
					requestBody.status = statusParam;
				}
			}
		} catch {
			// No body or invalid JSON, continue with empty filters
		}

		const statusFilter = requestBody.status as string | undefined;

		// Build query with optional status filter
		let allTransactions;
		if (statusFilter) {
			// Apply status filter
			allTransactions = await db
				.select()
				.from(paymentTransactions)
				.where(eq(paymentTransactions.status, statusFilter));
		} else {
			// Fetch all transactions
			allTransactions = await db
				.select()
				.from(paymentTransactions);
		}

		// Sort by created_at descending (client-side)
		allTransactions.sort((a: any, b: any) => {
			const dateA = new Date(a.createdAt || a.created_at).getTime();
			const dateB = new Date(b.createdAt || b.created_at).getTime();
			return dateB - dateA; // Descending order
		});

		return createCorsResponse(allTransactions, 200);
	} catch (error) {
		console.error("Error getting admin payments:", error);
		return createCorsErrorResponse(
			error instanceof Error ? error.message : "Internal server error",
			500,
		);
	}
});

