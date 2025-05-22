import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import useOnboardingStore from '@/store/onboardingStore';
import { TopicData } from '@/utils/constants';
import Motion from '@/components/ui/motion';
import OnboardingLayout from './OnboardingLayout';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { useSubjects } from '@/hooks/useSubject';
import { useTopics } from '@/hooks/useTopics';
import { AlertCircle } from 'lucide-react';

const TopicSelection: React.FC = () => {
  const {
    stream,
    selectedTopics,
    addTopic,
    removeTopic
  } = useOnboardingStore();

  const { subjects, isLoading: isLoadingSubjects } = useSubjects(stream);
  console.log("subjects", subjects);  

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const { topics, isLoading: isLoadingTopics } = useTopics(selectedSubjectId);

  const subjectsWithSelections = React.useMemo(() => {
    const selectionMap = new Map();

    if (subjects && selectedTopics.length > 0) {
      subjects?.data?.forEach(subject => {
        const hasSelection = selectedTopics.some(topic => topic.subjectId === subject.id);
        selectionMap.set(subject.id, hasSelection);
      });
    }

    return selectionMap;
  }, [subjects, selectedTopics]);

  const handleToggleTopic = (topic: TopicData) => {
    const isSelected = selectedTopics.some(t => t.id === topic.id);

    if (isSelected) {
      removeTopic(topic.id);
    } else {
      addTopic(topic);
    }
  };

  const hasMinimumSelections = React.useMemo(() => {
    if (!subjects || subjects?.data?.length === 0) return false;

    return subjects?.data?.every(subject => subjectsWithSelections.get(subject.id));
  }, [subjects, subjectsWithSelections]);

  const incompleteSubjects = React.useMemo(() => {
    if (!subjects) return [];
    return subjects?.data?.filter(subject => !subjectsWithSelections.get(subject.id));
  }, [subjects, subjectsWithSelections]);

  return (
    <OnboardingLayout
      title="Build Your Learning Path"
      subtitle="Select topics that interest you most - choose at least one from each subject"
      nextDisabled={!hasMinimumSelections}
    >
      <div className="space-y-4">
        {isLoadingSubjects ? (
          <div className="text-center py-8">Loading your subjects...</div>
        ) : (
          <>
            <Motion animation="slide-in-up" delay={150} className="w-full">
              {selectedTopics.length > 0 && (
                <div className="mb-4 yellow-gradient rounded-xl p-3">
                  <div className="flex items-center mb-2">
                    <h3 className="text-sm font-medium">Your selected topics:</h3>
                    <span className="ml-2 bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                      {selectedTopics.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopics.map((topic) => (
                      <Chip
                        key={topic.id}
                        variant="primary"
                        size="sm"
                        removable
                        onRemove={() => removeTopic(topic.id)}
                      >
                        {topic.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </Motion>

            {!hasMinimumSelections && incompleteSubjects?.length > 0 && (
              <Motion animation="fade-in" delay={200} className="w-full">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <AlertCircle size={16} className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-amber-800 text-sm font-medium">Complete your selection</p>
                      <p className="text-amber-700 text-xs mt-1">
                        Please select at least one topic from each of these subjects:
                        {incompleteSubjects.map(subject => (
                          <span key={subject.id} className="font-medium"> {subject.name}{incompleteSubjects.indexOf(subject) !== incompleteSubjects.length - 1 ? ',' : ''}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              </Motion>
            )}

            <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 pb-2">
              {subjects && subjects?.data?.map((subject) => {
                const hasSelection = subjectsWithSelections.get(subject.id);

                return (
                  <div
                    key={subject.id}
                    className="w-full"
                    onMouseEnter={() => setSelectedSubjectId(subject.id)}
                  >
                    <div className={cn(
                      "flex items-center gap-2 mb-3 pb-1 border-b",
                      hasSelection ? "border-primary/30" : "border-border/30"
                    )}>
                      {subject.icon && <subject.icon size={20} className={hasSelection ? "text-primary" : "text-muted-foreground"} />}
                      <h3 className={cn(
                        "text-base font-semibold",
                        hasSelection ? "text-primary" : "text-foreground"
                      )}>
                        {subject.name}
                        {hasSelection && <span className="ml-2 text-xs font-normal text-muted-foreground">(topics selected)</span>}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {selectedSubjectId === subject.id && isLoadingTopics ? (
                        <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
                          Loading topics...
                        </div>
                      ) : (
                        topics && topics?.data?.filter(topic => topic.subjectId === subject.id)
                          .map((topic) => {
                            const isSelected = selectedTopics.some(t => t.id === topic.id);

                            return (
                              <Card
                                key={topic.id}
                                className={cn(
                                  "border cursor-pointer transition-all duration-200 hover:shadow-md p-2",
                                  isSelected
                                    ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                                    : "border-border hover:border-primary/30"
                                )}
                                onClick={() => handleToggleTopic(topic)}
                              >
                                <div className="flex items-start justify-between h-full overflow-hidden">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-xs truncate">{topic.name}</h4>
                                  </div>
                                  {isSelected && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                  )}
                                </div>
                              </Card>
                            );
                          })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default TopicSelection;