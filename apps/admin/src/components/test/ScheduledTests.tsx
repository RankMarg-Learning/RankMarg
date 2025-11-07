import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export interface ScheduledTestAPI {
  testId: string;
  title: string;
  startTime: string;
  duration: number; // in minutes
  difficulty: string;
  examType: string;
  examCode: string;
}

interface ScheduledTestsProps {
  tests: ScheduledTestAPI[];
  onStartTest: (id: string) => void;
}

const typeColors = {
  'FULL_LENGTH': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-50',
  'SUBJECT': 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-50',
  'PREVIOUS_YEAR': 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-50',
  'CHAPTER_WISE': 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-50',
  'TOPIC_WISE': 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-50',
};

const ScheduledTestItem: React.FC<{ test: ScheduledTestAPI; onStartTest: (id: string) => void }> = ({
  test,
  onStartTest,
}) => {
  const formattedDate = format(new Date(test?.startTime), 'dd MMM, yyyy');
  const formattedTime = format(new Date(test?.startTime), 'hh:mm a');

  const type = test?.examType.toUpperCase();
  const typeColorClass = typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div className="border border-gray-200 my-3 p-4 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex flex-wrap gap-2 mb-2">
        <Badge className={typeColorClass}>
          {type === 'FULL_LENGTH' ? 'Full Mock Test' : type.replace('_', ' ')}
        </Badge>
        <Badge variant="outline" className="text-xs capitalize">
          {test?.difficulty.toLowerCase()}
        </Badge>
      </div>

      <h3 className="text-base font-semibold text-gray-900 mb-3">
        {test?.title?.length > 0 ? test?.title : 'Untitled Test'}
      </h3>

      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar size={16} className="mr-1" />
            {formattedDate} • {formattedTime}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock size={16} className="mr-1" />
            {test.duration} min
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={test?.startTime > new Date().toISOString()}
            onClick={() => onStartTest(test?.testId)}
            className="bg-primary-600 hover:bg-primary-700 text-white transition-all duration-150"
          >
            Start Test 
          </Button>
        </div>
      </div>
    </div>
  );
};

const ScheduledTests: React.FC<ScheduledTestsProps> = ({ tests, onStartTest }) => {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-semibold text-gray-900"> Upcoming Scheduled Tests</h2>

      <div className="p-1">
        {tests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No scheduled tests available.</p>
        ) : (
          tests.map((test) => (
            <ScheduledTestItem key={test.testId} test={test} onStartTest={onStartTest} />
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduledTests;
