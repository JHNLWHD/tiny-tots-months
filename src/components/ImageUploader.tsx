import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { type UploadResult, useImageUpload } from "@/hooks/useImageUpload";
import { Check, ImagePlus, Loader2, X } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface ImageUploaderProps {
	babyId: string;
	month: number;
	onUploadComplete?: (result: UploadResult) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
	babyId,
	month,
	onUploadComplete,
}) => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [caption, setCaption] = useState("");
	const [preview, setPreview] = useState<string | null>(null);

	const { uploadImage, isUploading, progress, resetUploadState } =
		useImageUpload();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0];
			setSelectedFile(file);

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const clearSelection = () => {
		setSelectedFile(null);
		setPreview(null);
		setCaption("");
		resetUploadState();
	};

	const handleUpload = async () => {
		if (!selectedFile || !babyId) return;

		const result = await uploadImage(selectedFile, {
			babyId,
			monthNumber: month,
			description: caption || undefined,
			onSuccess: (data) => {
				if (onUploadComplete) onUploadComplete(data);
				clearSelection();
			},
		});
	};

	return (
		<Card className="p-6 bg-white/90 rounded-xl">
			<h3 className="text-lg font-medium mb-4">
				Upload New Photo for Month {month}
			</h3>

			<div className="space-y-4">
				{!preview ? (
					<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
						<Label htmlFor="photo-upload" className="cursor-pointer">
							<div className="flex flex-col items-center justify-center space-y-2">
								<ImagePlus className="h-8 w-8 text-gray-400" />
								<span className="text-sm text-gray-500">
									Click to select an image
								</span>
							</div>
							<Input
								id="photo-upload"
								type="file"
								className="hidden"
								accept="image/*,video/mp4,video/quicktime"
								onChange={handleFileChange}
							/>
						</Label>
					</div>
				) : (
					<div className="relative">
						{selectedFile?.type.startsWith("video/") ? (
							<video
								src={preview}
								className="w-full h-auto rounded-lg object-cover max-h-[300px]"
								controls
							/>
						) : (
							<img
								src={preview}
								alt="Upload preview"
								className="w-full h-auto rounded-lg object-cover max-h-[300px]"
							/>
						)}
						<Button
							variant="destructive"
							size="icon"
							className="absolute top-2 right-2 rounded-full"
							onClick={clearSelection}
						>
							<X size={16} />
						</Button>
					</div>
				)}

				{selectedFile && (
					<>
						<div className="space-y-2">
							<Label htmlFor="caption">Caption (optional)</Label>
							<Textarea
								id="caption"
								placeholder="Add a caption for this photo..."
								value={caption}
								onChange={(e) => setCaption(e.target.value)}
							/>
						</div>

						{isUploading && (
							<div className="space-y-2">
								<div className="flex justify-between text-sm text-gray-500">
									<span>Uploading...</span>
									<span>{progress}%</span>
								</div>
								<Progress value={progress} className="h-2" />
							</div>
						)}

						<Button
							className="w-full"
							onClick={handleUpload}
							disabled={isUploading}
						>
							{isUploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Uploading...
								</>
							) : (
								"Upload Photo"
							)}
						</Button>
					</>
				)}
			</div>
		</Card>
	);
};

export default ImageUploader;
