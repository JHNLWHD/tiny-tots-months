/**
 * Supabase Image Transformation Utilities
 * 
 * Supabase Pro supports on-the-fly image transformations via URL parameters.
 * This reduces bandwidth by serving appropriately-sized images.
 * 
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 */

export type ImageSize = 'thumbnail' | 'preview' | 'display' | 'full';

export type TransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
  format?: 'origin' | 'avif' | 'webp';
};

/**
 * Size presets for different contexts
 */
export const SIZE_PRESETS: Record<ImageSize, TransformOptions> = {
  thumbnail: { width: 200, quality: 60, resize: 'cover' },
  preview: { width: 400, quality: 70, resize: 'cover' },
  display: { width: 800, quality: 80, resize: 'cover' },
  full: { width: 1600, quality: 85 },
};

/**
 * Transform a Supabase signed URL to request an optimized image
 * 
 * Supabase image transformations work by modifying the URL path:
 * - Original: /storage/v1/object/sign/bucket/path?token=xxx
 * - Transformed: /storage/v1/render/image/sign/bucket/path?token=xxx&width=400
 * 
 * @param signedUrl - The original signed URL from Supabase
 * @param options - Transform options (width, height, quality, resize, format)
 * @returns The transformed URL, or original if transformation not applicable
 */
export const getTransformedUrl = (
  signedUrl: string,
  options: TransformOptions | ImageSize
): string => {
  if (!signedUrl) return signedUrl;

  // Resolve preset if string is passed
  const transformOptions: TransformOptions =
    typeof options === 'string' ? SIZE_PRESETS[options] : options;

  // Skip if no transform options
  if (!transformOptions.width && !transformOptions.height) {
    return signedUrl;
  }

  try {
    const url = new URL(signedUrl);

    // Check if this is a Supabase storage URL
    if (!url.pathname.includes('/storage/v1/')) {
      return signedUrl;
    }

    // Transform the path: replace /object/ with /render/image/
    // Original: /storage/v1/object/sign/bucket/path
    // Transformed: /storage/v1/render/image/sign/bucket/path
    url.pathname = url.pathname.replace(
      '/storage/v1/object/',
      '/storage/v1/render/image/'
    );

    // Add transform parameters
    if (transformOptions.width) {
      url.searchParams.set('width', transformOptions.width.toString());
    }
    if (transformOptions.height) {
      url.searchParams.set('height', transformOptions.height.toString());
    }
    if (transformOptions.quality) {
      url.searchParams.set('quality', transformOptions.quality.toString());
    }
    if (transformOptions.resize) {
      url.searchParams.set('resize', transformOptions.resize);
    }
    if (transformOptions.format) {
      url.searchParams.set('format', transformOptions.format);
    }

    return url.toString();
  } catch (error) {
    // If URL parsing fails, return original
    console.warn('[supabaseImageTransform] Failed to transform URL:', error);
    return signedUrl;
  }
};

/**
 * Get transformed URL using a size preset
 */
export const getPresetUrl = (
  signedUrl: string,
  size: ImageSize
): string => {
  return getTransformedUrl(signedUrl, SIZE_PRESETS[size]);
};

/**
 * Check if a URL is a video (videos don't support image transforms)
 */
export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.m4v', '.qt'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.includes(ext));
};

/**
 * Get appropriate size based on container dimensions
 */
export const getSizeForDimensions = (
  containerWidth: number
): ImageSize => {
  if (containerWidth <= 150) return 'thumbnail';
  if (containerWidth <= 300) return 'preview';
  if (containerWidth <= 600) return 'display';
  return 'full';
};
