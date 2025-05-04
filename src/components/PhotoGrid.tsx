
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

interface PhotoGridProps {
  photos: Photo[];
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos }) => {
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
        <div key={photo.id} className="rounded-xl overflow-hidden shadow-md bg-white">
          <AspectRatio ratio={4/3} className="bg-muted">
            <img 
              src={photo.url} 
              alt={photo.caption || 'Baby milestone photo'} 
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            />
          </AspectRatio>
          {photo.caption && (
            <div className="p-3">
              <p className="text-sm text-gray-600">{photo.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
