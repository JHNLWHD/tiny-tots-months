import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Loader2, Info, Upload, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { usePaymentProofUpload } from '@/hooks/usePaymentProofUpload';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

// QR Code for payment
const PAYMENT_QR_URL = "https://placehold.co/400x400/png?text=GCash+QR+Code";

const Upgrade = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, isPending, requestPremiumUpgrade, isProcessing, subscription, loading } = useSubscription();
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
      
      // Upload the payment proof using our new dedicated function
      const storagePath = await uploadPaymentProof(selectedFile, {
        description: "Payment proof for premium upgrade",
        onSuccess: (path) => {
          console.log("Payment proof uploaded successfully:", path);
          // Request premium upgrade with the storage path
          requestPremiumUpgrade(path);
          clearSelection();
        }
      });
      
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error("There was a problem processing your upgrade request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-8 flex items-center gap-2"
          onClick={() => navigate('/app')}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold text-center mb-8">Upgrade to Premium</h1>

        <div className="max-w-4xl mx-auto">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-pulse text-baby-purple">Loading subscription status...</div>
            </Card>
          ) : isPremium ? (
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">You're already on Premium!</h2>
              <p className="text-gray-600 mb-6">
                You already have access to all our premium features. Enjoy tracking your baby's milestones without limitations.
              </p>
              <Button onClick={() => navigate('/app')}>
                Go to Dashboard
              </Button>
            </Card>
          ) : isPending ? (
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <Clock className="h-16 w-16 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Your Premium Request is Pending</h2>
              <p className="text-gray-600 mb-6">
                We've received your payment proof and are currently processing your request. Your premium features will be activated within 24 hours.
              </p>
              <Button onClick={() => navigate('/app')}>
                Go to Dashboard
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <Card className="p-6 border-gray-200 bg-white">
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-xl font-bold">Current: Free Plan</h3>
                  <p className="text-2xl font-bold mt-2">₱0</p>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>1 baby profile</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Track milestones up to 3 months</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>5 photos per month (15 total)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Unique shareable links</span>
                  </li>
                </ul>
              </Card>
              
              {/* Premium Plan with QR Payment */}
              <Card className="p-6 border-2 border-baby-purple bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-baby-purple text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                  RECOMMENDED
                </div>
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-xl font-bold">Premium Plan</h3>
                  <p className="text-2xl font-bold mt-2">₱1,000</p>
                  <p className="text-sm text-gray-500">one-time payment</p>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Unlimited baby profiles</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Complete 12 months milestone tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Unlimited photo uploads</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Video uploads</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-baby-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Advanced milestone suggestions</span>
                  </li>
                </ul>
                
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
              </Card>
            </div>
          )}
          
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Need help? Contact our support team at support@tinytotsmilestones.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
