import React, { useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Download from "yet-another-react-lightbox/plugins/download";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { getFileExtension } from "@/components/photoUploader/validateFile";
import type { Photo } from "@/types/photo";

type PhotoLightboxProps = {
	photos: Photo[];
	open: boolean;
	index: number;
	onClose: () => void;
	babyName?: string;
	showCaptions?: boolean;
	showDownload?: boolean;
	showThumbnails?: boolean;
};

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
	photos,
	open,
	index,
	onClose,
	babyName = "baby",
	showCaptions = true,
	showDownload = true,
	showThumbnails = true,
}) => {
	// Helper function to extract file extension from storage_path or URL
	const getPhotoFileExtension = (photo: Photo): string => {
		const hasStoragePath = photo.storage_path !== undefined && photo.storage_path !== null && photo.storage_path !== '';
		if (hasStoragePath) {
			const ext = getFileExtension(photo.storage_path);
			const hasValidExtension = ext !== '';
			if (hasValidExtension) {
				return ext;
			}
		}

		const hasUrl = photo.url !== undefined && photo.url !== null && photo.url !== '';
		if (hasUrl) {
			const ext = getFileExtension(photo.url);
			const hasValidExtension = ext !== '';
			if (hasValidExtension) {
				return ext;
			}
		}

		return '';
	};

		const lightboxSlides = useMemo(() => {
		return photos.map(photo => {
			const monthDisplay = `Month ${photo.month_number}`;
			const monthForFilename = photo.month_number || 'unknown';
			const dateDisplay = new Date(photo.created_at).toLocaleDateString();
			const fileExtension = getPhotoFileExtension(photo);
			const filenameBase = `${babyName}-month-${monthForFilename}-${photo.id}`;
			const filename = fileExtension ? `${filenameBase}.${fileExtension}` : filenameBase;
			
			return {
				src: photo.url || '',
				alt: photo.description || `Photo from ${monthDisplay.toLowerCase()}`,
				title: photo.description || monthDisplay,
				description: photo.description 
					? `${photo.description}\n\n${monthDisplay} • ${dateDisplay}`
					: `${monthDisplay} • ${dateDisplay}`,
				download: {
					url: photo.url || '',
					filename: filename,
				},
			};
		});
	}, [photos, babyName]);

	const plugins = [];
	if (showCaptions) plugins.push(Captions);
	if (showDownload) plugins.push(Download);
	if (showThumbnails) plugins.push(Thumbnails);

	return (
		<Lightbox
			open={open}
			close={onClose}
			index={index}
			slides={lightboxSlides}
			plugins={plugins}
			captions={showCaptions ? {
				showToggle: true,
				descriptionTextAlign: "start",
			} : undefined}
			download={showDownload ? {
				download: async ({ slide }) => {
					const download = slide.download;
					if (!download || typeof download !== 'object' || !('url' in download)) return;
					
					try {
						const blob = await fetch(download.url).then(r => r.blob());
						const url = URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = url;
						link.download = download.filename || 'photo';
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						setTimeout(() => URL.revokeObjectURL(url), 100);
					} catch (error) {
						console.error('Download failed:', error);
					}
				},
			} : undefined}
			thumbnails={showThumbnails ? {
				position: "bottom",
				width: 120,
				height: 80,
				border: 2,
				borderRadius: 4,
				padding: 4,
				gap: 16,
			} : undefined}
			carousel={{
				finite: true,
				padding: 0,
				spacing: 0,
				imageFit: "contain",
			}}
			render={{
				buttonPrev: lightboxSlides.length <= 1 ? () => null : undefined,
				buttonNext: lightboxSlides.length <= 1 ? () => null : undefined,
			}}
		/>
	);
};

export default PhotoLightbox;
