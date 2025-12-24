import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Baby } from "@/hooks/useBabyProfiles";
import { format, parseISO } from "date-fns";
import { Baby as BabyIcon, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type BabyCardProps = {
	baby: Baby;
	onDelete: (id: string) => void;
	backgroundClass?: string;
	onClick?: () => void;
	isSelected?: boolean;
};

const BabyCard = ({
	baby,
	onDelete,
	backgroundClass = "bg-baby-blue",
	onClick,
	isSelected = false,
}: BabyCardProps) => {
	const navigate = useNavigate();
	const age = calculateAge(baby.date_of_birth);

	function calculateAge(dateOfBirth: string) {
		const birthDate = parseISO(dateOfBirth);
		const today = new Date();

		let years = today.getFullYear() - birthDate.getFullYear();
		let months = today.getMonth() - birthDate.getMonth();

		if (months < 0) {
			years--;
			months += 12;
		}

		if (years > 0) {
			return `${years} year${years !== 1 ? "s" : ""}`;
		}
		return `${months} month${months !== 1 ? "s" : ""}`;
	}

	const formattedDate = format(parseISO(baby.date_of_birth), "MMMM d, yyyy");

	const handleCardClick = () => {
		if (onClick) {
			onClick();
		} else {
			navigate(`/app/month/${baby.id}/1`); // Navigate to month 1 for this baby
		}
	};

	return (
		<Card
			className={`${backgroundClass} overflow-hidden transition-all hover:shadow-lg ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
			onClick={handleCardClick}
		>
			<CardContent className="p-4 flex flex-col items-center text-center">
				<div className="mb-2 mt-4">
					<BabyIcon size={48} className="text-white" />
				</div>
				<h3 className="font-bold text-xl text-white truncate max-w-full">
					{baby.name}
				</h3>
				<p className="text-sm text-white/90">{age} old</p>
				<p className="text-xs text-white/80 mt-1">Born: {formattedDate}</p>
			</CardContent>
			<CardFooter className="flex justify-between p-3 bg-white/20 gap-2">
				<Button
					onClick={(e) => {
						e.stopPropagation(); // Prevent the card click handler from firing
						navigate(`/app/month/${baby.id}/1`);
					}}
					variant="secondary"
					className="text-xs w-full"
				>
					View Milestones
				</Button>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="destructive"
							size="icon"
							onClick={(e) => e.stopPropagation()} // Prevent the card click handler from firing
						>
							<Trash2 size={16} />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent onClick={(e) => e.stopPropagation()}>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Baby Profile</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete {baby.name}'s profile? This
								action cannot be undone and will remove all associated
								milestones and photos.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={() => onDelete(baby.id)}>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardFooter>
		</Card>
	);
};

export default BabyCard;
