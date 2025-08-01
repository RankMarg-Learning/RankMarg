"use client"
import TypeWiseTestsSkeleton from '@/components/test/TypeWiseTestsSkeleton';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { HelpCircle, Clock } from 'lucide-react'
import Link from 'next/link';
import { useEffect, useState } from 'react';

export interface Test {
  id: string;
  testId: string;
  title: string;
  subjectNumber: number;
  duration: number;
  totalQuestions: number;
  subject: 'Mathematics' | 'Physics' | 'Chemistry';
  hasAttempted: boolean;
}

 

const SubjectCard = ({ subject, tests }: { subject: string, tests: Test[] }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">{subject}</h3>
    <div className="space-y-4">
      {tests.length > 0 ? tests.map((test,idx) => (
        <Card key={test.id} className="hover:shadow-lg transition-shadow duration-300 w-full">
          <CardHeader className={`${
            subject === 'Mathematics' ? 'bg-green-100/80' :
            subject === 'Physics' ? 'bg-blue-100/80' :
            subject === 'Biology' ? 'bg-red-100/80' :
            'bg-purple-100/80'
          } rounded-t-lg p-4 space-y-2`}>
            <div className="flex flex-col space-y-2">
              <CardTitle className={`text-base ${
                subject === 'Mathematics' ? 'text-green-800' :
                subject === 'Physics' ? 'text-blue-800' :
                subject === 'Biology' ? 'text-red-800' :
                'text-purple-800'
              }`}>
                {test.title} | Subject-wise #{tests.length - idx}
              </CardTitle>
              
            </div>
          </CardHeader>
          <Separator className={
            subject === 'Mathematics' ? 'bg-green-200' :
            subject === 'Physics' ? 'bg-blue-200' :
            subject === 'Biology' ? 'bg-red-200' :
            'bg-purple-200'
          } />
          <CardContent className='space-y-4 p-6'>
            <div className="flex items-center text-muted-foreground hover:text-gray-600 transition-colors">
              <Clock className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Duration: {test.duration} mins</span>
            </div>
            <div className="flex items-center text-muted-foreground hover:text-gray-600 transition-colors">
              <HelpCircle className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">{test.totalQuestions} Questions</span>
            </div>
            {
              test.hasAttempted ? (
                <Link href={`/analysis/${test.testId}`}>
                    <Button className={`w-full bg-gray-600 hover:bg-gray-700 text-white mt-4`}>
                    View Analysis
                  </Button>
                </Link>
              ) : (
                <Link href={`/test/${test.testId}/instructions`}>
              <Button className={`w-full ${
                subject === 'Mathematics' ? 'bg-green-600 hover:bg-green-700' :
              subject === 'Physics' ? 'bg-blue-600 hover:bg-blue-700' :
              subject === 'Biology' ? 'bg-red-600 hover:bg-red-700' :
              'bg-purple-600 hover:bg-purple-700'
            } text-white mt-4 text-sm`}>
              Start Test
            </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )) : <div className='text-center text-muted-foreground text-sm'>No tests found</div>}
    </div>
  </div>
);

const SubjectWiseTests = () => {
  const [stream, setStream] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setStream(localStorage.getItem("stream"));
    }
  }, []);
  const { data: tests, isLoading, error } = useQuery({
    queryKey: ["tests", "CHAPTER_WISE"],
    queryFn: async () => {
      const { data } = await axios.get("/api/test/examtype", { params: { examType: "SUBJECT_WISE" } });
      return data;
    },
  });

  if (isLoading) return <TypeWiseTestsSkeleton />;
  if (error) return <div>Error loading tests</div>;
  if (!tests) return <div>No tests found</div>;

  const subjectTests = tests.map((test) => {
    const subject = test?.title?.split(' ')[0]?.trim();
    return { subject, ...test };
  });

  const mathTests = subjectTests.filter(test => test.subject === 'Mathematics');
  const physicsTests = subjectTests.filter(test => test.subject === 'Physics');
  const chemistryTests = subjectTests.filter(test => test.subject === 'Chemistry');
  const biologyTests = subjectTests.filter(test => test.subject === 'Biology');

  return (
    <div className='min-h-screen mx-auto p-6 max-w-7xl'>
      <h2 className="text-xl font-bold mb-8">Subject-wise Tests</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-blue-50/50 rounded-lg p-6">
          <SubjectCard key={ 1} subject="Physics" tests={physicsTests} />
        </div>
        <div className="bg-purple-50/50 rounded-lg p-6">
          <SubjectCard key={ 2} subject="Chemistry" tests={chemistryTests} />
        </div>
        {
          stream === "NEET" ? (
            <div className="bg-red-50/50 rounded-lg p-6">
              <SubjectCard key={ 3} subject="Biology" tests={biologyTests} />
            </div>
          ) : (
            <div className="bg-green-50/50 rounded-lg p-6">
            <SubjectCard key={ 4} subject="Mathematics" tests={mathTests} />
          </div>
          )
        }

          
      </div>
    </div>
  )
}

export default SubjectWiseTests