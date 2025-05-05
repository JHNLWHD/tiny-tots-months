import React, { useState } from 'react';
import { Upload, ArrowLeft, Loader2, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { usePaymentProofUpload } from '@/hooks/usePaymentProofUpload';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/context/AuthContext';
import { trackEvent } from '@/lib/analytics';
import { toast } from 'sonner';

// QR Code for payment
const PAYMENT_QR_URL = "/gcash-tiny-tots.jpg";

export const PaymentForm: React.FC = () => {
  const { user } = useAuth();
  const { requestPremiumUpgrade, isProcessing } = useSubscription();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    uploadPaymentProof, 
    isUploading, 
    progress, 
    error: uploadError,
    resetUploadState 
  } = usePaymentProofUpload();

  // Show component error if there's an upload error
  React.useEffect(() => {
    if (uploadError) {
      setError(uploadError.message);
    } else {
      setError(null);
    }
  }, [uploadError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setError(null);
      const file = e.target.files[0];
      
      // Basic validation
      if (file.size > 10 * 1024 * 1024) {
        setError("File is too large. Maximum size is 10MB.");
        
        // Track error event
        trackEvent('payment_proof_error', {
          error_type: 'file_too_large',
          file_size: file.size
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Track file selected event
      trackEvent('payment_proof_selected', {
        file_type: file.type,
        file_size: file.size
      });
      
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
    setError(null);
    resetUploadState();
  };

  const handleUpgrade = async () => {
    try {
      setError(null);
      
      if (!user) {
        setError("You must be logged in to upgrade");
        toast.error("You must be logged in to upgrade");
        
        // Track error event
        trackEvent('upgrade_error', { error_type: 'not_logged_in' });
        return;
      }
      
      if (!selectedFile) {
        setError("Please upload your payment receipt");
        toast.error("Please upload your payment receipt");
        
        // Track error event
        trackEvent('upgrade_error', { error_type: 'no_file_selected' });
        return;
      }
      
      console.log("Starting upgrade process for user:", user.id);
      
      // Track upgrade attempt
      trackEvent('upgrade_initiated', { user_id: user.id });
      
      // Upload the payment proof using our dedicated function
      await uploadPaymentProof(selectedFile, {
        description: "Payment proof for premium upgrade",
        onSuccess: (path) => {
          console.log("Payment proof uploaded successfully:", path);
          // Request premium upgrade with the storage path
          requestPremiumUpgrade(path);
          clearSelection();
          toast.success("Payment proof uploaded! Your upgrade request is being processed.");
          
          // Track successful upload
          trackEvent('payment_proof_uploaded', { 
            success: true,
            storage_path: path
          });
        },
        onError: (error) => {
          console.error("Failed to upload payment proof:", error);
          setError(`Failed to upload: ${error.message || 'Unknown error'}`);
          toast.error("Failed to upload payment receipt. Please try again.");
          
          // Track upload error
          trackEvent('payment_proof_error', {
            error_type: 'upload_failed',
            error_message: error.message || 'Unknown error'
          });
        }
      });
      
    } catch (error: any) {
      console.error('Upgrade error:', error);
      setError(error?.message || "There was a problem processing your upgrade request");
      toast.error("There was a problem processing your upgrade request");
      
      // Track general error
      trackEvent('upgrade_error', {
        error_type: 'general_error',
        error_message: error?.message || 'Unknown error'
      });
    }
  };

  // Determine if we're in a loading state
  const isLoading = isProcessing || isUploading;

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
        <h4 className="text-md font-medium mb-2 flex items-center">
          <Info size={16} className="mr-2 text-baby-purple" />
          Scan QR to Pay
        </h4>
        {isLoading ? (
          <Skeleton className="w-48 h-48 mb-2" />
        ) : (
          <img 
            src={PAYMENT_QR_URL} 
            alt="Payment QR Code" 
            className="w-48 h-96 mb-2"
          />
        )}
        <p className="text-sm text-center text-gray-500">
          Send ₱500 to this account via GCash
        </p>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="receipt-upload">
          Upload Payment Receipt
          {isLoading && <span className="ml-2 text-muted-foreground">(Processing...)</span>}
        </Label>
        
        {!preview ? (
          <div 
            className={`border-2 border-dashed ${error ? 'border-destructive' : 'border-gray-300'} rounded-lg p-6 text-center cursor-pointer transition-colors ${isLoading ? 'opacity-50 pointer-events-none' : 'hover:border-baby-purple hover:bg-gray-50'}`} 
            onClick={() => !isLoading && document.getElementById('receipt-upload')?.click()}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              {isLoading ? (
                <Loader2 className="h-8 w-8 text-baby-purple animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
              <span className="text-sm text-gray-500">
                {isLoading ? "Processing..." : "Click to upload receipt"}
              </span>
              <Input
                id="receipt-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>
          </div>
        ) : (
          <div className="relative border border-gray-200 rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-baby-purple animate-spin" />
              </div>
            )}
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
              disabled={isLoading}
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
          className="w-full bg-baby-purple hover:bg-baby-purple/90 transition-all" 
          onClick={handleUpgrade}
          disabled={isLoading || !selectedFile}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? "Uploading Receipt..." : isProcessing ? "Processing Request..." : "Please wait..."}
            </>
          ) : "Submit Payment Proof"}
        </Button>
        
        {isLoading && (
          <p className="text-xs text-center text-muted-foreground animate-pulse">
            Please don't close this page while we process your payment
          </p>
        )}
      </div>
    </div>
  );
};
