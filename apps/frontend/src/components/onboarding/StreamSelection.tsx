import React from 'react';
import { cn } from '@/lib/utils';
import { Stream, STREAMS } from '@/utils/constants';
import useOnboardingStore from '@/store/onboardingStore';
import { Card, CardContent } from '@/components/ui/card';
import Motion from '@/components/ui/motion';
import OnboardingLayout from './OnboardingLayout';

const StreamSelection: React.FC = () => {
  const { stream, setStream } = useOnboardingStore();

  const handleSelectStream = (selectedStream: Stream) => {
    setStream(selectedStream);
  };

  return (
    <OnboardingLayout
      title="Select Your Stream"
      subtitle="Choose the exam preparation stream that aligns with your goals"
      nextDisabled={!stream}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {STREAMS.map((streamOption, index) => (
          <Motion
            key={streamOption.id}
            animation="scale-in"
            delay={150 + index * 50}
            className="w-full"
          >
            <Card
              className={cn(
                "border-2 cursor-pointer transition-all duration-200 hover:shadow-md h-full",
                stream === streamOption.id
                  ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                  : "border-border hover:border-primary/30"
              )}
              onClick={() => handleSelectStream(streamOption.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{streamOption.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{streamOption.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {streamOption.subjects.map((subject) => (
                        <div
                          key={subject.id}
                          className="inline-flex items-center space-x-1 text-xs bg-secondary/50 px-2 py-1 rounded-full"
                        >
                          <subject.icon size={20} color="#fce587" />
                          <span>{subject.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                 
                </div>
              </CardContent>
            </Card>
          </Motion>
        ))}
      </div>
    </OnboardingLayout>
  );
};

export default StreamSelection;