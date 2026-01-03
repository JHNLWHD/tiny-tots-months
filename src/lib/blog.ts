import type { BlogPost, BlogPostFrontmatter } from "@/types/blog";

// Calculate reading time based on word count (average 200 words per minute)
export function calculateReadingTime(content: string): number {
	const wordsPerMinute = 200;
	const wordCount = content.split(/\s+/).length;
	return Math.ceil(wordCount / wordsPerMinute);
}

// Generate slug from title
export function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

// Get all blog posts (will be populated with actual imports)
export async function getAllBlogPosts(): Promise<BlogPost[]> {
	// Dynamic imports for all MDX files
	const blogModules = import.meta.glob<{ frontmatter: BlogPostFrontmatter; default: any }>(
		"../../content/blog/*.mdx",
		{ eager: false }
	);

	const posts: BlogPost[] = [];

	for (const path in blogModules) {
		try {
			const module = await blogModules[path]();
			const slug = path
				.replace("../../content/blog/", "")
				.replace(".mdx", "");

			if (module.frontmatter) {
				posts.push({
					frontmatter: module.frontmatter as BlogPostFrontmatter,
					content: module.default,
					slug,
				});
			}
		} catch (error) {
			console.error(`Error loading blog post from ${path}:`, error);
		}
	}

	// Sort by date (newest first)
	return posts.sort(
		(a, b) =>
			new Date(b.frontmatter.date).getTime() -
			new Date(a.frontmatter.date).getTime()
	);
}

// Get a single blog post by slug
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
	try {
		const module = await import(`../../content/blog/${slug}.mdx`);
		if (module.frontmatter) {
			return {
				frontmatter: module.frontmatter as BlogPostFrontmatter,
				content: module.default,
				slug,
			};
		}
		return null;
	} catch (error) {
		console.error(`Error loading blog post ${slug}:`, error);
		return null;
	}
}

// Get related posts
export function getRelatedPosts(
	currentSlug: string,
	allPosts: BlogPost[],
	relatedSlugs?: string[],
	limit: number = 3
): BlogPost[] {
	if (relatedSlugs && relatedSlugs.length > 0) {
		return allPosts
			.filter((post) => relatedSlugs.includes(post.slug) && post.slug !== currentSlug)
			.slice(0, limit);
	}

	// If no related posts specified, return recent posts excluding current
	return allPosts
		.filter((post) => post.slug !== currentSlug)
		.slice(0, limit);
}

