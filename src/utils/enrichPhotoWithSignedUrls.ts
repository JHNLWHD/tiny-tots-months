import { supabase } from "@/integrations/supabase/client";
import type { Photo } from "@/types/photo";

type PhotoRow = Photo & {
	is_favorite?: boolean | null;
};

/**
 * Adds a signed `url` for `storage_path`. Image resizing for display is handled
 * in `PhotoImage` via the `size` prop (`getTransformedUrl`).
 */
export async function enrichPhotoWithSignedUrls(
	photo: PhotoRow,
): Promise<Photo> {
	let url: string | undefined;

	try {
		const { data: signedUrlData, error: signedUrlError } = await supabase.storage
			.from("baby_images")
			.createSignedUrl(photo.storage_path, 3600);

		if (!signedUrlError && signedUrlData?.signedUrl) {
			url = signedUrlData.signedUrl;
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
): Promise<Photo[]> {
	return Promise.all(rows.map((p) => enrichPhotoWithSignedUrls(p)));
}
