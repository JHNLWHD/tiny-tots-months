import type { ReactNode } from "react";

interface BlogContentProps {
	children: ReactNode;
}

export function BlogContent({ children }: BlogContentProps) {
	return (
		<div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-baby-purple prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-img:rounded-lg prose-img:my-6 prose-blockquote:border-l-4 prose-blockquote:border-baby-purple prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-code:bg-gray-100 prose-code:text-baby-purple prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100">
			{children}
		</div>
	);
}

