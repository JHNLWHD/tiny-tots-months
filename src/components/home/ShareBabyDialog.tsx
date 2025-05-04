
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ShareBabyDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedBaby: any;
  generateShareLink: (babyId: string, type: string) => Promise<string>;
  isGenerating: boolean;
}

const ShareBabyDialog: React.FC<ShareBabyDialogProps> = ({ 
  isOpen, 
  setIsOpen, 
  selectedBaby, 
  generateShareLink,
  isGenerating
}) => {
  const [shareLink, setShareLink] = useState<string>('');

  const handleGenerateLink = async () => {
    if (!selectedBaby) return;
    
    try {
      // Generate a share link using the useShareLinks hook
      const token = await generateShareLink(selectedBaby.id, 'baby');
      
      // Create the shareable link
      const shareableLink = `${window.location.origin}/shared/baby/${token}`;
      setShareLink(shareableLink);
    } catch (error: any) {
      toast.error(`Failed to generate link: ${error.message}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {selectedBaby?.name}'s Journey</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <p className="text-sm text-gray-500">
            Generate a unique link to share your baby's milestones with family and friends.
            They'll be able to view without needing an account.
          </p>
          
          {!shareLink ? (
            <Button 
              onClick={handleGenerateLink} 
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Shareable Link'}
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex">
                <Input value={shareLink} readOnly className="rounded-r-none" />
                <Button 
                  onClick={copyToClipboard}
                  className="rounded-l-none"
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                This link will allow anyone to view your baby's milestones. Don't share it publicly.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareBabyDialog;
