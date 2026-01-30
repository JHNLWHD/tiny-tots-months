import type { Plugin } from "vite";

export function statusEndpoint(): Plugin {
	return {
		name: "status-endpoint",
		configureServer(server) {
			// Only runs in development mode
			server.middlewares.use((req, res, next) => {
				if (req.url === "/status") {
					// In development, redirect to the actual status page
					// In production, the _redirects file handles this
					res.writeHead(302, {
						Location: "https://stats.uptimerobot.com/WiKhZwSbVk",
					});
					res.end();
				} else {
					next();
				}
			});
		},
	};
}
