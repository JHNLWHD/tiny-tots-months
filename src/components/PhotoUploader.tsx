
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Check, X, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { CreatePhotoData } from '@/hooks/usePhotos';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast("File too large", {
          description: "Maximum file size is 50MB",
          className: "bg-destructive text-destructive-foreground",
        });
        return;
      }
      
      // Validate file type
      const acceptedTypes = [
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'image/webp', 
        'video/mp4', 
        'video/quicktime'
      ];
      
      if (!acceptedTypes.includes(file.type)) {
        toast("Invalid file type", {
          description: "Please upload a JPG, PNG, GIF, WebP, MP4 or QuickTime file",
          className: "bg-destructive text-destructive-foreground",
        });
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
        description: "Please select an image to upload",
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
      <h3 className="text-lg font-medium mb-4">Upload New Photo for Month {month}</h3>
      
      <div className="space-y-4">
        {!preview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center space-y-2">
                <ImagePlus className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">Click to select an image</span>
              </div>
              <Input 
                id="photo-upload" 
                type="file" 
                className="hidden" 
                accept="image/*,video/mp4,video/quicktime" 
                onChange={handleFileChange}
              />
            </Label>
          </div>
        ) : (
          <div className="relative">
            {selectedFile?.type.startsWith('video/') ? (
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
              onClick={clearSelection}
            >
              <X size={16} />
            </Button>
          </div>
        )}
        
        {selectedFile && (
          <>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Textarea
                id="caption"
                placeholder="Add a caption for this photo..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleUpload} 
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : 'Upload Photo'}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default PhotoUploader;
