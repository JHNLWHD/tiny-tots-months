import { BookOpen, Camera, CheckCircle2, Lightbulb } from "lucide-react";
import type React from "react";

interface FeatureItem {
	text: string;
	icon?: React.ReactNode;
}

interface FeatureCardProps {
	title: string;
	description: string;
	features: FeatureItem[] | string[];
	colorClass: string;
	imagePosition: "left" | "right";
	icon?: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
	title,
	description,
	features,
	colorClass,
	imagePosition,
	icon,
}) => {
	const contentOrder =
		imagePosition === "left" ? "md:flex-row" : "md:flex-row-reverse";

	const getDefaultIcon = () => {
		if (title.includes("Milestone"))
			return <Lightbulb size={64} className={`${colorClass}`} />;
		if (title.includes("Photo"))
			return <Camera size={64} className={`${colorClass}`} />;
		if (title.includes("Export"))
			return <BookOpen size={64} className={`${colorClass}`} />;
		return <CheckCircle2 size={64} className={`${colorClass}`} />;
	};

	return (
		<article className={`flex flex-col ${contentOrder} gap-12 items-center`}>
			<div className="md:w-1/2 space-y-6">
				<h3 className={`text-3xl md:text-4xl font-bold mb-6 ${colorClass}`}>{title}</h3>
				<p className="text-xl text-gray-600 mb-8 leading-relaxed">{description}</p>
				<ul className="space-y-4">
					{features.map((item, index) => {
						// Check if the item is a string or an object with text and icon properties
						const isString = typeof item === "string";
						const text = isString ? item : item.text;
						const itemIcon = isString ? (
							<CheckCircle2
								className="h-6 w-6 text-baby-purple mr-3"
								aria-hidden="true"
							/>
						) : (
							item.icon
						);

						return (
							<li key={text || index} className="flex items-start">
								{itemIcon || (
									<CheckCircle2
										className="h-6 w-6 text-baby-purple mr-3 mt-0.5"
										aria-hidden="true"
									/>
								)}
								<span className="text-lg text-gray-700">{text}</span>
							</li>
						);
					})}
				</ul>
			</div>
			<div className="md:w-1/2 relative">
				<div className="bg-gradient-to-br from-baby-purple/5 to-baby-blue/5 p-8 rounded-3xl flex items-center justify-center shadow-lg border border-baby-purple/10">
					<div className="w-40 h-40 rounded-full bg-gradient-to-br from-baby-purple/10 to-baby-blue/10 flex items-center justify-center shadow-inner">
						{icon || getDefaultIcon()}
					</div>
				</div>
				{/* Decorative elements */}
				<div className="absolute -top-4 -right-4 w-8 h-8 bg-baby-purple/20 rounded-full"></div>
				<div className="absolute -bottom-4 -left-4 w-6 h-6 bg-baby-blue/20 rounded-full"></div>
			</div>
		</article>
	);
};

export default FeatureCard;
