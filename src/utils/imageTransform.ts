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

