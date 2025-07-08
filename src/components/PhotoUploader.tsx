import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import type { CreatePhotoData } from "@/hooks/usePhotos";
import { useSubscription } from "@/hooks/useSubscription";
import { createHeicPreviewUrl, convertHeicToFile } from "@/utils/heicConverter";
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
	const [convertedFile, setConvertedFile] = useState<File | null>(null);
	const [caption, setCaption] = useState("");
	const [preview, setPreview] = useState<string | null>(null);
	const [isVideo, setIsVideo] = useState(false);
	const [effectiveMimeType, setEffectiveMimeType] = useState<string>("");
	const [isConverting, setIsConverting] = useState(false);
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

			// Check if it's a HEIC/HEIF file
			const isHeicFile = file.type === 'image/heic' || file.type === 'image/heif' ||
							   file.name.toLowerCase().endsWith('.heic') ||
							   file.name.toLowerCase().endsWith('.heif');

			if (isHeicFile) {
				setIsConverting(true);
				toast("Converting HEIC Image", {
					description: "Converting Apple HEIC format for web compatibility...",
				});

				try {
					// Create preview from HEIC
					const heicPreviewUrl = await createHeicPreviewUrl(file, { quality: 0.7 });
					if (heicPreviewUrl) {
						setPreview(heicPreviewUrl);
						console.log("HEIC preview created successfully");
					} else {
						throw new Error("Failed to create HEIC preview");
					}

					// Convert HEIC file for upload
					const converted = await convertHeicToFile(file, { quality: 0.9 });
					setConvertedFile(converted);
					console.log("HEIC file converted for upload");

					toast("HEIC Conversion Complete", {
						description: "Your HEIC image has been converted and is ready to upload!",
					});
				} catch (error) {
					console.error("HEIC conversion failed:", error);
					toast("HEIC Conversion Failed", {
						description: "Could not convert HEIC image. Please try converting to JPEG manually.",
						className: "bg-destructive text-destructive-foreground",
					});
					// Fallback to regular preview
					const reader = new FileReader();
					reader.onloadend = () => {
						setPreview(reader.result as string);
					};
					reader.readAsDataURL(file);
				} finally {
					setIsConverting(false);
				}
			} else {
				// Regular file preview
				const reader = new FileReader();
				reader.onloadend = () => {
					setPreview(reader.result as string);
					console.log("Preview created successfully");
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

		// Use converted file if available (for HEIC), otherwise use original
		const fileToUpload = convertedFile || selectedFile;

		console.log("Starting upload process for:", {
			originalFileName: selectedFile.name,
			uploadFileName: fileToUpload.name,
			originalFileType: selectedFile.type || "unknown",
			uploadFileType: fileToUpload.type || "unknown",
			effectiveMimeType: effectiveMimeType,
			fileSize: fileToUpload.size,
			isVideo: isVideo,
			babyId,
			month,
			caption: caption || "(no caption)",
			isConverted: !!convertedFile,
		});

		try {
			console.log("Calling uploadPhoto API function with isVideo:", isVideo);
			await onUpload({
				file: fileToUpload,
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
