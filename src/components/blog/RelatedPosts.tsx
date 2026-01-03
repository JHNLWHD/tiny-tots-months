import { Link } from "react-router-dom";
import type { BlogPost } from "@/types/blog";
import { BlogCard } from "./BlogCard";

interface RelatedPostsProps {
	posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
	if (posts.length === 0) {
		return null;
	}

	return (
		<section className="mt-12 pt-8 border-t border-gray-200">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{posts.map((post) => (
					<BlogCard key={post.slug} post={post} />
				))}
			</div>
		</section>
	);
}

