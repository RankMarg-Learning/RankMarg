import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Calendar, Info } from 'lucide-react';
import { TextFormator } from '@/utils/textFormator';
import { DateFormator } from '@/utils/dateFormator';
import { AvailableTestsProps, TestCardProps } from '@/types';




const TestCard: React.FC<TestCardProps> = ({ test, onStartTest }) => {
  let badgeColor = 'bg-blue-500 text-white hover:bg-blue-600';
  let badgeText = 'Old';

  if (test.featured) {
    badgeColor = 'bg-blue-500 text-white hover:bg-blue-600';
    badgeText = 'Featured';
  } else if (test.recommended) {
    badgeColor = 'bg-green-500 text-white hover:bg-green-600';
    badgeText = 'Recommended';
  }
  return (
    <div className={`bg-white border rounded-lg overflow-hidden shadow-sm transition-shadow hover:shadow-md ${test.recommended ? 'bg-green-50 border-green-200' : test.featured ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}>

      <div className="flex justify-end">
        <Badge className={`${badgeColor} rounded-bl-lg rounded-tr-lg rounded-br-none rounded-tl-none px-3 py-1 ${(test.featured || test.recommended) ? 'opacity-100' : 'opacity-0'}`}>
          {badgeText}
        </Badge>
      </div>

      <div className="p-4">
        <h3 className="text-base font-medium text-gray-900 mb-1">{test.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{test.description}</p>

        <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <FileText size={16} className="mr-2 flex-shrink-0" />
            {test.totalQuestions} questions
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-2 flex-shrink-0" />
            {test.duration} min
          </div>
          <div className="flex items-center">
            <Info size={16} className="mr-2 flex-shrink-0" />
            {TextFormator(test.difficulty)}
          </div>
          <div className="flex items-center">
            <Calendar size={16} className="mr-2 flex-shrink-0" />
            Last updated: {DateFormator(test.updatedAt, 'date')}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
            onClick={() => onStartTest(test.testId)}
          >
            Start Test
          </Button>
        </div>
      </div>
    </div>
  );
};



const AvailableTests: React.FC<AvailableTestsProps> = ({
  tests = [],
  onStartTest,
  onFilterChange,
  activeFilter = 'CHAPTER_WISE',
}) => {
  const handleFilterChange = (filter: string) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };
  return (
    <div>
      <div className="border-gray-200 flex justify-between items-center flex-wrap gap-4">

        <div className="flex gap-2">
          {['FULL_LENGTH', 'SUBJECT_WISE', 'CHAPTER_WISE'].map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(filter)}
              className={activeFilter === filter ? 'bg-primary-400' : ''}
            >
              {TextFormator(filter)}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tests.length === 0 ? (
            <p className="text-gray-500 text-center py-4 col-span-3">No tests available for this filter.</p>
          ) : (
            tests.map((test) => (
              <TestCard
                key={test.testId}
                test={test}
                onStartTest={onStartTest}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableTests;