import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
	return (
		<Layout>
			<div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
				<h1 className="text-4xl font-bold mb-4">Oops!</h1>
				<p className="text-xl text-gray-600 mb-8">
					We couldn't find the page you're looking for.
				</p>
				<Button asChild>
					<Link to="/">Return to Home</Link>
				</Button>
			</div>
		</Layout>
	);
};

export default NotFound;
