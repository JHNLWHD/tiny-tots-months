import type { Plugin } from "vite";

/**
 * Vite plugin to handle /ping endpoint with proper JSON response
 * Returns JSON with correct Content-Type header
 */
export function pingEndpoint(): Plugin {
	return {
		name: "ping-endpoint",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.url === "/ping") {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
					res.end(JSON.stringify({ status: "pong" }));
					return;
				}
				next();
			});
		},
		configurePreviewServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.url === "/ping") {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
					res.end(JSON.stringify({ status: "pong" }));
					return;
				}
				next();
			});
		},
	};
}
