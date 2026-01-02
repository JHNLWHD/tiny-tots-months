/// <reference path="./deno.d.ts" />
// Drizzle database client setup for Supabase Edge Functions
import { drizzle } from "https://esm.sh/drizzle-orm@0.34.0/postgres-js";
import postgres from "https://deno.land/x/postgresjs@v3.4.3/mod.js";
import * as schema from "./schema.ts";

// Get environment variables
// Note: SUPABASE_DB_URL is automatically provided by Supabase Edge Functions (if available)
// DATABASE_URL should contain the full connection string with database password
// SERVICE_ROLE_KEY is for Supabase API, not for direct database connections
const SUPABASE_DB_URL = Deno.env.get("SUPABASE_DB_URL") ?? "";
const DATABASE_URL = Deno.env.get("DATABASE_URL") ?? "";
const PROJECT_URL = Deno.env.get("PROJECT_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? "";

// Build connection string
// Priority: 1. SUPABASE_DB_URL (auto-provided by Supabase), 2. DATABASE_URL (user-provided)
// Note: We cannot construct from SERVICE_ROLE_KEY as it's for API access, not database access
const connectionString = SUPABASE_DB_URL || DATABASE_URL;

if (!connectionString) {
	throw new Error(
		"Missing database connection string. Please set DATABASE_URL environment variable.\n" +
		"Get it from: Supabase Dashboard > Settings > Database > Connection string > Connection pooling\n" +
		"Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:[port]/postgres\n" +
		"Or use: supabase secrets set DATABASE_URL=your-connection-string"
	);
}

// Validate that we have PROJECT_URL and SERVICE_ROLE_KEY for auth operations
if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
	console.warn(
		"Warning: PROJECT_URL or SERVICE_ROLE_KEY not set. Authentication features may not work."
	);
}

// Create postgres client
// Note: In Deno, we need to use the postgres-js package compatible with Deno
// Mask password in connection string for logging
const maskedConnectionString = connectionString.replace(/:([^:@]+)@/, ":****@");
console.log("[db-drizzle] Using connection:", maskedConnectionString);

const client = postgres(connectionString, {
	max: 1, // Edge functions should use a single connection
	ssl: "require",
	onnotice: () => {}, // Suppress notices in Deno
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

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
		// Use Supabase client to verify token
		const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
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
			return null;
		}

		return { id: user.id };
	} catch {
		return null;
	}
}

