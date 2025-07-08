import heic2any from 'heic2any';

interface ConversionOptions {
  quality?: number; // 0-1, default 0.8
  format?: 'JPEG' | 'PNG'; // default JPEG
}

/**
 * Converts HEIC/HEIF images to web-compatible formats
 * @param file - The HEIC/HEIF file to convert
 * @param options - Conversion options
 * @returns Converted image as Blob, or null if conversion fails
 */
export const convertHeicToWebFormat = async (
  file: File, 
  options: ConversionOptions = {}
): Promise<Blob | null> => {
  const { quality = 0.8, format = 'JPEG' } = options;

  try {
    // Check if it's a HEIC/HEIF file
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
                   file.name.toLowerCase().endsWith('.heic') ||
                   file.name.toLowerCase().endsWith('.heif');

    if (!isHeic) {
      return null;
    }

    // Convert HEIC to JPEG/PNG using heic2any
    const convertedBlob = await heic2any({
      blob: file,
      toType: format === 'JPEG' ? 'image/jpeg' : 'image/png',
      quality: quality,
    });

    // heic2any can return an array of blobs, so we take the first one
    const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

    return resultBlob as Blob;
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    return null;
  }
};

/**
 * Creates a data URL from HEIC file for preview purposes
 * @param file - The HEIC/HEIF file
 * @param options - Conversion options
 * @returns Data URL string or null if conversion fails
 */
export const createHeicPreviewUrl = async (
  file: File,
  options: ConversionOptions = {}
): Promise<string | null> => {
  try {
    const convertedBlob = await convertHeicToWebFormat(file, options);
    
    if (!convertedBlob) {
      return null;
    }

    // Create object URL from blob
    return URL.createObjectURL(convertedBlob);
  } catch (error) {
    console.error('Failed to create HEIC preview URL:', error);
    return null;
  }
};

/**
 * Converts HEIC file to a File object with web-compatible format
 * @param file - The original HEIC/HEIF file
 * @param options - Conversion options
 * @returns New File object with converted data, or original file if conversion fails
 */
export const convertHeicToFile = async (
  file: File,
  options: ConversionOptions = {}
): Promise<File> => {
  try {
    const convertedBlob = await convertHeicToWebFormat(file, options);
    
    if (!convertedBlob) {
      return file;
    }

    // Create new filename with appropriate extension
    const { format = 'JPEG' } = options;
    const extension = format === 'JPEG' ? 'jpg' : 'png';
    const originalName = file.name.replace(/\.(heic|heif)$/i, '');
    const newFileName = `${originalName}_converted.${extension}`;

    // Create new File object
    const convertedFile = new File([convertedBlob], newFileName, {
      type: convertedBlob.type,
      lastModified: Date.now(),
    });

    return convertedFile;
  } catch (error) {
    console.error('Failed to convert HEIC to File:', error);
    return file;
  }
}; 