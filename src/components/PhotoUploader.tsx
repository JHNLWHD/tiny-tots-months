
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploaderProps {
  month: number;
  onUploadComplete: () => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ month, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
    // In a real app, this would upload to Supabase storage
    // For now, we'll just simulate the upload
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Success",
        description: "Photo uploaded successfully!",
      });
      
      clearSelection();
      onUploadComplete();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
                accept="image/*" 
                onChange={handleFileChange}
              />
            </Label>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={preview} 
              alt="Upload preview" 
              className="w-full h-auto rounded-lg object-cover max-h-[300px]" 
            />
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
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default PhotoUploader;
