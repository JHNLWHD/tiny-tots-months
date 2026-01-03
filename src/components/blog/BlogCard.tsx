import { Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { BlogPost } from "@/types/blog";
import { format } from "date-fns";

interface BlogCardProps {
	post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
	const { frontmatter } = post;
	const formattedDate = format(new Date(frontmatter.date), "MMMM d, yyyy");

	return (
		<article className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-card transition-shadow duration-300">
			<Link to={`/blog/${frontmatter.slug}`} className="block">
				<div className="aspect-video bg-gradient-to-br from-baby-purple/20 to-baby-pink/20 overflow-hidden">
					{frontmatter.image ? (
						<img
							src={frontmatter.image}
							alt={frontmatter.title}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<span className="text-4xl">👶</span>
						</div>
					)}
				</div>
				<div className="p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-baby-purple transition-colors">
						{frontmatter.title}
					</h2>
					<p className="text-gray-600 text-sm mb-4 line-clamp-3">
						{frontmatter.description}
					</p>
					<div className="flex items-center gap-4 text-xs text-gray-500">
						<div className="flex items-center gap-1">
							<Calendar className="h-4 w-4" />
							<span>{formattedDate}</span>
						</div>
						{frontmatter.readingTime && (
							<div className="flex items-center gap-1">
								<Clock className="h-4 w-4" />
								<span>{frontmatter.readingTime} min read</span>
							</div>
						)}
					</div>
				</div>
			</Link>
		</article>
	);
}

