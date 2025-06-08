import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import type { CreatePhotoData } from "@/hooks/usePhotos";
import { useSubscription } from "@/hooks/useSubscription";
import type React from "react";
import { useState } from "react";
import CaptionForm from "./photoUploader/CaptionForm";
import FileSelector from "./photoUploader/FileSelector";
import MediaPreview from "./photoUploader/MediaPreview";
import { validateFile } from "./photoUploader/validateFile";

interface PhotoUploaderProps {
	babyId: string;
	month: number;
	onUploadComplete: () => void;
	onUpload: (data: CreatePhotoData) => void;
	isUploading: boolean;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
	babyId,
	month,
	onUploadComplete,
	onUpload,
	isUploading,
}) => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [caption, setCaption] = useState("");
	const [preview, setPreview] = useState<string | null>(null);
	const [isVideo, setIsVideo] = useState(false);
	const [effectiveMimeType, setEffectiveMimeType] = useState<string>("");
	const { isPremium } = useSubscription();

	console.log("PhotoUploader rendered with subscription status:", {
		isPremium,
	});

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0];

			console.log("File selected:", {
				name: file.name,
				size: file.size,
				type: file.type || "unknown",
				lastModified: new Date(file.lastModified).toISOString(),
			});

			// Use async validation
			const validation = await validateFile(file, isPremium);
			console.log("File validation result:", validation);

			if (!validation.isValid) {
				return;
			}

			setSelectedFile(file);
			setIsVideo(validation.isVideo);
			setEffectiveMimeType(validation.effectiveMimeType);

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
				console.log("Preview created successfully");
			};
			reader.readAsDataURL(file);
		}
	};

	const clearSelection = () => {
		setSelectedFile(null);
		setPreview(null);
		setCaption("");
		setIsVideo(false);
		setEffectiveMimeType("");
		console.log("File selection cleared");
	};

	const handleUpload = async () => {
		if (!selectedFile || !babyId) {
			toast("No file selected", {
				description: "Please select an image or video to upload",
				className: "bg-destructive text-destructive-foreground",
			});
			return;
		}

		console.log("Starting upload process for:", {
			fileName: selectedFile.name,
			fileType: selectedFile.type || "unknown",
			effectiveMimeType: effectiveMimeType,
			fileSize: selectedFile.size,
			isVideo: isVideo,
			babyId,
			month,
			caption: caption || "(no caption)",
		});

		try {
			console.log("Calling uploadPhoto API function with isVideo:", isVideo);
			await onUpload({
				file: selectedFile,
				baby_id: babyId,
				month_number: month,
				description: caption || undefined,
				is_video: isVideo,
			});

			console.log("Upload API call complete");
			clearSelection();
			onUploadComplete();
		} catch (error) {
			console.error("Upload error in component:", error);
			// Error handling is done in the hook
		}
	};

	return (
		<Card className="p-6 bg-white/90 rounded-xl">
			<h3 className="text-lg font-medium mb-4">
				Upload New {isPremium ? "Photo or Video" : "Photo"} for Month {month}
			</h3>

			<div className="space-y-4">
				{!preview ? (
					<FileSelector isPremium={isPremium} onFileChange={handleFileChange} />
				) : (
					<MediaPreview
						preview={preview}
						isVideo={isVideo}
						onClear={clearSelection}
					/>
				)}

				{selectedFile && (
					<CaptionForm
						caption={caption}
						onCaptionChange={setCaption}
						onUpload={handleUpload}
						isVideo={isVideo}
						isUploading={isUploading}
					/>
				)}
			</div>
		</Card>
	);
};

export default PhotoUploader;
