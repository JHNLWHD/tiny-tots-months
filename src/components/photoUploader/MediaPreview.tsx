
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MediaPreviewProps {
  preview: string;
  isVideo: boolean;
  onClear: () => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ 
  preview, 
  isVideo, 
  onClear 
}) => {
  return (
    <div className="relative">
      {isVideo ? (
        <video 
          src={preview} 
          className="w-full h-auto rounded-lg object-cover max-h-[300px]"
          controls
        />
      ) : (
        <img 
          src={preview} 
          alt="Upload preview" 
          className="w-full h-auto rounded-lg object-cover max-h-[300px]" 
        />
      )}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 rounded-full"
        onClick={onClear}
      >
        <X size={16} />
      </Button>
      
      {isVideo && (
        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
          Video Preview
        </div>
      )}
    </div>
  );
};

export default MediaPreview;
