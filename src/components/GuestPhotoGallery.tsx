import PhotoLightbox from "@/components/PhotoLightbox";
import type { Photo } from "@/types/photo";
import { ImageIcon, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useGuestPhotoAuth } from "@/context/GuestPhotoAuthContext";
import type { GuestPhoto } from "@/hooks/useGuestPhotoUpload";
import { useGuestPhotoUpload } from "@/hooks/useGuestPhotoUpload";
import type { ColorTheme } from "./GuestPhotoUpload";

const defaultColorTheme: ColorTheme = {
	primary: "#6a3be4", // baby-purple
	primaryHover: "rgba(106, 59, 228, 0.9)",
	primaryLight: "rgba(106, 59, 228, 0.1)",
	primaryDark: "rgba(106, 59, 228, 0.2)",
	shadow: "rgba(106, 59, 228, 0.15)",
	border: "rgba(106, 59, 228, 0.2)",
	bg: "rgba(106, 59, 228, 0.05)",
};

type GuestPhotoGalleryProps = {
	eventId: string;
	storageBucket: string;
	eventName?: string;
	colorTheme?: ColorTheme;
};

const GuestPhotoGallery = ({ 
	eventId, 
	storageBucket, 
	eventName = "Event",
	colorTheme = defaultColorTheme 
}: GuestPhotoGalleryProps) => {
	const { isAuthenticated } = useGuestPhotoAuth();
	const { photos, isLoading } = useGuestPhotoUpload(eventId, storageBucket, isAuthenticated);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	// Convert GuestPhoto to Photo format for PhotoLightbox
	const convertToPhoto = (guestPhoto: GuestPhoto): Photo => {
		const dateDisplay = new Date(guestPhoto.created_at).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
		
		const description = guestPhoto.guest_name 
			? `📸 Photo by ${guestPhoto.guest_name}\n\n${dateDisplay}`
			: dateDisplay;

		return {
			id: guestPhoto.id,
			baby_id: guestPhoto.event_id,
			user_id: "guest",
			month_number: 0,
			storage_path: guestPhoto.storage_path,
			description: description,
			is_video: false,
			created_at: guestPhoto.created_at,
			updated_at: guestPhoto.created_at,
			url: guestPhoto.url,
		};
	};

	const photoList: Photo[] = photos.map(convertToPhoto);

	const handlePhotoClick = (index: number) => {
		setLightboxIndex(index);
		setLightboxOpen(true);
	};

	if (!isAuthenticated) {
		return (
			<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative" style={{
				boxShadow: `0 20px 60px ${colorTheme.shadow}, 0 0 0 1px ${colorTheme.shadow.replace('0.15', '0.05')}`,
			}}>
				<div className="p-6 md:p-8">
					<div className="text-center py-12">
						<Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-600 font-serif mb-2">Event photos are protected</p>
						<p className="text-sm text-gray-500">Please enter the passcode in the upload section to view photos.</p>
					</div>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative" style={{
				boxShadow: `0 20px 60px ${colorTheme.shadow}, 0 0 0 1px ${colorTheme.shadow.replace('0.15', '0.05')}`,
			}}>
				<div className="p-6 md:p-8">
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin" style={{ color: colorTheme.primary }} />
					</div>
				</div>
			</div>
		);
	}

	if (photos.length === 0) {
		return (
			<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative" style={{
				boxShadow: `0 20px 60px ${colorTheme.shadow}, 0 0 0 1px ${colorTheme.shadow.replace('0.15', '0.05')}`,
			}}>
				<div className="p-6 md:p-8">
					<div className="text-center py-12">
						<ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-600 font-serif">No photos yet. Be the first to share!</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative" style={{
			boxShadow: `0 20px 60px ${colorTheme.shadow}, 0 0 0 1px ${colorTheme.shadow.replace('0.15', '0.05')}`,
		}}>
			<div className="p-6 md:p-8">
				<h3 className="text-xl font-semibold mb-6 text-center font-heading" style={{ color: colorTheme.primary }}>
					Event Photos ({photos.length})
				</h3>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{photos.map((photo, index) => (
						<div
							key={photo.id}
							className="relative rounded-lg overflow-hidden border-2 transition-colors group cursor-pointer"
							style={{
								borderColor: colorTheme.border,
							}}
							onClick={() => handlePhotoClick(index)}
							onMouseEnter={(e) => e.currentTarget.style.borderColor = colorTheme.primary}
							onMouseLeave={(e) => e.currentTarget.style.borderColor = colorTheme.border}
						>
							<div className="relative aspect-square">
								{photo.url ? (
									<img
										src={photo.url}
										alt="Event photo"
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								) : (
									<div className="w-full h-full bg-gray-100 flex items-center justify-center">
										<ImageIcon className="h-8 w-8 text-gray-400" />
									</div>
								)}
								{/* Guest name overlay - always visible */}
								{photo.guest_name && (
									<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2">
										<p className="text-white text-xs font-medium text-center truncate">
											📸 {photo.guest_name}
										</p>
									</div>
								)}
							</div>
						</div>
					))}
				</div>

				{/* Photo Lightbox */}
				<PhotoLightbox
					photos={photoList}
					open={lightboxOpen}
					index={lightboxIndex}
					onClose={() => setLightboxOpen(false)}
					babyName={eventName}
					showCaptions={true}
					showDownload={true}
					showThumbnails={true}
				/>
			</div>
		</div>
	);
};

export default GuestPhotoGallery;

