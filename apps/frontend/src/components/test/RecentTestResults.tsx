import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Info, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RawResult {
  id: string;
  score: number;
  endTime: string;
  accuracy: number;
  test: {
    title: string;
    totalMarks: number;
  };
}

interface RecentTestResultsProps {
  results: RawResult[];
  allResults?: boolean;
}

const RecentTestResults: React.FC<RecentTestResultsProps> = ({ results, allResults=false }) => {
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const transformedResults = results?.map((r) => {
    const scoreRaw = `${r.score}/${r.test.totalMarks}`;
    const scorePercentage = (r.score / r.test.totalMarks) * 100;
    const percentile = r.accuracy; 
    return {
      id: r.id,
      title: r.test.title,
      completedDate: formatDate(r.endTime),
      score: `${r.score}`,
      scoreRaw,
      scorePercentage,
      percentile,
    };
  });

  const router = useRouter();

  const handleAnalysis = (testId: string) => {
    router.push(`/analysis/${testId}/`);
  }

  return (
    <div className="md:my-6 my-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Your Recent Test Results</h2>

      <div className="p-3 flex flex-col divide-y divide-gray-100">
        {transformedResults?.length>0 ?transformedResults?.map((result) => (
          <div key={result.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="items-center gap-2 mb-2">
              <h3 className="text-base font-semibold text-gray-800 mb-2">{result.title}</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center mb-3">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm">Completed on {result.completedDate}</span>
                </div>

                <div className="flex items-center gap-1 text-gray-600">
                  <Info size={16} className="text-gray-500" />
                  <span className="text-sm">Score: {result.scoreRaw}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Check size={16} className={`${result.percentile >= 90 ? 'text-green-500' :
                      result.percentile >= 80 ? 'text-yellow-500' :
                        'text-blue-500'
                    }`} />
                  <span className={`text-sm ${result.percentile >= 90 ? 'text-green-600' :
                      result.percentile >= 80 ? 'text-yellow-600' :
                        'text-blue-600'
                    }`}>
                    Percentile: {result.percentile.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => handleAnalysis(result.id)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-md text-sm text-center"
              >
                View Analysis
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hidden"
              >
                Review Answers
              </Button>
            </div>
          </div>
        )):(
          <div className="text-center text-gray-500 py-6">
            <p>No recent test results found.</p>
          </div>
        )}
      </div>
      {
        !allResults && transformedResults?.length>0   && (
          <div className="mt-4 text-center">
            <Link href="/tests/results" className="text-primary-600 hover:text-primary-800">
              View All Test Results
            </Link>
          </div>
        )
      }

    </div>
  );
};

export default RecentTestResults;
