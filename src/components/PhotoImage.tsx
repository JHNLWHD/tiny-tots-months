import { convertHeicToWebFormat } from "@/utils/heicConverter";
import { toast } from "@/components/ui/sonner";
import {
	getTransformedUrl,
	isVideoUrl,
	type ImageSize,
} from "@/utils/supabaseImageTransform";
import React, { useEffect, useRef, useState } from "react";

export type PhotoImageProps = {
	src: string;
	alt: string;
	className?: string;
	loading?: "lazy" | "eager";
	onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
	onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
	style?: React.CSSProperties;
	/** Supabase Storage image transform preset (optional) */
	size?: ImageSize;
};

/** HEIC URLs often don’t include a clean “.heic” path; check a few signals. */
function urlLooksLikeHeic(url: string): boolean {
	const lower = url.toLowerCase();
	return (
		lower.includes(".heic") ||
		lower.includes(".heif") ||
		url.includes("heic") ||
		url.includes("heif")
	);
}

function revokeBlobRef(ref: React.MutableRefObject<string | null>) {
	if (ref.current) {
		URL.revokeObjectURL(ref.current);
		ref.current = null;
	}
}

const PhotoImage: React.FC<PhotoImageProps> = ({
	src,
	alt,
	className,
	loading = "lazy",
	onError,
	onLoad,
	style,
	size,
}) => {
	const transformedSrc =
		src && size && !isVideoUrl(src) ? getTransformedUrl(src, size) : src;

	const [heicObjectUrl, setHeicObjectUrl] = useState<string | null>(null);
	const [isConverting, setIsConverting] = useState(false);
	const [conversionFailed, setConversionFailed] = useState(false);
	const heicBlobRef = useRef<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		// New URL → drop previous conversion state and revoke old blob.
		setHeicObjectUrl(null);
		setConversionFailed(false);
		revokeBlobRef(heicBlobRef);

		// JPEG/WebP/etc.: <img> uses transformedSrc; nothing async to do.
		if (!transformedSrc || !urlLooksLikeHeic(transformedSrc)) {
			setIsConverting(false);
			return;
		}

		async function fetchConvertAndSetHeicPreview() {
			try {
				setIsConverting(true);
				toast("Converting HEIC Image", {
					description: "Converting image for display...",
				});

				const response = await fetch(transformedSrc);
				if (!response.ok) {
					throw new Error("Failed to fetch image");
				}

				const blob = await response.blob();
				const convertedBlob = await convertHeicToWebFormat(
					new File([blob], "image.heic", { type: blob.type }),
				);

				if (cancelled) return;

				if (convertedBlob) {
					const objectUrl = URL.createObjectURL(convertedBlob);
					heicBlobRef.current = objectUrl;
					setHeicObjectUrl(objectUrl);
					toast("HEIC Conversion Complete", {
						description: "Image converted successfully!",
					});
				}
			} catch {
				if (!cancelled) {
					setConversionFailed(true);
					toast("HEIC Conversion Failed", {
						description:
							"Could not convert image. Showing original if possible.",
						className: "bg-destructive text-destructive-foreground",
					});
				}
			} finally {
				if (!cancelled) {
					setIsConverting(false);
				}
			}
		}

		void fetchConvertAndSetHeicPreview();

		return () => {
			cancelled = true;
			revokeBlobRef(heicBlobRef);
		};
	}, [transformedSrc]);

	const imgSrc = heicObjectUrl ?? transformedSrc;

	const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		if (heicObjectUrl && !conversionFailed) {
			if (heicBlobRef.current === heicObjectUrl) {
				revokeBlobRef(heicBlobRef);
			}
			setHeicObjectUrl(null);
			setConversionFailed(true);
			return;
		}
		onError?.(e);
	};

	if (isConverting) {
		return (
			<div
				className={`flex items-center justify-center bg-gray-100 ${className}`}
				style={style}
			>
				<div className="flex flex-col items-center gap-2 text-gray-500">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
					<span className="text-xs">Converting...</span>
				</div>
			</div>
		);
	}

	return (
		<img
			src={imgSrc}
			alt={alt}
			className={className}
			loading={loading}
			onError={handleImageError}
			onLoad={onLoad}
			style={style}
		/>
	);
};

export default PhotoImage;
