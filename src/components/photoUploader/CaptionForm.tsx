import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type React from "react";

type CaptionFormProps = {
	caption: string;
	onCaptionChange: (caption: string) => void;
	onUpload: () => void;
	isVideo: boolean;
	isUploading: boolean;
}

const CaptionForm: React.FC<CaptionFormProps> = ({
	caption,
	onCaptionChange,
	onUpload,
	isVideo,
	isUploading,
}) => {
	return (
		<>
			<div className="space-y-2">
				<Label htmlFor="caption">Caption (optional)</Label>
				<Textarea
					id="caption"
					placeholder={`Add a caption for this ${isVideo ? "video" : "photo"}...`}
					value={caption}
					onChange={(e) => onCaptionChange(e.target.value)}
				/>
			</div>

			<Button className="w-full" onClick={onUpload} disabled={isUploading}>
				{isUploading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Uploading...
					</>
				) : (
					`Upload ${isVideo ? "Video" : "Photo"}`
				)}
			</Button>
		</>
	);
};

export default CaptionForm;
