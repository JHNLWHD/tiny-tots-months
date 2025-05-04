
import React from 'react';
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
import { Loader2 } from 'lucide-react';
import { getShareTitle } from '@/utils/shareUtils';

interface ShareSocialButtonsProps {
  shareUrl: string | null;
  babyName: string;
  type: 'baby' | 'month';
  monthNumber?: number;
}

const ShareSocialButtons: React.FC<ShareSocialButtonsProps> = ({
  shareUrl,
  babyName,
  type,
  monthNumber,
}) => {
  const shareTitle = getShareTitle(babyName, type, monthNumber);
  
  if (!shareUrl) {
    return (
      <div className="w-full flex justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="flex justify-between">
      <FacebookShareButton 
        url={shareUrl}
        hashtag="#TinyTotsMilestones"
        className="rounded-full hover:bg-muted p-1"
      >
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      
      <TwitterShareButton 
        url={shareUrl} 
        title={shareTitle} 
        className="rounded-full hover:bg-muted p-1"
      >
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      
      <WhatsappShareButton 
        url={shareUrl} 
        title={shareTitle} 
        className="rounded-full hover:bg-muted p-1"
      >
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      
      <EmailShareButton 
        url={shareUrl} 
        subject={shareTitle} 
        className="rounded-full hover:bg-muted p-1"
      >
        <EmailIcon size={32} round />
      </EmailShareButton>
    </div>
  );
};

export default ShareSocialButtons;
