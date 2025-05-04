
import React from 'react';
import { Photo } from '@/hooks/usePhotos';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PhotoGridProps {
  photos: Photo[];
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onDelete, readOnly = false }) => {
  const [selectedPhoto, setSelectedPhoto] = React.useState<Photo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No photos uploaded yet.</p>
      </div>
    );
  }

  const getPhotoUrl = (path: string) => {
    // Use the public URL from Supabase storage
    return `https://htxczdhdospkxjesvztw.supabase.co/storage/v1/object/public/baby_images/${path}`;
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card 
            key={photo.id} 
            className="overflow-hidden group relative cursor-pointer"
            onClick={() => handlePhotoClick(photo)}
          >
            <div className="aspect-square relative">
              {photo.is_video ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="h-8 w-8 text-white" />
                </div>
              ) : null}
              
              <img
                src={getPhotoUrl(photo.storage_path)}
                alt={photo.description || 'Baby photo'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {photo.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-xs truncate">
                  {photo.description}
                </div>
              )}
              
              {!readOnly && onDelete && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(photo.id);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </Card>
        ))}
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
                  src={getPhotoUrl(selectedPhoto.storage_path)}
                />
              ) : (
                <img 
                  src={getPhotoUrl(selectedPhoto.storage_path)} 
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

export default PhotoGrid;
