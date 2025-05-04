
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { copyToClipboard } from '@/utils/shareUtils';

interface CopyLinkButtonProps {
  shareUrl: string | null;
}

const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({ shareUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!shareUrl) {
      console.error("Cannot copy - shareUrl is null");
      return;
    }
    
    const success = await copyToClipboard(shareUrl);
    
    if (success) {
      setCopied(true);
      toast("Link copied", {
        description: "Share link copied to clipboard!",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } else {
      toast("Failed to copy", {
        description: "Could not copy to clipboard. Please try again.",
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  return (
    <DropdownMenuItem
      className="flex cursor-pointer items-center gap-2"
      onClick={handleCopy}
      disabled={!shareUrl}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      Copy Link
    </DropdownMenuItem>
  );
};

export default CopyLinkButton;
