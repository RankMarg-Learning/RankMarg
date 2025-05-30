import React from 'react'
import { Check, Zap, Target } from 'lucide-react';

const JourneyToSuccess = () => {
    const stages = [
        {
          label: 'Goal Set',
          icon: <Check className="text-white" size={20} />,
          bgColor: 'bg-primary-500',
          lineColor: 'bg-primary-700',
        },
        {
          label: 'Daily Practice',
          icon: <Check className="text-white" size={20} />,
          bgColor: 'bg-primary-500',
          lineColor: 'bg-yellow-700',
        },
        {
          label: 'Improving',
          icon: <Zap className="text-yellow-600" size={20} />,
          bgColor: 'bg-primary-200',
          lineColor: 'bg-gray-300',
        },
        {
          label: 'Success',
          icon: <Target className="text-red-600" size={20} />,
          bgColor: 'bg-primary-50',
          lineColor: null,
        },
      ];
      return (
        <div className=" text-center py-20 px-4 bg-primary-400/20">
          <h2 className="text-4xl font-bold mb-1 text-gray-800">Your Journey to Success</h2>
          <p className="mb-6 text-lg text-gray-700">Track your progress every step of the way</p>
          <div className="flex items-center justify-center space-x-4 max-w-4xl mx-auto">
            {stages.map((stage, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`rounded-full w-12 h-12 flex items-center justify-center ${stage.bgColor}`}>
                  {stage.icon}
                </div>
    
                {index !== stages.length - 1 && (
                  <div className={`h-1 w-16 ${stage.lineColor}`}></div>
                )}
              </div>
            ))}
          </div>
    
          {/* Stage Labels */}
          <div className="flex justify-center space-x-20 mt-3">
            {stages.map((stage, index) => (
              <span key={index} className="text-sm text-gray-800">{stage.label}</span>
            ))}
          </div>
        </div>
      );
}

export default JourneyToSuccess