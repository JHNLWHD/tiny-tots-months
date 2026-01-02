/**
 * For free plan users, we can't use Supabase image transforms
 * Instead, we optimize loading through:
 * - CSS constraints (images display smaller)
 * - Lazy loading
 * - Progressive loading
 * - Proper loading attributes
 * 
 * Note: Client-side resizing still requires downloading full images,
 * so it doesn't help with initial load time. We'll use the original
 * URLs with optimized loading strategies instead.
 */

export type ThumbnailSize = "timeline" | "month-grid" | "single-month";

/**
 * Gets the appropriate thumbnail size for a card type
 * (For free plan - this is informational, actual resizing happens via CSS)
 */
export const getThumbnailSizeForCard = (
	cardType: "timeline" | "month-to-month",
	photoCount: number = 1,
): ThumbnailSize => {
	if (cardType === "timeline") {
		return "timeline";
	}

	// For month-to-month card
	if (photoCount === 1) {
		return "single-month";
	}
	return "month-grid";
};

/**
 * Generates a transformed image URL from a signed URL
 * For signed URLs, we need to extract the path and use getPublicUrl
 * @param signedUrl - The signed URL from Supabase
 * @param size - The thumbnail size preset to use
 * @param storagePath - The original storage path (if available)
 * @returns Transformed image URL
 */
export const getTransformedUrlFromSigned = (
	signedUrl: string,
	size: ThumbnailSize,
	storagePath?: string,
): string => {
	// If we have the storage path, use it directly
	if (storagePath) {
		return getTransformedImageUrl(storagePath, size);
	}

	// Otherwise, try to extract path from signed URL
	// Signed URLs format: https://[project].supabase.co/storage/v1/object/sign/baby_images/[path]?token=...
	const urlMatch = signedUrl.match(/\/baby_images\/(.+?)(\?|$)/);
	if (urlMatch && urlMatch[1]) {
		const path = decodeURIComponent(urlMatch[1]);
		return getTransformedImageUrl(path, size);
	}

	// Fallback: return original URL if we can't transform
	return signedUrl;
};

/**
 * Gets the appropriate thumbnail size for a card type
 */
export const getThumbnailSizeForCard = (
	cardType: "timeline" | "month-to-month",
	photoCount: number = 1,
): ThumbnailSize => {
	if (cardType === "timeline") {
		return "timeline";
	}

	// For month-to-month card
	if (photoCount === 1) {
		return "single-month";
	}
	return "month-grid";
};

