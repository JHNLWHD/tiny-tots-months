import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";

type PlanCardProps = {
	title: string;
	description: string;
	price: string;
	pricePeriod: string;
	features: string[];
	isPremium?: boolean;
	ctaLink: string;
	ctaText: string;
};

const PlanCard: React.FC<PlanCardProps> = ({
	title,
	description,
	price,
	pricePeriod,
	features,
	isPremium = false,
	ctaLink,
	ctaText,
}) => {
	return (
		<article
			className={`relative ${
				isPremium
					? "border-2 border-baby-purple rounded-2xl p-10 bg-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
					: "border border-gray-200 rounded-2xl p-10 bg-white shadow-lg hover:shadow-xl hover:border-baby-purple/30 transform hover:scale-105 transition-all duration-300"
			}`}
		>
			{isPremium && (
				<>
					<div className="absolute top-0 right-0 bg-gradient-to-r from-baby-purple to-baby-blue text-white px-6 py-2 text-sm font-bold rounded-bl-2xl shadow-lg">
						MOST POPULAR
					</div>
					<div className="absolute -top-2 -right-2 w-4 h-4 bg-baby-purple/20 rounded-full"></div>
					<div className="absolute -bottom-2 -left-2 w-6 h-6 bg-baby-blue/20 rounded-full"></div>
				</>
			)}
			<div className="relative z-10">
				<h3 className={`text-3xl font-bold mb-3 ${isPremium ? "text-baby-purple" : "text-gray-800"}`}>
					{title}
				</h3>
				<p className="text-gray-600 mb-8 text-lg">{description}</p>
				<div className="mb-8">
					<p className={`text-5xl font-bold ${isPremium ? "text-baby-purple" : "text-gray-800"}`}>
						{price}
					</p>
					<span className="text-lg text-gray-500 font-medium">
						{pricePeriod}
					</span>
				</div>

				<ul className="space-y-4 mb-10">
					{features.map((item) => (
						<li key={item} className="flex items-start">
							<CheckCircle2
								className={`h-6 w-6 ${isPremium ? "text-baby-purple" : "text-green-500"} mr-3 mt-0.5 flex-shrink-0`}
								aria-hidden="true"
							/>
							<span className="text-gray-700 text-lg">{item}</span>
						</li>
					))}
				</ul>

				<Button
					asChild
					size="lg"
					className={`w-full rounded-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
						isPremium 
							? "bg-baby-purple hover:bg-baby-purple/90 text-white" 
							: "border-2 border-baby-purple text-baby-purple hover:bg-baby-purple/10"
					}`}
					variant={isPremium ? "default" : "outline"}
				>
					<Link to={ctaLink}>{ctaText}</Link>
				</Button>
			</div>
		</article>
	);
};

export default PlanCard;
