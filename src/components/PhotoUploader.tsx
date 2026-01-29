import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import type { CreatePhotoData } from "@/hooks/usePhotos";
import { useAbilities } from "@/hooks/useAbilities";
import { createHeicPreviewUrl, convertHeicToFile } from "@/utils/heicConverter";
import type React from "react";
import { useState } from "react";
import CaptionForm from "./photoUploader/CaptionForm";
import FileSelector from "./photoUploader/FileSelector";
import MediaPreview from "./photoUploader/MediaPreview";
import { validateFile } from "./photoUploader/validateFile";

type PhotoUploaderProps = {
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
	const [convertedFile, setConvertedFile] = useState<File | null>(null);
	const [caption, setCaption] = useState("");
	const [preview, setPreview] = useState<string | null>(null);
	const [isVideo, setIsVideo] = useState(false);
	const [effectiveMimeType, setEffectiveMimeType] = useState<string>("");
	const [isConverting, setIsConverting] = useState(false);
	const { canUploadVideo } = useAbilities();
	
	// Check CASL abilities for video upload permission
	const videoUploadAllowed = canUploadVideo().allowed;

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0];

			const validation = await validateFile(file, videoUploadAllowed);

			if (!validation.isValid) {
				return;
			}

			setSelectedFile(file);
			setIsVideo(validation.isVideo);
			setEffectiveMimeType(validation.effectiveMimeType);

			const isHeicFile = file.type === 'image/heic' || file.type === 'image/heif' ||
							   file.name.toLowerCase().endsWith('.heic') ||
							   file.name.toLowerCase().endsWith('.heif');

			if (isHeicFile) {
				setIsConverting(true);
				toast("Converting HEIC Image", {
					description: "Converting Apple HEIC format for web compatibility...",
				});

				try {
					const heicPreviewUrl = await createHeicPreviewUrl(file, { quality: 0.7 });
					if (heicPreviewUrl) {
						setPreview(heicPreviewUrl);
					} else {
						throw new Error("Failed to create HEIC preview");
					}

					const converted = await convertHeicToFile(file, { quality: 0.9 });
					setConvertedFile(converted);

					toast("HEIC Conversion Complete", {
						description: "Your HEIC image has been converted and is ready to upload!",
					});
				} catch (error) {
					console.error("HEIC conversion failed:", error);
					toast("HEIC Conversion Failed", {
						description: "Could not convert HEIC image. Please try converting to JPEG manually.",
						className: "bg-destructive text-destructive-foreground",
					});
					const reader = new FileReader();
					reader.onloadend = () => {
						setPreview(reader.result as string);
					};
					reader.readAsDataURL(file);
				} finally {
					setIsConverting(false);
				}
			} else {
				const reader = new FileReader();
				reader.onloadend = () => {
					setPreview(reader.result as string);
				};
				reader.readAsDataURL(file);
			}
		}
	};

	const clearSelection = () => {
		if (preview && preview.startsWith('blob:')) {
			URL.revokeObjectURL(preview);
		}
		setSelectedFile(null);
		setConvertedFile(null);
		setPreview(null);
		setCaption("");
		setIsVideo(false);
		setEffectiveMimeType("");
		setIsConverting(false);
	};

	const handleUpload = async () => {
		if (!selectedFile || !babyId) {
			toast("No file selected", {
				description: "Please select an image or video to upload",
				className: "bg-destructive text-destructive-foreground",
			});
			return;
		}

		const fileToUpload = convertedFile || selectedFile;

		try {
			await onUpload({
				file: fileToUpload,
				baby_id: babyId,
				month_number: month,
				description: caption || undefined,
				is_video: isVideo,
			});

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
				Upload New {videoUploadAllowed ? "Photo or Video" : "Photo"} for Month {month}
			</h3>

			<div className="space-y-4">
				{!preview ? (
					<FileSelector canUploadVideo={videoUploadAllowed} onFileChange={handleFileChange} />
				) : (
					<MediaPreview
						preview={preview}
						isVideo={isVideo}
						onClear={clearSelection}
					/>
				)}

				{isConverting && (
					<div className="text-center py-4">
						<div className="inline-flex items-center gap-2 text-sm text-gray-600">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
							Converting HEIC image...
						</div>
					</div>
				)}

				{selectedFile && !isConverting && (
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
