import React, { useState, useEffect } from 'react';
import { convertHeicToWebFormat } from '@/utils/heicConverter';
import { toast } from "@/components/ui/sonner";

interface HeicImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  style?: React.CSSProperties;
}

const HeicImage: React.FC<HeicImageProps> = ({
  src,
  alt,
  className,
  loading = 'lazy',
  onError,
  onLoad,
  style,
}) => {
  const [displaySrc, setDisplaySrc] = useState<string>(src);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionFailed, setConversionFailed] = useState(false);

  useEffect(() => {
    const handleHeicConversion = async () => {
      // Check if the URL might be a HEIC/HEIF image
      const isLikelyHeic = src.toLowerCase().includes('.heic') || 
                          src.toLowerCase().includes('.heif') ||
                          src.includes('heic') || 
                          src.includes('heif');

      if (!isLikelyHeic) {
        setDisplaySrc(src);
        return;
      }

      try {
        setIsConverting(true);
        
        // Show toast for conversion start
        toast("Converting HEIC Image", {
          description: "Converting image for display...",
        });
        
        // Fetch the image data
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }

        const blob = await response.blob();
        
        // Try to convert if it's HEIC
        const convertedBlob = await convertHeicToWebFormat(new File([blob], 'image.heic', { type: blob.type }));
        
        if (convertedBlob) {
          const convertedUrl = URL.createObjectURL(convertedBlob);
          setDisplaySrc(convertedUrl);
          
          // Show success toast
          toast("HEIC Conversion Complete", {
            description: "Image converted successfully!",
          });
          
          // Clean up the object URL when component unmounts
          return () => URL.revokeObjectURL(convertedUrl);
        } else {
          // If conversion fails or not needed, use original
          setDisplaySrc(src);
        }
      } catch (error) {
        setConversionFailed(true);
        setDisplaySrc(src); // Fallback to original
        
        // Show error toast
        toast("HEIC Conversion Failed", {
          description: "Could not convert image. Showing original if possible.",
          className: "bg-destructive text-destructive-foreground",
        });
      } finally {
        setIsConverting(false);
      }
    };

    handleHeicConversion();
  }, [src]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If it was a converted image that failed, try the original
    if (displaySrc !== src && !conversionFailed) {
      setDisplaySrc(src);
      setConversionFailed(true);
      return;
    }
    
    // Call the parent's error handler
    if (onError) {
      onError(e);
    }
  };

  if (isConverting) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={style}
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
          <span className="text-xs">Converting...</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleImageError}
      onLoad={onLoad}
      style={style}
    />
  );
};

export default HeicImage; 