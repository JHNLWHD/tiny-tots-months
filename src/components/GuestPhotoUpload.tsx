import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useGuestPhotoAuth } from "@/context/GuestPhotoAuthContext";
import { Camera, Lock, Upload, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useGuestPhotoUpload } from "@/hooks/useGuestPhotoUpload";
import { FILE_SIZE_LIMITS, ONE_MB } from "@/components/photoUploader/validateFile";

type FileWithPreview = {
	file: File;
	preview: string;
};

export type ColorTheme = {
	primary: string;
	primaryHover: string;
	primaryLight: string;
	primaryDark: string;
	shadow: string;
	border: string;
	bg: string;
};

const defaultColorTheme: ColorTheme = {
	primary: "#6a3be4", // baby-purple
	primaryHover: "rgba(106, 59, 228, 0.9)",
	primaryLight: "rgba(106, 59, 228, 0.1)",
	primaryDark: "rgba(106, 59, 228, 0.2)",
	shadow: "rgba(106, 59, 228, 0.15)",
	border: "rgba(106, 59, 228, 0.2)",
	bg: "rgba(106, 59, 228, 0.05)",
};

type GuestPhotoUploadProps = {
	eventId: string;
	storageBucket: string;
	colorTheme?: ColorTheme;
};

const GuestPhotoUpload = ({ eventId, storageBucket, colorTheme = defaultColorTheme }: GuestPhotoUploadProps) => {
	const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
	const [inputPasscode, setInputPasscode] = useState("");
	const [inputName, setInputName] = useState("");
	const { isAuthenticated, guestName, verifyPasscode, logout } = useGuestPhotoAuth();
	const { uploadPhoto, isUploading } = useGuestPhotoUpload(eventId, storageBucket, isAuthenticated);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif'];
		const invalidFiles: string[] = [];
		const tooLargeFiles: string[] = [];
		const validFiles: File[] = [];

		// First pass: validate all files
		files.forEach((file) => {
			// Validate file type - only images allowed
			if (!file.type.startsWith("image/")) {
				invalidFiles.push(file.name);
				return;
			}

			// Validate image extensions
			const fileExtension = file.name.split('.').pop()?.toLowerCase();
			if (!fileExtension || !validExtensions.includes(fileExtension)) {
				invalidFiles.push(file.name);
				return;
			}

			// Validate file size (using VIDEO_MAX_SIZE as max for guest uploads)
			if (file.size > FILE_SIZE_LIMITS.VIDEO_MAX_SIZE) {
				tooLargeFiles.push(file.name);
				return;
			}

			validFiles.push(file);
		});

		// Show error messages for invalid files
		if (invalidFiles.length > 0) {
			toast("Invalid File Type", {
				description: `${invalidFiles.length} file(s) were skipped. Only image files are allowed (JPG, PNG, GIF, WEBP, BMP, TIFF)`,
				className: "bg-destructive text-destructive-foreground",
			});
		}

		if (tooLargeFiles.length > 0) {
			const maxSizeMB = FILE_SIZE_LIMITS.VIDEO_MAX_SIZE / ONE_MB;
			toast("File Too Large", {
				description: `${tooLargeFiles.length} file(s) were skipped. File size must be less than ${maxSizeMB}MB`,
				className: "bg-destructive text-destructive-foreground",
			});
		}

		// Create previews for all valid files
		const previewPromises = validFiles.map((file) => {
			return new Promise<FileWithPreview>((resolve) => {
				const reader = new FileReader();
				reader.onloadend = () => {
					resolve({
						file,
						preview: reader.result as string,
					});
				};
				reader.readAsDataURL(file);
			});
		});

		const newFiles = await Promise.all(previewPromises);
		setSelectedFiles((prev) => [...prev, ...newFiles]);

		// Reset input to allow selecting the same files again
		e.target.value = '';
	};

	const handlePasscodeSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (verifyPasscode(inputPasscode, inputName)) {
			toast("Access Granted", {
				description: "You can now upload photos!",
			});
			setInputPasscode("");
			setInputName("");
		} else {
			toast("Invalid Passcode", {
				description: "Please check the passcode and try again.",
				className: "bg-destructive text-destructive-foreground",
			});
			setInputPasscode("");
		}
	};

	const handleUpload = () => {
		if (selectedFiles.length === 0) return;

		if (!guestName || !guestName.trim()) {
			toast("Name Required", {
				description: "Please enter your name in the authentication form.",
				className: "bg-destructive text-destructive-foreground",
			});
			return;
		}

		// Upload all files as an array
		uploadPhoto(
			selectedFiles.map((item) => ({
				file: item.file,
				guest_name: guestName,
			}))
		);

		// Clean up preview URLs and reset form
		selectedFiles.forEach((item) => {
			if (item.preview.startsWith("blob:")) {
				URL.revokeObjectURL(item.preview);
			}
		});
		setSelectedFiles([]);
	};

	const handleRemoveFile = (index: number) => {
		const fileToRemove = selectedFiles[index];
		if (fileToRemove.preview.startsWith("blob:")) {
			URL.revokeObjectURL(fileToRemove.preview);
		}
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const handleClearAll = () => {
		selectedFiles.forEach((item) => {
			if (item.preview.startsWith("blob:")) {
				URL.revokeObjectURL(item.preview);
			}
		});
		setSelectedFiles([]);
	};

	const handleLogout = () => {
		logout();
		selectedFiles.forEach((item) => {
			if (item.preview.startsWith("blob:")) {
				URL.revokeObjectURL(item.preview);
			}
		});
		setSelectedFiles([]);
	};

	return (
		<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative" style={{
			boxShadow: `0 20px 60px ${colorTheme.shadow}, 0 0 0 1px ${colorTheme.shadow.replace('0.15', '0.05')}`,
		}}>
			<div className="p-6 md:p-8">
				<h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2 font-heading" style={{ color: colorTheme.primary }}>
					<Camera className="h-5 w-5" />
					Share Your Photos
				</h3>
				<p className="text-gray-600 mb-6 text-center font-serif">
					Upload photos from the event to share with everyone!
				</p>

				{!isAuthenticated ? (
					<div className="space-y-4">
						<div className="rounded-lg p-6 border-2" style={{ 
							backgroundColor: colorTheme.bg,
							borderColor: colorTheme.border,
						}}>
							<div className="flex items-center gap-2 mb-4" style={{ color: colorTheme.primary }}>
								<Lock className="h-5 w-5" />
								<h4 className="font-semibold">Access Required</h4>
							</div>
							<p className="text-sm text-gray-600 mb-4">
								Please enter your name and passcode to upload photos.
							</p>
							<form onSubmit={handlePasscodeSubmit} className="space-y-4">
								<div>
									<Label htmlFor="guest-name-auth" className="text-gray-700">
										Your Name <span className="text-red-500">*</span>
									</Label>
									<Input
										id="guest-name-auth"
										type="text"
										value={inputName}
										onChange={(e) => setInputName(e.target.value)}
										placeholder="Enter your name"
										className="mt-1"
										required
									/>
								</div>
								<div>
									<Label htmlFor="passcode" className="text-gray-700">
										Passcode <span className="text-red-500">*</span>
									</Label>
									<Input
										id="passcode"
										type="password"
										value={inputPasscode}
										onChange={(e) => setInputPasscode(e.target.value)}
										placeholder="Enter passcode"
										className="mt-1"
										required
									/>
								</div>
								<Button
									type="submit"
									className="w-full"
									style={{ 
										backgroundColor: colorTheme.primary,
									}}
									onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colorTheme.primaryHover}
									onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colorTheme.primary}
								>
									<Lock className="h-4 w-4 mr-2" />
									Verify Access
								</Button>
							</form>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
							<div className="flex items-center gap-2 text-green-700">
								<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
								<div className="flex flex-col">
									<span className="text-sm font-medium">Access Granted</span>
									{guestName && (
										<span className="text-xs text-green-600">as {guestName}</span>
									)}
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleLogout}
								className="text-gray-600 hover:text-gray-800"
							>
								Logout
							</Button>
						</div>
					{selectedFiles.length === 0 ? (
						<div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors" style={{
							borderColor: colorTheme.primaryDark,
						}} onMouseEnter={(e) => e.currentTarget.style.borderColor = colorTheme.primary} onMouseLeave={(e) => e.currentTarget.style.borderColor = colorTheme.primaryDark}>
							<label
								htmlFor="guest-photo-upload"
								className="cursor-pointer flex flex-col items-center gap-3"
							>
								<Upload className="h-10 w-10" style={{ color: colorTheme.primary }} />
								<div>
									<p className="text-gray-700 font-medium">
										Click to upload or drag and drop
									</p>
									<p className="text-sm text-gray-500 mt-1">
										JPG, PNG, GIF, WEBP up to {FILE_SIZE_LIMITS.VIDEO_MAX_SIZE / ONE_MB}MB (multiple files allowed)
									</p>
								</div>
							</label>
							<input
								id="guest-photo-upload"
								type="file"
								accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff"
								onChange={handleFileChange}
								className="hidden"
								multiple
							/>
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex items-center justify-between mb-2">
								<p className="text-sm text-gray-600">
									{selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''} selected
								</p>
								{selectedFiles.length > 0 && (
									<Button
										variant="ghost"
										size="sm"
										onClick={handleClearAll}
										className="text-gray-600 hover:text-gray-800 text-xs"
									>
										Clear All
									</Button>
								)}
							</div>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
								{selectedFiles.map((item, index) => (
									<div key={index} className="relative group">
										<div className="relative rounded-lg overflow-hidden border-2 aspect-square" style={{
											borderColor: colorTheme.border,
										}}>
											<img
												src={item.preview}
												alt={`Preview ${index + 1}`}
												className="w-full h-full object-cover bg-gray-100"
											/>
											<button
												onClick={() => handleRemoveFile(index)}
												className="absolute top-1 right-1 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md opacity-0 group-hover:opacity-100"
												type="button"
											>
												<X className="h-3 w-3 text-gray-700" />
											</button>
										</div>
										<p className="text-xs text-gray-500 mt-1 truncate" title={item.file.name}>
											{item.file.name}
										</p>
									</div>
								))}
							</div>

							<Button
								onClick={handleUpload}
								disabled={isUploading || selectedFiles.length === 0}
								className="w-full"
								style={{ 
									backgroundColor: colorTheme.primary,
								}}
								onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = colorTheme.primaryHover)}
								onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colorTheme.primary}
							>
								{isUploading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Uploading {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''}...
									</>
								) : (
									<>
										<Upload className="h-4 w-4 mr-2" />
										Upload {selectedFiles.length} Photo{selectedFiles.length !== 1 ? 's' : ''}
									</>
								)}
							</Button>
						</div>
					)}
					</div>
				)}
			</div>
		</div>
	);
};

export default GuestPhotoUpload;
