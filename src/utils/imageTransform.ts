/**
 * Image Transform Utilities
 * 
 * Uses Supabase Pro image transformations to serve optimized images.
 * Images are transformed on-the-fly based on the display context.
 */

import {
	type ImageSize,
	SIZE_PRESETS,
	getTransformedUrl,
	isVideoUrl,
} from './supabaseImageTransform';

// Re-export for convenience
export { type ImageSize, SIZE_PRESETS, getTransformedUrl, isVideoUrl };

export type ThumbnailSize = "timeline" | "month-grid" | "single-month";

/**
 * Maps card-specific sizes to standard ImageSize presets
 */
const CARD_SIZE_MAP: Record<ThumbnailSize, ImageSize> = {
	"timeline": "preview",      // 400px - timeline cards are medium-sized
	"month-grid": "thumbnail",  // 200px - grid items are small
	"single-month": "display",  // 800px - single month view is larger
};

/**
 * Gets the appropriate ImageSize preset for a card type
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
 * Gets the ImageSize preset for a ThumbnailSize
 */
export const getImageSizePreset = (thumbnailSize: ThumbnailSize): ImageSize => {
	return CARD_SIZE_MAP[thumbnailSize];
};

/**
 * Transforms a URL based on card type context
 */
export const getCardImageUrl = (
	url: string | undefined,
	cardType: "timeline" | "month-to-month",
	photoCount: number = 1,
): string | undefined => {
	if (!url) return undefined;
	if (isVideoUrl(url)) return url; // Don't transform videos
	
	const thumbnailSize = getThumbnailSizeForCard(cardType, photoCount);
	const imageSize = getImageSizePreset(thumbnailSize);
	return getTransformedUrl(url, imageSize);
};

