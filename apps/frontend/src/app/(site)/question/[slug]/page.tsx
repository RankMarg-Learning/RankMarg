"use client";
import QuestionUI from '@/components/QuestionUI';
import { useQuery } from '@tanstack/react-query';
import QuestionUISkeleton from '@/components/QuestionUISkeleton';
import { attempDataProps } from '@/types';
import { getQuestionBySlug } from '@/services/question.service';
import { addAttempt } from '@/services';
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';



const QuestionPage = ({ params }: { params: { slug: string } }) => {
  

  const { slug } = params;
  const { data: question, isLoading } = useQuery({
    queryKey: queryKeys.questions.bySlug(slug),
    queryFn: () => getQuestionBySlug(slug),
    ...getQueryConfig('DYNAMIC'),
  });


  const handleAttempt = async (attemptData: attempDataProps) => {
    try {
      const response = await addAttempt({ attemptData });
      if (!response.success) {
        console.error("Failed to submit attempt")
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!question?.success) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">{question?.message}</h1>
      </div>
    )
  }


  return (
    <div>
      {
        isLoading ? (
          <QuestionUISkeleton />
        ) : (
          <QuestionUI question={question.data}
            handleAttempt={handleAttempt}
            // isSolutionShow={isSolutionShow}
          />
        )
      }
    </div>
  );
};



export default QuestionPage;
