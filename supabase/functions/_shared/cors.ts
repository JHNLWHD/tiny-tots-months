// CORS headers for Supabase Edge Functions
export const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers":
		"authorization, x-client-info, apikey, content-type",
};

export function handleCors(request: Request): Response | null {
	// Handle CORS preflight requests
	if (request.method === "OPTIONS") {
		console.log("[CORS] Handling OPTIONS preflight request");
		const response = new Response(null, { 
			status: 200,
			headers: {
				...corsHeaders,
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Max-Age": "86400",
			},
		});
		console.log("[CORS] OPTIONS response headers:", Object.fromEntries(response.headers.entries()));
		return response;
	}
	return null;
}

export function createCorsResponse(
	data: any,
	status: number = 200,
): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { ...corsHeaders, "Content-Type": "application/json" },
	});
}

export function createCorsErrorResponse(
	error: string | Error,
	status: number = 400,
): Response {
	const errorMessage = error instanceof Error ? error.message : error;
	return new Response(
		JSON.stringify({ error: errorMessage }),
		{
			status,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		},
	);
}

