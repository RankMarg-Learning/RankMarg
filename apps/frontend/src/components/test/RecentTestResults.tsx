import React from 'react';
import { Button } from '@/components/ui/button';
import { Info, Check, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExamType } from '@repo/db/enums';
import { TextFormator } from '@/utils/textFormator';

interface RawResult {
  id: string;
  score: number;
  endTime: string;
  accuracy: number;
  test: {
    title: string;
    totalMarks: number;
    examType: ExamType;
  };
}

interface RecentTestResultsProps {
  results: RawResult[];
  allResults?: boolean;
}

const RecentTestResults: React.FC<RecentTestResultsProps> = ({ results, allResults= false }) => {
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const transformedResults = results?.map((r) => {
    const scoreRaw = `${r?.score}/${r?.test?.totalMarks}`;
    const percentile = r?.accuracy; 
    return {
      id: r?.id,
      title: r?.test?.title,
      completedDate: formatDate(r?.endTime),
      score: `${r?.score}`,
      scoreRaw,
      percentile,
      totalMarks: r?.test?.totalMarks,
      type: r?.test?.examType,
    };
  });

  const router = useRouter();

  const handleAnalysis = (testId: string) => {
    router.push(`/analysis/${testId}/`);
  }


  const getScoreIcon = (percentile: number) => {
    if (percentile >= 90) return <Award className="w-5 h-5 text-green-600" />;
    if (percentile >= 80) return <TrendingUp className="w-5 h-5 text-yellow-600" />;
    return <Check className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div>
      {allResults && (
        <div className="mb-4">
          <h1 className="text-lg font-bold text-gray-900 mb-1">Your Recent Test Results</h1>
          <p className="text-gray-600 text-sm" >View and analyze all your completed tests</p>
        </div>
      )}
      <div className="p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transformedResults?.length > 0 ? transformedResults?.map((result) => (
            <div key={result.id} className={`bg-white border rounded-lg overflow-hidden shadow-sm ${
              result.percentile >= 90 ? 'bg-green-50 border-green-200' :
              result.percentile >= 80 ? 'bg-yellow-50 border-yellow-200' :
              result.percentile >= 70 ? 'bg-blue-50 border-blue-200' :
              'border-gray-200'
            }`}>
              {/* Badge */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 p-2">
                  <div className={`flex items-center gap-1 ${
                    result.percentile >= 90 ? 'text-green-600' :
                    result.percentile >= 80 ? 'text-yellow-600' :
                    result.percentile >= 70 ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {getScoreIcon(result.percentile)}
                    <span className="text-xs font-medium">
                      {result.percentile >= 90 ? 'Excellent' :
                       result.percentile >= 80 ? 'Good' :
                       result.percentile >= 70 ? 'Average' : 'Needs Work'}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1 text-xs font-semibold rounded-bl-lg rounded-tr-lg rounded-br-none rounded-tl-none
                  ${result.type === ExamType.FULL_LENGTH ? 'bg-blue-500 text-white' :
                  result.type === ExamType.SUBJECT_WISE ? 'bg-green-500 text-white' :
                  result.type === ExamType.CHAPTER_WISE ? 'bg-yellow-500 text-white' :
                  result.type === ExamType.ONBOARDING ? 'bg-gray-500 text-white' :
                  result.type === ExamType.CUSTOM ? 'bg-gray-500 text-white' :
                  result.type === ExamType.SIMULATION ? 'bg-gray-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {TextFormator(result.type)}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-base font-medium text-gray-900 mb-1">{result.title}</h3>
                <p className="text-sm text-gray-600 mb-4">Completed on {result.completedDate}</p>

                <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Info size={16} className="mr-2 flex-shrink-0" />
                    Score: {result.scoreRaw}
                  </div>
                  <div className="flex items-center">
                    <TrendingUp size={16} className="mr-2 flex-shrink-0" />
                    Performance: {result.percentile.toFixed(1)}%
                  </div>
                  <div className="flex items-center">
                    <Award size={16} className="mr-2 flex-shrink-0" />
                    {result.totalMarks} total marks
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Performance</span>
                    <span>{result.percentile.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        result.percentile >= 90 ? 'bg-green-500' :
                        result.percentile >= 80 ? 'bg-yellow-500' :
                        result.percentile >= 70 ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${Math.min(result.percentile, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAnalysis(result?.id)}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    View Analysis
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hidden"
                  >
                    Review
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Info size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No test results yet</h3>
              <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">
                Complete your first test to see your results and track your progress here.
              </p>
              <Link 
                href="/tests" 
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm font-medium"
              >
                Take Your First Test
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {!allResults && transformedResults?.length > 0 && (
        <div className="mt-4 text-center">
          <Link 
            href="/tests/results" 
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-200"
          >
            View All Test Results
            <TrendingUp size={16} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentTestResults;

                