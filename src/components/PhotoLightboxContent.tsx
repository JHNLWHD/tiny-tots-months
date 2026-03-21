import { getFileExtension } from "@/components/photoUploader/validateFile";
import type { Photo } from "@/types/photo";
import React, { useMemo } from "react";
import Lightbox, { type Slide } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Download from "yet-another-react-lightbox/plugins/download";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import PhotoImage from "./PhotoImage";

export type PhotoLightboxProps = {
	photos: Photo[];
	open: boolean;
	index: number;
	onClose: () => void;
	babyName?: string;
	showCaptions?: boolean;
	showDownload?: boolean;
	showThumbnails?: boolean;
};

type SlideWithPhoto = Slide & { __photo?: Photo };

function photoFromSlide(slide: Slide): Photo | undefined {
	return (slide as SlideWithPhoto).__photo;
}

const PhotoLightboxContent: React.FC<PhotoLightboxProps> = ({
	photos,
	open,
	index,
	onClose,
	babyName = "baby",
	showCaptions = true,
	showDownload = true,
	showThumbnails = true,
}) => {
	const getPhotoFileExtension = (photo: Photo): string => {
		const hasStoragePath =
			photo.storage_path !== undefined &&
			photo.storage_path !== null &&
			photo.storage_path !== "";
		if (hasStoragePath) {
			const ext = getFileExtension(photo.storage_path);
			const hasValidExtension = ext !== "";
			if (hasValidExtension) {
				return ext;
			}
		}

		const hasUrl =
			photo.url !== undefined && photo.url !== null && photo.url !== "";
		if (hasUrl) {
			const ext = getFileExtension(photo.url);
			const hasValidExtension = ext !== "";
			if (hasValidExtension) {
				return ext;
			}
		}

		return "";
	};

	const lightboxSlides = useMemo(() => {
		return photos.map((photo) => {
			const monthDisplay = `Month ${photo.month_number}`;
			const monthForFilename = photo.month_number || "unknown";
			const dateDisplay = new Date(photo.created_at).toLocaleDateString();
			const fileExtension = getPhotoFileExtension(photo);
			const filenameBase = `${babyName}-month-${monthForFilename}-${photo.id}`;
			const filename = fileExtension
				? `${filenameBase}.${fileExtension}`
				: filenameBase;

			return {
				src: photo.url || "",
				alt: photo.description || `Photo from ${monthDisplay.toLowerCase()}`,
				title: photo.description || monthDisplay,
				description: photo.description
					? `${photo.description}\n\n${monthDisplay} • ${dateDisplay}`
					: `${monthDisplay} • ${dateDisplay}`,
				download: {
					url: photo.url || "",
					filename: filename,
				},
				__photo: photo,
			} as Slide;
		});
	}, [photos, babyName]);

	const plugins = [];
	if (showCaptions) plugins.push(Captions);
	if (showDownload) plugins.push(Download);
	if (showThumbnails) plugins.push(Thumbnails);
	if (lightboxSlides.length > 1) plugins.push(Slideshow);

	const hideNav = lightboxSlides.length <= 1;

	return (
		<Lightbox
			open={open}
			close={onClose}
			index={index}
			slides={lightboxSlides}
			plugins={plugins}
			slideshow={
				lightboxSlides.length > 1
					? { autoplay: false, delay: 4000 }
					: undefined
			}
			captions={
				showCaptions
					? {
							showToggle: true,
							descriptionTextAlign: "start",
						}
					: undefined
			}
			download={
				showDownload
					? {
							download: async ({ slide }) => {
								const download = slide.download;
								if (
									!download ||
									typeof download !== "object" ||
									!("url" in download)
								)
									return;

								try {
									const blob = await fetch(download.url as string).then((r) =>
										r.blob(),
									);
									const url = URL.createObjectURL(blob);
									const link = document.createElement("a");
									link.href = url;
									link.download = download.filename || "photo";
									document.body.appendChild(link);
									link.click();
									document.body.removeChild(link);
									setTimeout(() => URL.revokeObjectURL(url), 100);
								} catch (error) {
									console.error("Download failed:", error);
								}
							},
						}
					: undefined
			}
			thumbnails={
				showThumbnails
					? {
							position: "bottom",
							width: 120,
							height: 80,
							border: 2,
							borderRadius: 4,
							padding: 4,
							gap: 16,
						}
					: undefined
			}
			carousel={{
				finite: true,
				padding: 0,
				spacing: 0,
				imageFit: "contain",
			}}
			render={{
				slide: ({ slide, rect }) => {
					const photo = photoFromSlide(slide);
					if (!photo?.url) return null;
					return (
						<div
							className="flex h-full w-full items-center justify-center"
							style={{ width: rect.width, height: rect.height }}
						>
							{photo.is_video ? (
								<video
									src={photo.url}
									controls
									className="max-h-full max-w-full object-contain"
									playsInline
								/>
							) : (
								<PhotoImage
									src={photo.url}
									alt={slide.alt || "Photo"}
									className="max-h-full max-w-full object-contain"
									loading="eager"
									size="full"
								/>
							)}
						</div>
					);
				},
				buttonPrev: hideNav ? () => null : undefined,
				buttonNext: hideNav ? () => null : undefined,
			}}
		/>
	);
};

export default PhotoLightboxContent;
