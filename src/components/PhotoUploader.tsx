
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { CreatePhotoData } from '@/hooks/usePhotos';
import { useSubscription } from '@/hooks/useSubscription';
import FileSelector from './photoUploader/FileSelector';
import MediaPreview from './photoUploader/MediaPreview';
import CaptionForm from './photoUploader/CaptionForm';
import { validateFile } from './photoUploader/validateFile';

interface PhotoUploaderProps {
  babyId: string;
  month: number;
  onUploadComplete: () => void;
  onUpload: (data: CreatePhotoData) => void;
  isUploading: boolean;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
  babyId, 
  month, 
  onUploadComplete,
  onUpload,
  isUploading
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const { isPremium } = useSubscription();
  
  const isVideo = selectedFile?.type.startsWith('video/');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const validation = validateFile(file, isPremium);
      if (!validation.isValid) {
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
  };

  const handleUpload = async () => {
    if (!selectedFile || !babyId) {
      toast("No file selected", {
        description: "Please select an image or video to upload",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    try {
      await onUpload({
        file: selectedFile,
        baby_id: babyId,
        month_number: month,
        description: caption || undefined
      });
      
      clearSelection();
      onUploadComplete();
    } catch (error) {
      console.error("Upload error:", error);
      // Error handling is now done in the hook
    }
  };

  return (
    <Card className="p-6 bg-white/90 rounded-xl">
      <h3 className="text-lg font-medium mb-4">
        Upload New {isPremium ? "Photo or Video" : "Photo"} for Month {month}
      </h3>
      
      <div className="space-y-4">
        {!preview ? (
          <FileSelector 
            isPremium={isPremium}
            onFileChange={handleFileChange}
          />
        ) : (
          <MediaPreview 
            preview={preview} 
            isVideo={Boolean(isVideo)} 
            onClear={clearSelection}
          />
        )}
        
        {selectedFile && (
          <CaptionForm 
            caption={caption}
            onCaptionChange={setCaption}
            onUpload={handleUpload}
            isVideo={Boolean(isVideo)}
            isUploading={isUploading}
          />
        )}
      </div>
    </Card>
  );
};

export default PhotoUploader;
