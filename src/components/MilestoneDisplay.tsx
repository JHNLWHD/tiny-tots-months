import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import type React from "react";

interface MilestoneDisplayProps {
	title: string;
	description: string;
	icon?: React.ReactNode;
	onDelete?: () => void;
	readOnly?: boolean;
}

const MilestoneDisplay: React.FC<MilestoneDisplayProps> = ({
	title,
	description,
	icon,
	onDelete,
	readOnly = false,
}) => {
	return (
		<Card className="bg-white/80 rounded-xl shadow-sm mb-4 overflow-hidden">
			<CardContent className="p-6">
				<div className="flex items-start gap-4">
					{icon && <div className="text-blue-400 mt-1">{icon}</div>}
					<div className="flex-1">
						<h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
						<p className="text-gray-600">{description}</p>
					</div>
				</div>
			</CardContent>
			{!readOnly && onDelete && (
				<CardFooter className="p-3 pt-0 flex justify-end border-t border-gray-100">
					<Button
						variant="outline"
						size="sm"
						className="text-xs text-gray-500 hover:text-red-600 hover:border-red-200"
						onClick={onDelete}
					>
						<Trash2 size={14} className="mr-1" /> Remove
					</Button>
				</CardFooter>
			)}
		</Card>
	);
};

export default MilestoneDisplay;
