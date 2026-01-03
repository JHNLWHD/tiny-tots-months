import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import type { BlogPostFrontmatter } from "@/types/blog";

interface BlogMetaProps {
	frontmatter: BlogPostFrontmatter;
}

export function BlogMeta({ frontmatter }: BlogMetaProps) {
	const formattedDate = format(new Date(frontmatter.date), "MMMM d, yyyy");

	return (
		<div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
			<div className="flex items-center gap-2">
				<User className="h-4 w-4 text-baby-purple" />
				<span className="font-medium">{frontmatter.author}</span>
			</div>
			<div className="flex items-center gap-2">
				<Calendar className="h-4 w-4 text-baby-purple" />
				<span>{formattedDate}</span>
			</div>
			{frontmatter.readingTime && (
				<div className="flex items-center gap-2">
					<Clock className="h-4 w-4 text-baby-purple" />
					<span>{frontmatter.readingTime} min read</span>
				</div>
			)}
		</div>
	);
}

