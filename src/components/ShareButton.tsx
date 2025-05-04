
import React, { useState, useEffect } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon,
} from 'react-share';
import { Copy, Check, Share2, Loader2 } from 'lucide-react';
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

interface ShareButtonProps {
  babyId: string;
  babyName: string;
  type: ShareType;
  monthNumber?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({ babyId, babyName, type, monthNumber, className, onClick }) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { generateShareLink, isGenerating, getShareLink, shareLinks } = useShareLinks();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  
  // Generate or retrieve share URL when the component mounts or when shareLinks change
  useEffect(() => {
    const existingLink = getShareLink(babyId, type === 'month' ? monthNumber : undefined);
    if (existingLink) {
      const url = generateShareUrl(existingLink.share_token, type);
      setShareUrl(url);
    }
  }, [babyId, type, monthNumber, shareLinks]);
  
  // Generate share URL when dropdown is opened
  useEffect(() => {
    if (isOpen && !shareUrl && !isGenerating) {
      handleShare();
    }
  }, [isOpen]);
  
  const handleShare = async () => {
    try {
      const existingLink = getShareLink(babyId, type === 'month' ? monthNumber : undefined);
      
      if (existingLink) {
        const url = generateShareUrl(existingLink.share_token, type);
        setShareUrl(url);
        return;
      }
      
      const token = await generateShareLink(babyId, type, monthNumber);
      const url = generateShareUrl(token, type);
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share link:', error);
      toast("Failed to generate share link", {
        description: "An error occurred while generating the share link.",
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  const generateShareUrl = (token: string, type: ShareType): string => {
    const baseUrl = window.location.origin;
    const path = type === 'baby' ? `/share/baby/${token}` : `/share/month/${token}`;
    return `${baseUrl}${path}`;
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast("Link copied", {
      description: "Share link copied to clipboard!",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const getShareTitle = () => {
    if (type === 'baby') {
      return `Check out ${babyName}'s milestone journey!`;
    } else {
      return `Check out ${babyName}'s Month ${monthNumber} milestones!`;
    }
  };

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
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="flex justify-between">
            {shareUrl ? (
              <>
                <FacebookShareButton 
                  url={shareUrl}
                  hashtag="#TinyTotsMilestones"
                  className="rounded-full hover:bg-muted p-1"
                >
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                
                <TwitterShareButton 
                  url={shareUrl} 
                  title={getShareTitle()} 
                  className="rounded-full hover:bg-muted p-1"
                >
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                
                <WhatsappShareButton 
                  url={shareUrl} 
                  title={getShareTitle()} 
                  className="rounded-full hover:bg-muted p-1"
                >
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>
                
                <EmailShareButton 
                  url={shareUrl} 
                  subject={getShareTitle()} 
                  className="rounded-full hover:bg-muted p-1"
                >
                  <EmailIcon size={32} round />
                </EmailShareButton>
              </>
            ) : (
              <div className="w-full flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
