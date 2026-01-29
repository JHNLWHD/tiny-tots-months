import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, VideoIcon } from "lucide-react";
import type React from "react";

type FileSelectorProps = {
	canUploadVideo: boolean;
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const FileSelector: React.FC<FileSelectorProps> = ({
	canUploadVideo,
	onFileChange,
}) => {
	return (
		<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
			<Label htmlFor="photo-upload" className="cursor-pointer">
				<div className="flex flex-col items-center justify-center space-y-2">
					{canUploadVideo ? (
						<div className="flex space-x-2">
							<ImagePlus className="h-8 w-8 text-gray-400" />
							<VideoIcon className="h-8 w-8 text-gray-400" />
						</div>
					) : (
						<ImagePlus className="h-8 w-8 text-gray-400" />
					)}
					<span className="text-sm text-gray-500">
						Click to select {canUploadVideo ? "an image or video" : "an image"}
					</span>
					{canUploadVideo && (
						<span className="text-xs text-gray-400">
							(Videos must be under 50MB)
						</span>
					)}
				</div>
				<Input
					id="photo-upload"
					type="file"
					className="hidden"
					accept={
						canUploadVideo
							? "image/*,video/mp4,video/quicktime,video/webm"
							: "image/*"
					}
					onChange={onFileChange}
				/>
			</Label>
		</div>
	);
};

export default FileSelector;
