import type { Plugin } from "vite";
import matter from "gray-matter";
import fs from "fs";

export function mdxFrontmatter(): Plugin {
	return {
		name: "mdx-frontmatter",
		enforce: "pre",
		transform(code, id) {
			if (!id.endsWith(".mdx")) {
				return null;
			}

			const fileContent = fs.readFileSync(id, "utf-8");
			const { data: frontmatter, content } = matter(fileContent);

			// Inject frontmatter as export
			const frontmatterExport = `export const frontmatter = ${JSON.stringify(frontmatter)};\n`;
			const mdxContent = frontmatterExport + content;

			return {
				code: mdxContent,
				map: null,
			};
		},
	};
}

