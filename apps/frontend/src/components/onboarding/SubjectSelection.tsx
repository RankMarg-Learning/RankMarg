import React from 'react';
import { cn } from '@/lib/utils';
import useOnboardingStore from '@/store/onboardingStore';
import { SubjectData, getSubjectsByStream } from '@/utils/constants';
import Motion from '@/components/ui/motion';
import OnboardingLayout from './OnboardingLayout';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Chip from '../ui/chip';

const SubjectSelection: React.FC = () => {
  const { 
    stream, 
    selectedSubjects, 
    addSubject, 
    removeSubject 
  } = useOnboardingStore();
  
  const subjects = React.useMemo(() => {
    return stream ? getSubjectsByStream(stream) : [];
  }, [stream]);

  const handleToggleSubject = (subject: SubjectData) => {
    const isSelected = selectedSubjects.some(s => s.id === subject.id);
    
    if (isSelected) {
      removeSubject(subject.id);
    } else {
      addSubject(subject);
    }
  };

  return (
    <OnboardingLayout
      title="Subject Selection"
      subtitle={`Select the subjects you'd like to focus on for your ${stream} preparation.`}
      nextDisabled={selectedSubjects.length === 0}
    >
      <div className="space-y-6">
        <Motion animation="slide-in-up" delay={200} className="w-full">
          {selectedSubjects.length > 0 && (
            <div className="mb-6 pb-4 border-b border-border/30">
              <h3 className="font-medium mb-3">Selected Subjects:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((subject) => (
                  <Chip
                    key={subject.id}
                    variant="primary"
                    size="md"
                    removable
                    onRemove={() => removeSubject(subject.id)}
                    icon={subject.icon ? <subject.icon size={20} color="#fce587" /> : undefined}
                  >
                    {subject.name}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </Motion>

        <Motion animation="slide-in-up" delay={300} className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject, index) => {
              const isSelected = selectedSubjects.some(s => s.id === subject.id);
              
              return (
                <Motion
                  key={subject.id}
                  animation="scale-in"
                  delay={400 + index * 100}
                  className="option-card"
                >
                  <Card
                    className={cn(
                      "border-2 cursor-pointer transition-all duration-300 hover:shadow-md overflow-hidden",
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => handleToggleSubject(subject)}
                  >
                    <div
                      className={cn(
                        "absolute top-0 left-0 right-0 h-1",
                        isSelected ? "bg-primary" : "bg-transparent"
                      )}
                    />
                    
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <div className="text-3xl mr-3"><subject.icon size={20} color="#fce587" /></div>
                        <div className="flex-1">
                          <h3 className="font-medium">{subject.name}</h3>
                          <CardDescription className="text-xs mt-1">
                            {subject.description}
                          </CardDescription>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Motion>
              );
            })}
          </div>
        </Motion>
      </div>
    </OnboardingLayout>
  );
};

export default SubjectSelection;