"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Crown } from 'lucide-react';
import Link from 'next/link';
import { useTrialStatus, formatTrialMessage, getTrialBannerVariant } from '@/hooks/useTrialStatus';

interface TrialUpgradeBannerProps {
  onClose?: () => void;
}

export function TrialUpgradeBanner({ onClose }: TrialUpgradeBannerProps) {
  const { shouldShowUpgradeBanner, daysLeft, isExpired } = useTrialStatus();
  const [isVisible, setIsVisible] = useState(shouldShowUpgradeBanner);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible || !shouldShowUpgradeBanner) return null;

  const getBannerTitle = () => {
    if (isExpired) {
      return "Trial Expired!";
    } else if (daysLeft <= 3) {
      return "Trial Ending Soon!";
    } else {
      return "Upgrade to Premium";
    }
  };

  const content = {
    title: getBannerTitle(),
    message: formatTrialMessage(daysLeft),
    buttonText: "Upgrade Now",
    variant: getTrialBannerVariant(daysLeft)
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Crown className="h-5 w-5 text-amber-200" />
          <div>
            <h3 className="font-semibold text-sm">{content.title}</h3>
            <p className="text-xs text-amber-100">{content.message}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href="/pricing">
            <Button 
              size="sm" 
              variant={content.variant}
              className="text-xs font-medium"
            >
              {content.buttonText}
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 