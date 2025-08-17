import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubject';
import { useTopics } from '@/hooks/useTopics';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { Card } from '../ui/card';
import { CurrentStudies } from '@/types/dashboard.types';
import { useSession } from 'next-auth/react';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function CurrentTopicCard({ currentStudies }: { currentStudies: CurrentStudies[] }) {

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const [infoOpen, setInfoOpen] = useState(false);
  const router = useRouter();

  const updateCurrentTopicMutation = useMutation({
    mutationFn: async ({ subjectId, topicId }: { subjectId: string; topicId: string }) => {
      const { data } = await axios.put('/api/current-topic', {
        subjectId,
        topicId
      });
      return data;
    },
    onSuccess: async (data) => {
      if (data?.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['currentTopics'] }),
          queryClient.invalidateQueries({ queryKey: ['currentStudies'] }),
          queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        ]);
        toast({
          title: "Your current topic is updated!",
          description: "Changes will reflect from tomorrow's practice session.",
          variant: "default",
          duration: 3500,
          className: "bg-gray-100 text-gray-800",
        })
        setSelectedSubject("");
        setSelectedTopic("");
        setOpen(false);
      } else {
        toast({
          title: data.message || "Failed to update current topic!!",
          variant: "default",
          duration: 3000,
          className: "bg-red-500 text-white",
        })

      }
    },
    onError: (error) => {
      toast({
        title: (error as any).response?.data?.message || error.message || 'Failed to update current topic',
        variant: "default",
        duration: 3000,
        className: "bg-red-500 text-white",
      })

    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleUpdateCurrentTopic = () => {
    if (!selectedSubject || !selectedTopic) {
      toast({
        title: "Please select both subject and topic",
        variant: "default",
        duration: 3000,
        className: "bg-red-500 text-white",
      })

      return;
    }

    setIsSubmitting(true);
    updateCurrentTopicMutation.mutate({
      subjectId: selectedSubject,
      topicId: selectedTopic
    });
  };

  const { subjects, isLoading: isLoadingSubjects } = useSubjects(session?.user?.examCode || "NEET");

  const { topics: filteredTopics, isLoading: isLoadingTopics } = useTopics(selectedSubject);

  return (
    <>
      <Card className="border border-green-100 bg-white">
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-green-800 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              Current Topics
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Info
                        className="h-4 w-4 ml-1 text-green-600 hover:text-green-800 transition-colors cursor-pointer align-middle"
                        onClick={() => setInfoOpen(true)}
                        aria-label="What is this?"
                        tabIndex={0}
                        role="button"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className='bg-primary-100 text-primary-900'>
                    What is this?
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 hover:cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </div>
          <div className="space-y-1 text-sm">
            {currentStudies.length > 0 ? currentStudies?.map((topic, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="truncate">{topic.topicName}</span>
                <span className="bg-green-50 text-xs px-2 py-1 rounded-md border border-green-100">
                  {topic.subjectName}
                </span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center text-center py-3 w-full">
                <h2 className="text-sm font-medium text-gray-700">
                  No current topics assigned.
                </h2>
                <p className="mt-2 text-xs text-gray-500">
                  Please update your current topic to start tracking your studies.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Current Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Subject</label>
              <Select
                value={selectedSubject}
                onValueChange={(value) => {
                  setSelectedSubject(value);
                  setSelectedTopic("");
                }}
                disabled={status !== "authenticated" || isLoadingSubjects}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.data?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Topic</label>
              <Select
                value={selectedTopic}
                onValueChange={setSelectedTopic}
                disabled={!selectedSubject || isLoadingTopics}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={selectedSubject ? "Select a topic" : "Select a subject first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredTopics?.data?.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className='gap-2'>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedSubject("");
                setSelectedTopic("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCurrentTopic}
              disabled={isSubmitting || !selectedSubject || !selectedTopic}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Topic"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>About Current Topics</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm text-gray-700">
            <p>
              <b>Update your current topic</b> to match what you're learning in your coaching or school. This helps you and your mentor keep track of your progress.
            </p>
            <p>
              <b>What does this mean?</b> When you mark a topic as current, it means you're working on or have completed that chapter. This helps in planning your next steps better.
            </p>
            <p>
              <b>Want to update all your topics?</b> Go here to manage your full list:
            </p>
          </div>
          <DialogFooter className="gap-2 flex flex-col sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setInfoOpen(false);
                router.push('/my-curriculum');
              }}
              variant="default"
            >
              Go to My Curriculum
            </Button>
            <Button variant="outline" onClick={() => setInfoOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}