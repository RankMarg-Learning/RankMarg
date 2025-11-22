import { Button } from '@repo/common-ui';
import { Card } from '@repo/common-ui';
import { CurrentStudies } from '@/types/dashboard.types';
import {  Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CurrentTopicCard({ currentStudies }: { currentStudies: CurrentStudies[] | undefined }) {
  const router = useRouter();

  const groupedTopics = currentStudies?.reduce((acc: Record<string, { topics: CurrentStudies[], totalCount: number }>, topic: CurrentStudies) => {
    if (!acc[topic.subjectName]) {
      acc[topic.subjectName] = {
        topics: [],
        totalCount: 0
      };
    }
    acc[topic.subjectName].topics.push(topic);
    acc[topic.subjectName].totalCount++;
    return acc;
  }, {} as Record<string, { topics: CurrentStudies[], totalCount: number }>);

  // Sort topics within each subject by startedAt
  Object.values(groupedTopics).forEach(group => {
    group.topics.sort((a, b) => {
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    });
  });

  const handleGoToCurriculum = () => {
    router.push('/my-curriculum');
  };

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
             
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoToCurriculum}
              className="h-6 px-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Manage
            </Button>
          </div>
          
          <div className="space-y-1 text-sm">
            {Object.keys(groupedTopics).length > 0 ? (
              Object.entries(groupedTopics).map(([subjectName, { topics, totalCount }]) => {
                const firstTopic = topics[0];
                const hasMoreTopics = totalCount > 1;
                
                return (
                  <div key={subjectName} className="flex items-center justify-between ">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {firstTopic.topicName}
                        </span>
                        
                        {hasMoreTopics && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                            +{totalCount - 1}
                          </span>
                        )}
                        {firstTopic.isCompleted && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            Done
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-md border ml-2 bg-green-50 border-green-200 text-green-700">
                      {subjectName}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-3 w-full">
                <h2 className="text-sm font-medium text-gray-700">
                  No current topics assigned.
                </h2>
                <p className="mt-1 text-xs text-gray-500 mb-2">
                  Please update your current topic to start tracking your studies.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoToCurriculum}
                  className="text-xs h-7"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Topic
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

     
    </>
  );
}