
import React, { useState } from 'react';
import { Upload, ArrowLeft, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { usePaymentProofUpload } from '@/hooks/usePaymentProofUpload';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// QR Code for payment
const PAYMENT_QR_URL = "https://placehold.co/400x400/png?text=GCash+QR+Code";

export const PaymentForm: React.FC = () => {
  const { user } = useAuth();
  const { requestPremiumUpgrade, isProcessing } = useSubscription();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const { 
    uploadPaymentProof, 
    isUploading, 
    progress, 
    resetUploadState 
  } = usePaymentProofUpload();

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
    resetUploadState();
  };

  const handleUpgrade = async () => {
    try {
      if (!user) {
        toast.error("You must be logged in to upgrade");
        return;
      }
      
      if (!selectedFile) {
        toast.error("Please upload your payment receipt");
        return;
      }
      
      console.log("Starting upgrade process for user:", user.id);
      
      // Upload the payment proof using our dedicated function
      await uploadPaymentProof(selectedFile, {
        description: "Payment proof for premium upgrade",
        onSuccess: (path) => {
          console.log("Payment proof uploaded successfully:", path);
          // Request premium upgrade with the storage path
          requestPremiumUpgrade(path);
          clearSelection();
        },
        onError: (error) => {
          console.error("Failed to upload payment proof:", error);
          toast.error("Failed to upload payment receipt. Please try again.");
        }
      });
      
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error("There was a problem processing your upgrade request");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
        <h4 className="text-md font-medium mb-2 flex items-center">
          <Info size={16} className="mr-2 text-baby-purple" />
          Scan QR to Pay
        </h4>
        <img 
          src={PAYMENT_QR_URL} 
          alt="Payment QR Code" 
          className="w-48 h-48 mb-2"
        />
        <p className="text-sm text-center text-gray-500">
          Send ₱1,000 to this account via GCash
        </p>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="receipt-upload">Upload Payment Receipt</Label>
        
        {!preview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer" onClick={() => document.getElementById('receipt-upload')?.click()}>
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload receipt</span>
              <Input
                id="receipt-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Receipt preview"
              className="w-full h-auto rounded-lg object-cover max-h-[200px]"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full"
              onClick={clearSelection}
            >
              <ArrowLeft size={16} />
            </Button>
          </div>
        )}
        
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Uploading receipt...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <Button 
          className="w-full bg-baby-purple hover:bg-baby-purple/90" 
          onClick={handleUpgrade}
          disabled={isProcessing || isUploading || !selectedFile}
        >
          {isProcessing || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? "Uploading Receipt..." : "Processing Request..."}
            </>
          ) : "Submit Payment Proof"}
        </Button>
      </div>
    </div>
  );
};
