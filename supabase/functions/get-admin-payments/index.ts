/// <reference path="../_shared/deno.d.ts" />
// Edge function to get all payment transactions for admin users

// CORS headers - defined inline to avoid import issues
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
	// Handle CORS preflight FIRST - inline to ensure it always works
	if (req.method === "OPTIONS") {
		return new Response(null, {
			status: 200,
			headers: {
				...corsHeaders,
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Max-Age": "86400",
			},
		});
	}

	// Lazy load modules after CORS is handled - use Supabase client instead of drizzle to avoid import issues
	let requireAdminUser;
	try {
		const adminModule = await import("../_shared/admin.ts");
		requireAdminUser = adminModule.requireAdminUser;
	} catch (importError) {
		console.error("[get-admin-payments] Failed to import admin module:", importError);
		return new Response(
			JSON.stringify({
				error: "Failed to initialize function modules",
			}),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			},
		);
	}

	try {
		// Verify authentication and admin access
		let adminUser;
		try {
			adminUser = await requireAdminUser(req);
		} catch (error) {
			return new Response(
				JSON.stringify({ error: "Admin access required" }),
				{
					status: 403,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				},
			);
		}

		// Parse request body for filters
		let body: any = {};
		if (req.method === "POST") {
			const text = await req.text();
			if (text) {
				body = JSON.parse(text);
			}
		} else {
			const url = new URL(req.url);
			body = {
				status: url.searchParams.get("status") || undefined,
				transactionType: url.searchParams.get("transactionType") || undefined,
				paymentMethod: url.searchParams.get("paymentMethod") || undefined,
				search: url.searchParams.get("search") || undefined,
			};
		}
		
		const status = body?.status;
		const transactionType = body?.transactionType;
		const paymentMethod = body?.paymentMethod;
		const search = body?.search;

		// Use Supabase client directly instead of drizzle to avoid import issues
		const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
		const PROJECT_URL = Deno.env.get("PROJECT_URL") ?? "";
		const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? "";
		
		if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
			throw new Error("Missing PROJECT_URL or SERVICE_ROLE_KEY environment variables");
		}

		const supabaseAdmin = createClient(PROJECT_URL, SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});

		// Build query - start with base query
		let query = supabaseAdmin
			.from("payment_transactions")
			.select("*");

		// Apply filters server-side if possible
		if (status) {
			query = query.eq("status", status);
		}
		if (transactionType) {
			query = query.eq("transaction_type", transactionType);
		}
		if (paymentMethod) {
			query = query.eq("payment_method", paymentMethod);
		}

		// Execute query
		const { data: allTransactions, error: queryError } = await query.order("created_at", { ascending: false });

		if (queryError) {
			throw queryError;
		}

		// Apply search filter client-side (Supabase doesn't support ILIKE across multiple columns easily)
		let filteredTransactions = allTransactions || [];
		
		if (search) {
			const searchLower = search.toLowerCase();
			filteredTransactions = filteredTransactions.filter((tx: any) => {
				return (
					tx.id?.toLowerCase().includes(searchLower) ||
					tx.description?.toLowerCase().includes(searchLower) ||
					tx.external_payment_id?.toLowerCase().includes(searchLower)
				);
			});
		}
		
		// Sort by created_at descending (already sorted by query, but ensure it's correct)
		// Note: Supabase returns snake_case column names
		filteredTransactions.sort((a: any, b: any) => {
			const dateA = new Date(a.created_at || a.createdAt).getTime();
			const dateB = new Date(b.created_at || b.createdAt).getTime();
			return dateB - dateA; // Descending order
		});

		return new Response(
			JSON.stringify(filteredTransactions),
			{
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("[get-admin-payments] Error:", error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : "Internal server error",
			}),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			},
		);
	}
});

