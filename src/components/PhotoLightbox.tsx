import React, { useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Download from "yet-another-react-lightbox/plugins/download";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export type Photo = {
	id: string;
	url?: string;
	description?: string | null;
	is_video: boolean;
	month_number?: number;
	created_at: string;
	storage_path?: string;
};

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
	const lightboxSlides = useMemo(() => {
		return photos.map(photo => ({
			src: photo.url || '',
			alt: photo.description || `Photo from month ${photo.month_number}`,
			title: photo.description || `Month ${photo.month_number}`,
			description: photo.description 
				? `${photo.description}\n\nMonth ${photo.month_number} • ${new Date(photo.created_at).toLocaleDateString()}`
				: `Month ${photo.month_number} • ${new Date(photo.created_at).toLocaleDateString()}`,
			download: {
				url: photo.url || '',
				filename: `${babyName}-month-${photo.month_number}-${photo.id}.${photo.is_video ? 'mp4' : 'jpg'}`,
			},
		}));
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
					if (slide.download && typeof slide.download === 'object' && 'url' in slide.download) {
						const link = document.createElement('a');
						link.href = slide.download.url;
						link.download = slide.download.filename || 'photo';
						link.target = '_blank';
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
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
