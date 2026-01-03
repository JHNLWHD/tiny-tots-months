import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { BlogCard } from "@/components/blog/BlogCard";
import Footer from "@/components/landing/Footer";
import { getAllBlogPosts } from "@/lib/blog";
import type { BlogPost } from "@/types/blog";

const Blog = () => {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const siteUrl = "https://tinytotsmilestones.com";

	useEffect(() => {
		async function loadPosts() {
			try {
				const allPosts = await getAllBlogPosts();
				setPosts(allPosts);
			} catch (error) {
				console.error("Error loading blog posts:", error);
			} finally {
				setLoading(false);
			}
		}
		loadPosts();
	}, []);

	return (
		<div className="min-h-screen bg-gray-50">
			<Helmet>
				<title>Baby Milestone Blog - Parenting Tips & Development Guides | Tiny Tots Milestones</title>
				<meta
					name="description"
					content="Expert parenting advice and comprehensive guides on baby milestones, development stages, and growth tracking. Learn how to document your baby's journey month by month."
				/>
				<meta
					name="keywords"
					content="baby milestones, baby development, parenting tips, baby growth tracker, milestone guide, baby development stages"
				/>
				<meta property="og:title" content="Baby Milestone Blog - Parenting Tips & Development Guides" />
				<meta
					property="og:description"
					content="Expert parenting advice and comprehensive guides on baby milestones, development stages, and growth tracking."
				/>
				<meta property="og:type" content="website" />
				<meta property="og:url" content={`${siteUrl}/blog`} />
				<meta property="og:image" content={`${siteUrl}/og-image.png`} />
			</Helmet>

			<div className="container mx-auto px-4 py-12 md:py-16">
				<div className="max-w-6xl mx-auto">
					<header className="text-center mb-12">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
							Baby Milestone <span className="text-baby-purple">Blog</span>
						</h1>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Expert parenting advice, milestone guides, and tips for tracking your baby's development journey
						</p>
					</header>

					{loading ? (
						<div className="text-center py-12">
							<div className="animate-pulse text-baby-purple">Loading posts...</div>
						</div>
					) : posts.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-600">No blog posts available yet. Check back soon!</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{posts.map((post) => (
								<BlogCard key={post.slug} post={post} />
							))}
						</div>
					)}
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default Blog;

