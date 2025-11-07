import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface ProgressTooltipProps {
  subject: string;
  progress: number;
  improvement: number;
  children: React.ReactNode;
}

const ProgressTooltip: React.FC<ProgressTooltipProps> = ({ 
  subject, 
  progress, 
  improvement, 
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl z-10 animate-fade-in-up whitespace-nowrap">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="font-medium text-xs">+{improvement}% from last week</span>
          </div>
          <div className="text-xs text-gray-300">Keep going!</div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default ProgressTooltip;
