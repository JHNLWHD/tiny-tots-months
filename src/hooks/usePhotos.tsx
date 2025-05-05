
import { useAuth } from "@/context/AuthContext";
import { useFetchPhotos } from "./useFetchPhotos";
import { useUploadPhoto } from "./useUploadPhoto";
import { useDeletePhoto } from "./useDeletePhoto";
import { Photo, CreatePhotoData } from "@/types/photo";

// Re-export the Photo interface to maintain backward compatibility
export type { Photo, CreatePhotoData } from "@/types/photo";

export const usePhotos = (babyId?: string, monthNumber?: number) => {
  const { user } = useAuth();
  
  const { photos, isLoading, refetch } = useFetchPhotos(babyId, monthNumber);
  const { uploadPhoto, isUploading } = useUploadPhoto(babyId, monthNumber);
  const { deletePhoto, isDeleting } = useDeletePhoto(babyId, monthNumber);

  return {
    photos,
    isLoading,
    refetch,
    uploadPhoto,
    deletePhoto,
    isUploading,
    isDeleting,
  };
};
