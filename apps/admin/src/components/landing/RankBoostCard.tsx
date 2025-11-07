import React, { useState } from 'react';
import { TrendingUp, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const RankBoostCard = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-gradient-to-br from-brand-purple to-brand-blue p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Rank Boost</h3>
        <TrendingUp 
          className={`w-6 h-6 text-green-400 transition-all duration-300 ${
            isHovered ? 'animate-arrow-bounce' : ''
          }`} 
        />
      </div>
      
      <div className="text-white/90 mb-4">
        <div className="text-2xl font-bold text-green-400">+247</div>
        <div className="text-sm">positions this month</div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
          >
            See How AI Helps
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-yellow" />
              How AI Improves Your Rank
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-brand-blue mt-1" />
              <div>
                <h4 className="font-semibold">Smart Practice</h4>
                <p className="text-sm text-gray-600">AI identifies your weak topics and creates personalized practice sessions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-brand-green mt-1" />
              <div>
                <h4 className="font-semibold">Mistake Analysis</h4>
                <p className="text-sm text-gray-600">Advanced algorithms analyze your errors and prevent repeat mistakes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-brand-purple mt-1" />
              <div>
                <h4 className="font-semibold">Adaptive Learning</h4>
                <p className="text-sm text-gray-600">Difficulty adjusts automatically based on your performance patterns</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RankBoostCard;
