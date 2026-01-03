export interface BlogPostFrontmatter {
	title: string;
	description: string;
	keywords: string[];
	author: string;
	date: string;
	image: string;
	slug: string;
	readingTime?: number;
	related?: string[];
}

export interface BlogPost {
	frontmatter: BlogPostFrontmatter;
	content: string;
	slug: string;
}

