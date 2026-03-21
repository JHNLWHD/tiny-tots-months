import { supabase } from "@/integrations/supabase/client";
import type { Photo } from "@/types/photo";
import { getTransformedUrl, isVideoUrl, type ImageSize } from "@/utils/supabaseImageTransform";

type PhotoRow = Photo & {
	is_favorite?: boolean | null;
};

/**
 * Adds signed `url` for the primary object; optional `imageSize` applies Supabase Storage image transforms for list/grid.
 */
export async function enrichPhotoWithSignedUrls(
	photo: PhotoRow,
	imageSize?: ImageSize,
): Promise<Photo> {
	let url: string | undefined;

	try {
		const { data: signedUrlData, error: signedUrlError } = await supabase.storage
			.from("baby_images")
			.createSignedUrl(photo.storage_path, 3600);

		if (!signedUrlError && signedUrlData?.signedUrl) {
			url = signedUrlData.signedUrl;
			if (url && imageSize && !isVideoUrl(photo.storage_path)) {
				url = getTransformedUrl(url, imageSize);
			}
		}
	} catch (err) {
		console.error("Failed to create signed URL for photo:", photo.id, err);
	}

	return {
		...photo,
		url,
		is_favorite: photo.is_favorite ?? false,
	} as Photo;
}

export async function enrichPhotosWithSignedUrls(
	rows: PhotoRow[],
	imageSize?: ImageSize,
): Promise<Photo[]> {
	return Promise.all(rows.map((p) => enrichPhotoWithSignedUrls(p, imageSize)));
}
