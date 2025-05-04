
import React from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PhotoUploader from "@/components/PhotoUploader";
import PhotoGrid from "@/components/PhotoGrid";
import PhotoCollage from "@/components/PhotoCollage";
import { Photo } from "@/hooks/usePhotos";

type SortOption = "newest" | "oldest" | "description";
type ViewMode = "grid" | "collage";

interface PhotoSectionProps {
  babyId: string;
  monthNumber: number;
  photos: Photo[];
  isUploading: boolean;
  uploadPhoto: (data: any) => void;
  deletePhoto: (photo: Photo) => void;
  refetchPhotos: () => void;
  isLoading: boolean;
}

const PhotoSection: React.FC<PhotoSectionProps> = ({
  babyId,
  monthNumber,
  photos,
  isUploading,
  uploadPhoto,
  deletePhoto,
  refetchPhotos,
  isLoading
}) => {
  const [sortOption, setSortOption] = React.useState<SortOption>("newest");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  
  // Sort photos based on selected option
  const sortedPhotos = [...photos].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "description":
        return ((a.description || '') > (b.description || '')) ? 1 : -1;
      default:
        return 0;
    }
  });

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
  };
  
  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
  };

  // Handle photo deletion with proper type conversion
  const handleDeletePhoto = (id: string) => {
    const photoToDelete = photos.find(photo => photo.id === id);
    if (photoToDelete) {
      deletePhoto(photoToDelete);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PhotoUploader
        babyId={babyId}
        month={monthNumber}
        onUploadComplete={refetchPhotos}
        onUpload={uploadPhoto}
        isUploading={isUploading}
      />
      
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <h2 className="text-xl font-semibold">Photos</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="view-mode" className="whitespace-nowrap">View:</Label>
              <Select value={viewMode} onValueChange={handleViewModeChange}>
                <SelectTrigger id="view-mode" className="w-[120px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="collage">Collage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-by" className="whitespace-nowrap">Sort by:</Label>
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger id="sort-by" className="w-[120px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {viewMode === "grid" ? (
          <PhotoGrid 
            photos={sortedPhotos} 
            onDelete={handleDeletePhoto}
          />
        ) : (
          <PhotoCollage 
            photos={sortedPhotos} 
            maxDisplayCount={sortedPhotos.length}
          />
        )}
      </div>
    </div>
  );
};

export default PhotoSection;
