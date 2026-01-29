import Compressor from 'compressorjs';
import { convertHeicToWebFormat } from './heicConverter';

export type CompressOptions = {
  maxWidth?: number;      // Default: 1600
  maxHeight?: number;     // Default: 1600
  quality?: number;       // Default: 0.75 (75%)
  convertToWebP?: boolean; // Default: true
};

// Default compression settings (balanced profile)
const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.75,
  convertToWebP: true,
};

/**
 * Check if the browser supports WebP encoding
 */
const supportsWebP = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
};

/**
 * Check if file is a HEIC/HEIF image
 */
const isHeicFile = (file: File): boolean => {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
};

/**
 * Compress an image file using compressorjs
 * 
 * - Automatically handles EXIF orientation
 * - Resizes to max dimensions while preserving aspect ratio
 * - Converts to WebP when supported (falls back to JPEG)
 * - For HEIC files, converts to JPEG first then compresses
 * 
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise resolving to the compressed File
 */
export const compressImage = async (
  file: File,
  options?: CompressOptions
): Promise<File> => {
  // Skip non-image files (e.g., videos)
  if (!file.type.startsWith('image/') && !isHeicFile(file)) {
    return file;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Handle HEIC files: convert first, then compress
  let fileToCompress = file;
  if (isHeicFile(file)) {
    const convertedBlob = await convertHeicToWebFormat(file, {
      quality: 0.9, // High quality for intermediate step
      format: 'JPEG',
    });
    
    if (convertedBlob) {
      // Create a new File from the converted blob
      const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      fileToCompress = new File([convertedBlob], newName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
    } else {
      // HEIC conversion failed, return original
      console.warn('HEIC conversion failed, uploading original file');
      return file;
    }
  }

  // Determine output MIME type
  const useWebP = opts.convertToWebP && supportsWebP();
  const mimeType = useWebP ? 'image/webp' : 'image/jpeg';

  return new Promise((resolve, reject) => {
    new Compressor(fileToCompress, {
      maxWidth: opts.maxWidth,
      maxHeight: opts.maxHeight,
      quality: opts.quality,
      mimeType: mimeType,
      convertSize: 100000, // Convert PNGs > 100KB to target format
      convertTypes: ['image/png', 'image/bmp', 'image/tiff'],
      success: (result) => {
        // Determine new file extension based on output type
        const ext = useWebP ? 'webp' : 'jpg';
        const baseName = file.name.replace(/\.[^.]+$/, '');
        const newName = `${baseName}.${ext}`;
        
        const compressedFile = new File([result], newName, {
          type: result.type,
          lastModified: Date.now(),
        });

        // Log compression stats in development
        if (import.meta.env.DEV) {
          const originalSize = file.size;
          const compressedSize = compressedFile.size;
          const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
          console.log(
            `[ImageCompressor] ${file.name}: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${savings}% saved)`
          );
        }

        resolve(compressedFile);
      },
      error: (err) => {
        console.error('[ImageCompressor] Compression failed:', err);
        // On error, return original file rather than failing
        resolve(file);
      },
    });
  });
};

/**
 * Compress multiple images in parallel
 */
export const compressImages = async (
  files: File[],
  options?: CompressOptions
): Promise<File[]> => {
  return Promise.all(files.map((file) => compressImage(file, options)));
};

/**
 * Format bytes to human-readable string
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
