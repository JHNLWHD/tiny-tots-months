/// <reference path="./deno.d.ts" />
// Admin permission utilities for Supabase Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT_URL = Deno.env.get("PROJECT_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? "";

if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
	throw new Error(
		"Missing PROJECT_URL or SERVICE_ROLE_KEY environment variables",
	);
}

/**
 * Get authenticated user with admin check from request
 * Returns user object if authenticated and is admin, null otherwise
 */
export async function getAdminUser(
	request: Request,
): Promise<{ id: string; email?: string } | null> {
	const authHeader = request.headers.get("Authorization");
	if (!authHeader) {
		return null;
	}

	try {
		const token = authHeader.replace("Bearer ", "");
		const supabaseAdmin = createClient(PROJECT_URL, SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});

		const {
			data: { user },
			error,
		} = await supabaseAdmin.auth.getUser(token);

		if (error || !user) {
			console.log("[admin] getUser failed:", error?.message || "No user");
			return null;
		}

		console.log("[admin] User found:", user.id, user.email);
		console.log("[admin] user_metadata:", JSON.stringify(user.user_metadata));
		
		// Check if user is admin via user_metadata
		const isAdmin = user.user_metadata?.is_admin === true;
		console.log("[admin] is_admin check:", isAdmin, "value:", user.user_metadata?.is_admin);
		
		if (!isAdmin) {
			console.log("[admin] User is not admin, access denied");
			return null;
		}

		console.log("[admin] User is admin, access granted");
		return { id: user.id, email: user.email };
	} catch {
		return null;
	}
}

/**
 * Require admin - throws error if user is not admin
 */
export async function requireAdminUser(
	request: Request,
): Promise<{ id: string; email?: string }> {
	const adminUser = await getAdminUser(request);
	if (!adminUser) {
		throw new Error("Admin access required");
	}
	return adminUser;
}

