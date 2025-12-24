/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

declare namespace Deno {
	export function serve(
		handler: (req: Request) => Response | Promise<Response>
	): { shutdown(): Promise<void> };
	
	export const env: {
		get(key: string): string | undefined;
	};
}

