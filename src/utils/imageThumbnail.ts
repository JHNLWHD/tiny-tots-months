/**
 * Creates a thumbnail version of an image URL
 * For Supabase Storage, we can use query parameters or CSS to create thumbnails
 * Since Supabase doesn't have built-in image transformation, we'll use CSS-based thumbnails
 * and lazy loading for better performance
 */
export const createThumbnailUrl = (originalUrl: string | undefined): string | undefined => {
	if (!originalUrl) return undefined;
	
	// For now, return the original URL
	// The thumbnail effect will be achieved through CSS sizing
	// In the future, if Supabase adds image transformation, we can add query params here
	return originalUrl;
};

/**
 * Gets optimal thumbnail size based on container
 */
export const getThumbnailSize = (size: 'small' | 'medium' | 'large' = 'medium') => {
	const sizes = {
		small: { width: 150, height: 150 },
		medium: { width: 300, height: 300 },
		large: { width: 500, height: 500 },
	};
	return sizes[size];
};

