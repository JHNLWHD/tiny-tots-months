import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { BlogPost } from "@/types/blog";

interface BlogNavigationProps {
	previous?: BlogPost;
	next?: BlogPost;
}

export function BlogNavigation({ previous, next }: BlogNavigationProps) {
	if (!previous && !next) {
		return null;
	}

	return (
		<nav className="mt-12 pt-8 border-t border-gray-200">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{previous ? (
					<Link
						to={`/blog/${previous.frontmatter.slug}`}
						className="group p-4 bg-gray-50 rounded-lg hover:bg-baby-purple/5 transition-colors"
					>
						<div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
							<ArrowLeft className="h-4 w-4" />
							<span>Previous Post</span>
						</div>
						<h3 className="font-semibold text-gray-900 group-hover:text-baby-purple transition-colors">
							{previous.frontmatter.title}
						</h3>
					</Link>
				) : (
					<div />
				)}

				{next ? (
					<Link
						to={`/blog/${next.frontmatter.slug}`}
						className="group p-4 bg-gray-50 rounded-lg hover:bg-baby-purple/5 transition-colors text-right md:text-left"
					>
						<div className="flex items-center justify-end md:justify-start gap-2 text-sm text-gray-500 mb-2">
							<span>Next Post</span>
							<ArrowRight className="h-4 w-4" />
						</div>
						<h3 className="font-semibold text-gray-900 group-hover:text-baby-purple transition-colors">
							{next.frontmatter.title}
						</h3>
					</Link>
				) : (
					<div />
				)}
			</div>
		</nav>
	);
}

