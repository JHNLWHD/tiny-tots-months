import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Milestone } from "@/hooks/useMilestones";
import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import type React from "react";

interface MilestoneListProps {
	milestones: Milestone[];
	onDelete?: (id: string) => void;
	readOnly?: boolean;
}

const MilestoneList: React.FC<MilestoneListProps> = ({
	milestones,
	onDelete,
	readOnly = false,
}) => {
	if (!milestones || milestones.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500">No milestones recorded yet.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{milestones.map((milestone) => (
				<Card key={milestone.id} className="overflow-hidden">
					<CardContent className="p-4">
						<div className="mb-1">
							<Badge variant="outline" className="text-xs">
								{format(parseISO(milestone.created_at), "MMMM d, yyyy")}
							</Badge>
						</div>
						<p className="text-gray-800">{milestone.milestone_text}</p>
					</CardContent>
					{!readOnly && onDelete && (
						<CardFooter className="p-3 pt-0 flex justify-end">
							<Button
								variant="outline"
								size="sm"
								className="text-xs text-gray-500 hover:text-red-600 hover:border-red-200"
								onClick={() => onDelete(milestone.id)}
							>
								<Trash2 size={14} className="mr-1" /> Remove
							</Button>
						</CardFooter>
					)}
				</Card>
			))}
		</div>
	);
};

export default MilestoneList;
