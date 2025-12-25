import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useGuestPhotoAuth } from "@/context/GuestPhotoAuthContext";
import { Camera, Lock, Upload, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useGuestPhotoUpload } from "@/hooks/useGuestPhotoUpload";

const GuestPhotoUpload = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [inputPasscode, setInputPasscode] = useState("");
	const [inputName, setInputName] = useState("");
	const { isAuthenticated, guestName, verifyPasscode, logout } = useGuestPhotoAuth();
	const { uploadPhoto, isUploading } = useGuestPhotoUpload();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0];
			
			// Validate file type - only images allowed
			if (!file.type.startsWith("image/")) {
				toast("Invalid File Type", {
					description: "Please select an image file (JPG, PNG, GIF, etc.)",
					className: "bg-destructive text-destructive-foreground",
				});
				return;
			}

			// Validate image extensions
			const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif'];
			const fileExtension = file.name.split('.').pop()?.toLowerCase();
			if (!fileExtension || !validExtensions.includes(fileExtension)) {
				toast("Invalid File Type", {
					description: "Only image files are allowed (JPG, PNG, GIF, WEBP, BMP, TIFF)",
					className: "bg-destructive text-destructive-foreground",
				});
				return;
			}

			// Validate file size (max 50MB - Supabase limit)
			if (file.size > 50 * 1024 * 1024) {
				toast("File Too Large", {
					description: "File size must be less than 50MB",
					className: "bg-destructive text-destructive-foreground",
				});
				return;
			}

			setSelectedFile(file);

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
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
		if (!selectedFile) return;

		if (!guestName || !guestName.trim()) {
			toast("Name Required", {
				description: "Please enter your name in the authentication form.",
				className: "bg-destructive text-destructive-foreground",
			});
			return;
		}

		uploadPhoto({
			file: selectedFile,
			guest_name: guestName,
		});

		// Reset form
		setSelectedFile(null);
		setPreview(null);
	};

	const handleClear = () => {
		if (preview && preview.startsWith("blob:")) {
			URL.revokeObjectURL(preview);
		}
		setSelectedFile(null);
		setPreview(null);
	};

	const handleLogout = () => {
		logout();
		setSelectedFile(null);
		setPreview(null);
		if (preview && preview.startsWith("blob:")) {
			URL.revokeObjectURL(preview);
		}
	};

	return (
		<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative" style={{
			boxShadow: '0 20px 60px rgba(106, 59, 228, 0.15), 0 0 0 1px rgba(106, 59, 228, 0.05)',
		}}>
			<div className="p-6 md:p-8">
				<h3 className="text-xl font-semibold text-baby-purple mb-2 flex items-center justify-center gap-2 font-heading">
					<Camera className="h-5 w-5" />
					Share Your Photos
				</h3>
				<p className="text-gray-600 mb-6 text-center font-serif">
					Upload photos from the event to share with everyone!
				</p>

				{!isAuthenticated ? (
					<div className="space-y-4">
						<div className="bg-baby-purple/5 border-2 border-baby-purple/20 rounded-lg p-6">
							<div className="flex items-center gap-2 mb-4 text-baby-purple">
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
									className="w-full bg-baby-purple hover:bg-baby-purple/90"
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
					{!preview ? (
						<div className="border-2 border-dashed border-baby-purple/30 rounded-lg p-8 text-center hover:border-baby-purple/50 transition-colors">
							<label
								htmlFor="guest-photo-upload"
								className="cursor-pointer flex flex-col items-center gap-3"
							>
								<Upload className="h-10 w-10 text-baby-purple" />
								<div>
									<p className="text-gray-700 font-medium">
										Click to upload or drag and drop
									</p>
									<p className="text-sm text-gray-500 mt-1">
										JPG, PNG, GIF, WEBP up to 50MB
									</p>
								</div>
							</label>
							<input
								id="guest-photo-upload"
								type="file"
								accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff"
								onChange={handleFileChange}
								className="hidden"
							/>
						</div>
					) : (
						<div className="space-y-4">
							<div className="relative rounded-lg overflow-hidden border-2 border-baby-purple/20">
								<img
									src={preview}
									alt="Preview"
									className="w-full max-h-64 object-contain bg-gray-100"
								/>
								<button
									onClick={handleClear}
									className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
									type="button"
								>
									<X className="h-4 w-4 text-gray-700" />
								</button>
							</div>


							<Button
								onClick={handleUpload}
								disabled={isUploading}
								className="w-full bg-baby-purple hover:bg-baby-purple/90"
							>
								{isUploading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Uploading...
									</>
								) : (
									<>
										<Upload className="h-4 w-4 mr-2" />
										Upload Photo
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
