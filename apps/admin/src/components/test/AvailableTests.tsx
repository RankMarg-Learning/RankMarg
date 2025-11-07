import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, FileText, Info, Lock, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { TextFormator } from '@/utils/textFormator';
import { AvailableTestsProps, TestCardProps } from '@/types';
import { useRouter } from 'next/navigation';
import MarkdownRenderer from '@/lib/MarkdownRenderer';
import { cn } from '@/lib/utils';




const TestCard: React.FC<TestCardProps> = ({ test, onStartTest, isLimitExceeded }) => {
  const router = useRouter();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  let badgeColor = 'bg-gray-500 text-white';
  let badgeText = 'Standard';
  let cardBgColor = 'bg-white border-gray-200';
  let iconColor = 'text-gray-600';

  if (test.featured) {
    badgeColor = 'bg-blue-500 text-white';
    badgeText = 'Featured';
    cardBgColor = 'bg-blue-50 border-blue-200';
    iconColor = 'text-blue-600';
  } else if (test.recommended) {
    badgeColor = 'bg-green-500 text-white';
    badgeText = 'Recommended';
    cardBgColor = 'bg-green-50 border-green-200';
    iconColor = 'text-green-600';
  }

  if (isLimitExceeded) {
    cardBgColor = 'bg-gray-50 border-gray-300 opacity-75';
    iconColor = 'text-amber-600';
  }

  const handleStartTest = () => {
    if (isLimitExceeded) {
      router.push('/subscription?plan=rank&ref=tests_button');
      return;
    }
    onStartTest(test.testId);
  };

  const handleUpgrade = () => {
    router.push('/subscription?plan=rank&ref=tests_button');
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  return (
    <div className={`${cardBgColor} border rounded-lg overflow-hidden shadow-sm transition-shadow hover:shadow-md`}>
      {/* Badge and Lock Icon */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 p-2">
          {isLimitExceeded && (
            <div className={`flex items-center gap-1 ${iconColor}`}>
              <Lock size={16} />
              <span className="text-xs font-medium">Locked</span>
            </div>
          )}
        </div>
        <div className={`px-3 py-1 text-xs font-semibold rounded-bl-lg rounded-tr-lg rounded-br-none rounded-tl-none ${badgeColor}`}>
          {badgeText}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base font-medium text-gray-900 mb-1">{test.title}</h3>
        
        {/* Collapsible Description */}
        <div className="mb-4">
          <button
            onClick={toggleDescription}
            className="flex items-center justify-between w-full text-left text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <span className="font-medium text-xs">Description</span>
            {isDescriptionExpanded ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </button>
          
          {isDescriptionExpanded && (
            <div className="mt-1 p-1 bg-gray-50  ">
              <div className=" text-gray-700">
                <MarkdownRenderer content={test.description || "No description available"} className='text-xs' />
              </div>
            </div>
          )}
        </div>

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
        </div>


        <div className="flex gap-2">
          {isLimitExceeded ? (
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleUpgrade}
            >
              <Crown size={16} className="mr-2" />
              Upgrade to Unlock
            </Button>
          ) : (
            <Button
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
              onClick={handleStartTest}
            >
              Start Test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};



const AvailableTests: React.FC<AvailableTestsProps> = ({
  tests = [],
  isLimitExceeded,
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
      <div className="mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Filter Tests</h3>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['FULL_LENGTH', 'SUBJECT_WISE', 'CHAPTER_WISE'].map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange(filter)}
                className={cn(
                  "transition-all duration-200 font-medium",
                  activeFilter === filter 
                    ? "bg-primary-600 hover:bg-primary-700 text-white shadow-sm" 
                    : "border-gray-300 text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50"
                )}
              >
                {TextFormator(filter)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-2 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tests available</h3>
              <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">
                No tests are currently available for the selected filter. Try changing the filter or check back later.
              </p>
            </div>
          ) : (
            tests.map((test) => (
              <TestCard
                key={test.testId}
                test={test}
                isLimitExceeded={isLimitExceeded}
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