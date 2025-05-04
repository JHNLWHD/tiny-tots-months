
import React, { useState, useEffect } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import { useShareLinks, ShareType } from '@/hooks/useShareLinks';
import { generateShareUrl } from '@/utils/shareUtils';
import CopyLinkButton from '@/components/CopyLinkButton';
import ShareSocialButtons from '@/components/ShareSocialButtons';

interface ShareButtonProps {
  babyId: string;
  babyName: string;
  type: ShareType;
  monthNumber?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  babyId, 
  babyName, 
  type, 
  monthNumber, 
  className, 
  onClick 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { generateShareLink, isGenerating, getShareLink, shareLinks } = useShareLinks();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  
  // Generate or retrieve share URL when the component mounts or when shareLinks change
  useEffect(() => {
    const existingLink = getShareLink(babyId, type === 'month' ? monthNumber : undefined);
    if (existingLink) {
      const url = generateShareUrl(existingLink.share_token, type);
      setShareUrl(url);
      console.log("Set share URL from existing link:", url);
    }
  }, [babyId, type, monthNumber, shareLinks, getShareLink]);
  
  // Generate share URL when dropdown is opened
  useEffect(() => {
    if (isOpen && !shareUrl && !isGenerating) {
      console.log("Dropdown opened, generating share URL");
      handleShare();
    }
  }, [isOpen, shareUrl, isGenerating]);
  
  const handleShare = async () => {
    try {
      console.log("Handling share for babyId:", babyId, "type:", type, "monthNumber:", monthNumber);
      const existingLink = getShareLink(babyId, type === 'month' ? monthNumber : undefined);
      
      if (existingLink) {
        const url = generateShareUrl(existingLink.share_token, type);
        console.log("Using existing link:", existingLink, "URL:", url);
        setShareUrl(url);
        return;
      }
      
      console.log("Generating new share link");
      const token = await generateShareLink(babyId, type, monthNumber);
      const url = generateShareUrl(token, type);
      console.log("Generated new share link with token:", token, "URL:", url);
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share link:', error);
      toast("Failed to generate share link", {
        description: "An error occurred while generating the share link.",
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  console.log("ShareButton render - babyId:", babyId, "shareUrl:", shareUrl, "isGenerating:", isGenerating);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={className}
          onClick={(e) => {
            if (onClick) {
              onClick(e);
            }
          }}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          <span className="ml-2">Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Share {type === 'baby' ? 'Baby Profile' : `Month ${monthNumber}`}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <CopyLinkButton shareUrl={shareUrl} />
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <ShareSocialButtons 
            shareUrl={shareUrl}
            babyName={babyName}
            type={type}
            monthNumber={monthNumber}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
