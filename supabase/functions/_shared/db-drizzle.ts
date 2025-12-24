/// <reference path="./deno.d.ts" />
// Drizzle database client setup for Supabase Edge Functions
import { drizzle } from "https://esm.sh/drizzle-orm@0.45.1/postgres-js";
import postgres from "https://deno.land/x/postgresjs@v3.4.3/mod.js";
import * as schema from "./schema.ts";

// Get environment variables
// Note: Cannot use SUPABASE_ prefix as it's reserved by Supabase
const PROJECT_URL = Deno.env.get("PROJECT_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? "";
const DATABASE_URL = Deno.env.get("DATABASE_URL") ?? "";

if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
	throw new Error(
		"Missing PROJECT_URL or SERVICE_ROLE_KEY environment variables",
	);
}

// Build connection string from Supabase URL
// If DATABASE_URL is provided, use it directly
// Otherwise, construct from PROJECT_URL and service role key
let connectionString = DATABASE_URL;

if (!connectionString) {
	// Extract project ref from PROJECT_URL (e.g., https://htxczdhdospkxjesvztw.supabase.co)
	const projectRef = PROJECT_URL.replace("https://", "").replace(".supabase.co", "");
	
	// Use connection pooler for better performance in serverless
	// Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
	// Default to us-east-1, but this may need to be adjusted based on your region
	connectionString = `postgresql://postgres.${projectRef}:${SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
}

// Create postgres client
// Note: In Deno, we need to use the postgres-js package compatible with Deno
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

