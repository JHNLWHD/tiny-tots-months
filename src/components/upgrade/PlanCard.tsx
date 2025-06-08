import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import type React from "react";

interface PlanFeature {
	text: string;
	isNegative?: boolean;
}

interface PlanCardProps {
	title: string;
	price: string;
	isPremium?: boolean;
	features: PlanFeature[];
	priceSubtext?: string;
	children?: React.ReactNode;
}

export const PlanCard: React.FC<PlanCardProps> = ({
	title,
	price,
	isPremium = false,
	features,
	priceSubtext,
	children,
}) => {
	const textColor = isPremium ? "text-baby-purple" : "text-green-500";

	return (
		<Card
			className={`p-6 ${isPremium ? "border-2 border-baby-purple bg-white relative overflow-hidden" : "border-gray-200 bg-white"}`}
		>
			{isPremium && (
				<div className="absolute top-0 right-0 bg-baby-purple text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
					RECOMMENDED
				</div>
			)}
			<div className="border-b pb-4 mb-4">
				<h3 className="text-xl font-bold">{title}</h3>
				<p className="text-2xl font-bold mt-2">{price}</p>
				{priceSubtext && (
					<p className="text-sm text-gray-500">{priceSubtext}</p>
				)}
			</div>
			<ul className="space-y-2 mb-6">
				{features.map((feature) => (
					<li key={feature.text} className="flex items-start">
						{feature.isNegative ? (
							<XCircle className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
						) : (
							<CheckCircle2
								className={`h-5 w-5 ${textColor} mr-2 mt-0.5 flex-shrink-0`}
							/>
						)}
						<span
							className={feature.isNegative ? "text-gray-400 line-through" : ""}
						>
							{feature.text}
						</span>
					</li>
				))}
			</ul>
			{children}
		</Card>
	);
};
