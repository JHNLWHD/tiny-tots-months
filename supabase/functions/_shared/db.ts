// Database client setup for Supabase Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get environment variables
// Note: Cannot use SUPABASE_ prefix as it's reserved by Supabase
const PROJECT_URL = Deno.env.get("PROJECT_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? "";

if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
	throw new Error(
		"Missing PROJECT_URL or SERVICE_ROLE_KEY environment variables",
	);
}

// Create Supabase client with service role key for admin access
export const supabaseAdmin = createClient(
	PROJECT_URL,
	SERVICE_ROLE_KEY,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	},
);

// Helper to get authenticated user from request
export async function getAuthenticatedUser(
	request: Request,
): Promise<{ id: string } | null> {
	const authHeader = request.headers.get("Authorization");
	if (!authHeader) {
		return null;
	}

	try {
		const token = authHeader.replace("Bearer ", "");
		const {
			data: { user },
			error,
		} = await supabaseAdmin.auth.getUser(token);

		if (error || !user) {
			return null;
		}

		return { id: user.id };
	} catch {
		return null;
	}
}

