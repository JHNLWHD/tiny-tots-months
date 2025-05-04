
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Photo } from '@/hooks/usePhotos';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoGridProps {
  photos: Photo[];
  onDelete?: (photo: Photo) => void;
  readonly?: boolean;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onDelete, readonly = false }) => {
  if (photos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No photos uploaded yet.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="rounded-xl overflow-hidden shadow-md bg-white group relative">
          <AspectRatio ratio={4/3} className="bg-muted">
            {photo.is_video ? (
              <video
                src={photo.url}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={photo.url} 
                alt={photo.description || 'Baby milestone photo'} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              />
            )}
          </AspectRatio>
          {photo.description && (
            <div className="p-3">
              <p className="text-sm text-gray-600">{photo.description}</p>
            </div>
          )}
          
          {!readonly && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(photo)}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
