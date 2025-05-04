
import React from 'react';
import { Photo } from '@/hooks/usePhotos';
import { Card } from '@/components/ui/card';
import { Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PhotoCollageProps {
  photos: Photo[];
  title?: string;
  maxDisplayCount?: number;
}

const PhotoCollage: React.FC<PhotoCollageProps> = ({ 
  photos, 
  title,
  maxDisplayCount = 5 
}) => {
  const [selectedPhoto, setSelectedPhoto] = React.useState<Photo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Filter out photos with no URLs (failed to get signed URL)
  const validPhotos = photos.filter(p => p.url);
  
  // Limit the number of photos to display
  const displayPhotos = validPhotos.slice(0, maxDisplayCount);
  const remainingCount = validPhotos.length - maxDisplayCount;

  if (!validPhotos || validPhotos.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No photos available.</p>
      </div>
    );
  }

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-3">
        {title && <h3 className="font-medium text-lg">{title}</h3>}
        <div className="grid grid-cols-3 gap-2">
          {displayPhotos.map((photo, index) => (
            <Card 
              key={photo.id} 
              className={`overflow-hidden cursor-pointer ${
                index === 0 ? "col-span-2 row-span-2" : ""
              }`}
              onClick={() => handlePhotoClick(photo)}
            >
              <div className="aspect-square relative">
                {photo.is_video ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                ) : null}
                
                <img
                  src={photo.url || '/placeholder.svg'}
                  alt={photo.description || 'Baby photo'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const imgElement = e.currentTarget;
                    imgElement.onerror = null;
                    imgElement.src = "/placeholder.svg";
                  }}
                />
                
                {index === 4 && remainingCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-xl">
                    +{remainingCount} more
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger className="hidden">Open</DialogTrigger>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedPhoto && (
            <div className="relative">
              {selectedPhoto.is_video ? (
                <video 
                  controls 
                  className="w-full h-auto" 
                  src={selectedPhoto.url || ''} 
                />
              ) : (
                <img 
                  src={selectedPhoto.url || '/placeholder.svg'} 
                  alt={selectedPhoto.description || 'Baby photo'} 
                  className="w-full h-auto" 
                />
              )}
              
              {selectedPhoto.description && (
                <div className="p-4 bg-background">
                  <p className="text-foreground">{selectedPhoto.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoCollage;
