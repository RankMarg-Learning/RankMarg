import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import useOnboardingStore from '@/store/onboardingStore';
import { TopicData } from '@/utils/constants';
import Motion from '@/components/ui/motion';
import OnboardingLayout from './OnboardingLayout';
import { Chip } from '@/components/ui/chip';
import { useSubjects } from '@/hooks/useSubject';
import { useTopics } from '@/hooks/useTopics';
import { AlertCircle, Check, ChevronsUpDown, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SubjectCardColor, SubjectTextColor, SubjectIcons } from '@/constant/SubjectColorCode';

const TopicSelection: React.FC = () => {
  const {
    stream,
    selectedTopics,
    addTopic,
    removeTopic
  } = useOnboardingStore();

  const { subjects, isLoading: isLoadingSubjects } = useSubjects(stream);
  const [open, setOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const { topics } = useTopics(selectedSubjectId);

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

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setOpen(true);
  };

  const handleToggleTopic = (topic: TopicData) => {
    const isSelected = selectedTopics.some(t => t.id === topic.id);

    if (isSelected) {
      removeTopic(topic.id);
    } else {
      // Check if we already have a topic selected for this subject
      const existingTopicForSubject = selectedTopics.find(t => t.subjectId === topic.subjectId);
      if (existingTopicForSubject) {
        // Remove the existing topic for this subject
        removeTopic(existingTopicForSubject.id);
      }
      // Add the new topic
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
      title="What Are You Currently Studying?"
      subtitle="Select one topic from each subject that you're currently working on"
      nextDisabled={!hasMinimumSelections}
    >
      <div className="space-y-6">
        {isLoadingSubjects ? (
          <div className="text-center py-8">Loading your subjects...</div>
        ) : (
          <>
            {/* Selected Topics Summary */}
            <Motion animation="slide-in-up" delay={150}>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium">Selected Topics</h3>
                  </div>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {selectedTopics.length} of {subjects?.data?.length || 0}
                  </span>
                </div>
                {selectedTopics.length > 0 ? (
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
                ) : (
                  <p className="text-sm text-muted-foreground">No topics selected yet</p>
                )}
              </div>
            </Motion>

            {/* Warning Message */}
            {!hasMinimumSelections && incompleteSubjects?.length > 0 && (
              <Motion animation="fade-in" delay={200}>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-amber-800 text-sm font-medium">Complete your selection</p>
                      <p className="text-amber-700 text-xs mt-1">
                        Please select one topic from each of these subjects:
                        {incompleteSubjects.map(subject => (
                          <span key={subject.id} className="font-medium"> {subject.name}{incompleteSubjects.indexOf(subject) !== incompleteSubjects.length - 1 ? ',' : ''}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              </Motion>
            )}

            {/* Subject Selection */}
            <Motion animation="slide-in-up" delay={250}>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Select a subject to choose a topic</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {subjects?.data?.map((subject) => {
                    const hasSelection = subjectsWithSelections.get(subject.id);
                    const isSelected = selectedSubjectId === subject.id;
                    const selectedTopic = selectedTopics.find(t => t.subjectId === subject.id);

                    // Use color and icon from SubjectColorCode
                    const cardColor = SubjectCardColor[subject.id] || SubjectCardColor.default;
                    const textColor = SubjectTextColor[subject.id] || SubjectTextColor.default;
                    const Icon = SubjectIcons[subject.id] || SubjectIcons.default;

                    return (
                      <Popover key={subject.id} open={isSelected && open} onOpenChange={(v) => { setOpen(v); if (!v) setSelectedSubjectId(null); }}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              `flex flex-col items-start gap-2 h-auto py-3 px-4 border w-full min-h-[64px] ${cardColor}`,
                              hasSelection && !isSelected && "border-2 border-primary/60",
                              isSelected && "border-2 border-primary",
                              'transition-colors duration-150',
                            )}
                            onClick={() => handleSubjectClick(subject.id)}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Icon size={18} className={textColor} />
                              <span className={cn("font-medium truncate", textColor)}>{subject.name}</span>
                              {hasSelection && !isSelected && (
                                <Check className="h-4 w-4 ml-auto text-primary" />
                              )}
                            </div>
                            {selectedTopic && (
                              <span className="text-xs text-muted-foreground truncate w-full">
                                {selectedTopic.name}
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0 z-50" align="center" sideOffset={8}>
                          <Command>
                            <CommandInput placeholder="Search topics..." />
                            <CommandList>
                              <CommandEmpty>No topic found.</CommandEmpty>
                              <CommandGroup>
                                {topics?.data?.filter(topic => topic.subjectId === subject.id)
                                  .map((topic) => {
                                    const isSelected = selectedTopics.some(t => t.id === topic.id);
                                    return (
                                      <CommandItem
                                        key={topic.id}
                                        value={topic.id}
                                        onSelect={() => {
                                          handleToggleTopic(topic);
                                          setOpen(false);
                                          setSelectedSubjectId(null);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            isSelected ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {topic.name}
                                      </CommandItem>
                                    );
                                  })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
              </div>
            </Motion>
          </>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default TopicSelection;