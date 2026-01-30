import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { mdxFrontmatter } from "./vite-plugin-mdx-frontmatter";
import { pingEndpoint } from "./vite-plugin-ping";
import { statusEndpoint } from "./vite-plugin-status";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	server: {
		host: "::",
		port: 8080,
	},
	plugins: [
		statusEndpoint(),
		pingEndpoint(),
		mdxFrontmatter(),
		mdx({
			remarkPlugins: [remarkGfm],
			rehypePlugins: [rehypeHighlight],
			jsxImportSource: "react",
		}),
		react(),
		mode === "development" && componentTagger()
	].filter(Boolean),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	optimizeDeps: {
		include: ["@mdx-js/react"],
	},
}));
