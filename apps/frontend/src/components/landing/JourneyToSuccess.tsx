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
        <div className="text-center py-8 md:py-16 lg:py-20 px-4 bg-primary-400/20">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 text-gray-800">Your Journey to Success</h2>
          <p className="mb-6 md:mb-8 text-base md:text-lg text-gray-700">Track your progress every step of the way</p>
          
          {/* Desktop/Tablet Layout - Horizontal */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-center space-x-2 md:space-x-4 max-w-4xl mx-auto">
              {stages.map((stage, index) => (
                <div key={index} className="flex items-center space-x-1 md:space-x-2">
                  <div className={`rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center ${stage.bgColor}`}>
                    <div className="w-4 h-4 md:w-5 md:h-5">
                      {React.cloneElement(stage.icon, { size: 16, className: "w-full h-full" })}
                    </div>
                  </div>
        
                  {index !== stages.length - 1 && (
                    <div className={`h-1 w-8 md:w-16 ${stage.lineColor}`}></div>
                  )}
                </div>
              ))}
            </div>
      
            {/* Stage Labels */}
            <div className="flex justify-center space-x-6 md:space-x-12 lg:space-x-20 mt-3 md:mt-4">
              {stages.map((stage, index) => (
                <span key={index} className="text-xs md:text-sm text-gray-800 font-medium">{stage.label}</span>
              ))}
            </div>
          </div>

          {/* Mobile Layout - Vertical */}
          <div className="block sm:hidden">
            <div className="flex flex-col items-center space-y-4 max-w-xs mx-auto">
              {stages.map((stage, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`rounded-full w-12 h-12 flex items-center justify-center ${stage.bgColor}`}>
                    {stage.icon}
                  </div>
                  <span className="text-sm text-gray-800 font-medium mt-2">{stage.label}</span>
                  
                  {index !== stages.length - 1 && (
                    <div className={`w-1 h-8 mt-2 ${stage.lineColor}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
}

export default JourneyToSuccess