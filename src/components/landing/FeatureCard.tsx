import { BookOpen, Camera, CheckCircle2, Lightbulb } from "lucide-react";
import type React from "react";

type FeatureItem = {
	text: string;
	icon?: React.ReactNode;
};

type FeatureCardProps = {
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
		<article className={`flex flex-col ${contentOrder} gap-8 sm:gap-10 md:gap-12 items-center`}>
			<div className="md:w-1/2 space-y-4 sm:space-y-6 w-full px-2">
				<h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 ${colorClass}`}>{title}</h3>
				<p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">{description}</p>
				<ul className="space-y-3 sm:space-y-4">
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
										className="h-5 w-5 sm:h-6 sm:w-6 text-baby-purple mr-2 sm:mr-3 mt-0.5 flex-shrink-0"
										aria-hidden="true"
									/>
								)}
								<span className="text-sm sm:text-base md:text-lg text-gray-700">{text}</span>
							</li>
						);
					})}
				</ul>
			</div>
			<div className="md:w-1/2 relative w-full px-2">
				<div className="bg-gradient-to-br from-baby-purple/5 to-baby-blue/5 p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg border border-baby-purple/10">
					<div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-baby-purple/10 to-baby-blue/10 flex items-center justify-center shadow-inner">
						<div className="w-16 h-16 sm:w-20 sm:h-20">
							{icon || getDefaultIcon()}
						</div>
					</div>
				</div>
				{/* Decorative elements */}
				<div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 bg-baby-purple/20 rounded-full"></div>
				<div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-4 h-4 sm:w-6 sm:h-6 bg-baby-blue/20 rounded-full"></div>
			</div>
		</article>
	);
};

export default FeatureCard;
