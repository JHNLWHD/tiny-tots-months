import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BlogMeta } from "@/components/blog/BlogMeta";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogNavigation } from "@/components/blog/BlogNavigation";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import Footer from "@/components/landing/Footer";
import { getBlogPost, getAllBlogPosts, getRelatedPosts } from "@/lib/blog";
import type { BlogPost as BlogPostType } from "@/types/blog";

const BlogPost = () => {
	const { slug } = useParams<{ slug: string }>();
	const [post, setPost] = useState<BlogPostType | null>(null);
	const [allPosts, setAllPosts] = useState<BlogPostType[]>([]);
	const [loading, setLoading] = useState(true);
	const siteUrl = "https://tinytotsmilestones.com";

	useEffect(() => {
		async function loadPost() {
			if (!slug) return;

			try {
				const [postData, allPostsData] = await Promise.all([
					getBlogPost(slug),
					getAllBlogPosts(),
				]);

				if (postData) {
					setPost(postData);
					setAllPosts(allPostsData);
				}
			} catch (error) {
				console.error("Error loading blog post:", error);
			} finally {
				setLoading(false);
			}
		}
		loadPost();
	}, [slug]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex flex-col">
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-pulse text-baby-purple">Loading post...</div>
				</div>
				<Footer />
			</div>
		);
	}

	if (!post) {
		return (
			<div className="min-h-screen bg-gray-50 flex flex-col">
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
						<Link to="/blog" className="text-baby-purple hover:underline">
							← Back to Blog
						</Link>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	const { frontmatter } = post;
	const Content = post.content;
	const currentIndex = allPosts.findIndex((p) => p.slug === slug);
	const previous = currentIndex > 0 ? allPosts[currentIndex - 1] : undefined;
	const next = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : undefined;
	const related = getRelatedPosts(slug!, allPosts, frontmatter.related);

	const structuredData = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: frontmatter.title,
		description: frontmatter.description,
		image: frontmatter.image ? `${siteUrl}${frontmatter.image}` : `${siteUrl}/og-image.png`,
		datePublished: frontmatter.date,
		author: {
			"@type": "Person",
			name: frontmatter.author,
		},
		publisher: {
			"@type": "Organization",
			name: "Tiny Tots Milestones",
			logo: {
				"@type": "ImageObject",
				url: `${siteUrl}/favicon-96x96.png`,
			},
		},
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Helmet>
				<title>{frontmatter.title} | Tiny Tots Milestones Blog</title>
				<meta name="description" content={frontmatter.description} />
				<meta name="keywords" content={frontmatter.keywords.join(", ")} />
				<meta property="og:title" content={frontmatter.title} />
				<meta property="og:description" content={frontmatter.description} />
				<meta property="og:type" content="article" />
				<meta property="og:url" content={`${siteUrl}/blog/${frontmatter.slug}`} />
				<meta
					property="og:image"
					content={frontmatter.image ? `${siteUrl}${frontmatter.image}` : `${siteUrl}/og-image.png`}
				/>
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={frontmatter.title} />
				<meta name="twitter:description" content={frontmatter.description} />
				<meta
					name="twitter:image"
					content={frontmatter.image ? `${siteUrl}${frontmatter.image}` : `${siteUrl}/og-image.png`}
				/>
				<link rel="canonical" href={`${siteUrl}/blog/${frontmatter.slug}`} />
				<script type="application/ld+json">{JSON.stringify(structuredData)}</script>
			</Helmet>

			<article className="container mx-auto px-4 py-12 md:py-16">
				<div className="max-w-4xl mx-auto">
					<Link
						to="/blog"
						className="inline-flex items-center gap-2 text-baby-purple hover:text-baby-purple/80 mb-6"
					>
						← Back to Blog
					</Link>

					<header className="mb-8">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
							{frontmatter.title}
						</h1>
						<BlogMeta frontmatter={frontmatter} />
					</header>

					{frontmatter.image && (
						<div className="mb-8">
							<img
								src={frontmatter.image}
								alt={frontmatter.title}
								className="w-full h-auto rounded-lg"
							/>
						</div>
					)}

					<div className="bg-white rounded-lg p-8 md:p-12 shadow-soft">
						<BlogContent>
							<Content />
						</BlogContent>
					</div>

					<BlogNavigation previous={previous} next={next} />

					{related.length > 0 && <RelatedPosts posts={related} />}
				</div>
			</article>
			<Footer />
		</div>
	);
};

export default BlogPost;

