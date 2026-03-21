import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Photo } from "@/types/photo";
import type React from "react";
import PhotoImage from "./PhotoImage";

type PhotoCompareDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	left: Photo | null;
	right: Photo | null;
};

const Panel: React.FC<{ photo: Photo; label: string }> = ({ photo, label }) => (
	<div className="flex flex-col gap-2 min-w-0">
		<p className="text-sm font-medium text-gray-700">{label}</p>
		<div className="aspect-square w-full max-h-[50vh] rounded-lg overflow-hidden bg-gray-100 border">
			{photo.is_video ? (
				<video
					src={photo.url}
					className="w-full h-full object-contain"
					controls
					playsInline
				/>
			) : (
				<PhotoImage
					src={photo.url || "/placeholder.svg"}
					alt={photo.description || label}
					className="w-full h-full object-contain"
					loading="eager"
					size="display"
				/>
			)}
		</div>
		<p className="text-xs text-gray-500">
			Month {photo.month_number} · {new Date(photo.created_at).toLocaleDateString()}
		</p>
		{photo.description ? (
			<p className="text-sm text-gray-800 line-clamp-3">{photo.description}</p>
		) : null}
	</div>
);

const PhotoCompareDialog: React.FC<PhotoCompareDialogProps> = ({
	open,
	onOpenChange,
	left,
	right,
}) => {
	const canShow = left && right;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Compare photos</DialogTitle>
				</DialogHeader>
				{canShow ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
						<Panel photo={left} label="First" />
						<Panel photo={right} label="Second" />
					</div>
				) : (
					<p className="text-sm text-gray-500">Select two photos to compare.</p>
				)}
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default PhotoCompareDialog;
