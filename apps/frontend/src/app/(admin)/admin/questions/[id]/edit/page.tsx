"use client"
import QuestionForm from '@/components/admin/questions/QuestionForm';
import Loading from '@/components/Loading';
import { toast } from '@/hooks/use-toast';
import { getQuestionBySlug, updateQuestion } from '@/services/question.service';
import { Question } from '@/types/typeAdmin';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense,  useState } from 'react'

const EditQuestion = ({ params }: { params: { id: string } }) => {
    const { id } = params;
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const queryString = Array.from(searchParams.entries())
  .map(([key, value]) => `${key}=${value}`)
  .join('&');
    const backTo = queryString ? `/admin/questions?${queryString}` : '/admin/questions';
    const router = useRouter();
    const { data: question, isLoading, isError } = useQuery({
        queryKey: ["question", id],
        queryFn: () => getQuestionBySlug(id),
        enabled: !!id,
        retry: 2,
        staleTime: 5 * 60 * 1000,
    });
    if (!isLoading && !isError && !question) {
        router.push(backTo);
        return null;
    }

    const handleSave = async (questionData: Partial<Question>) => {
        if (!id) return;
        try {
            console.log("id", id);
            console.log("questionData", questionData);
            setLoading(true);
           const res =  await updateQuestion(id, questionData);
            if(!res.success){
                toast({
                    title: res.message,
                    variant: "default",
                    duration: 3000,
                    className: "bg-red-500 text-white",
                  })
                return;
            }
            toast({
                title: "Question updated successfully",
                variant: "default",
                duration: 3000,
                className: "bg-gray-100 text-gray-800",
              })

            router.push(backTo);

        } catch (error) {
            toast({
                title: "Failed to update question",
                variant: "default",
                duration: 3000,
                className: "bg-red-500 text-white",
              })

        }
        finally {
            setLoading(false);
        }

    };

    return (
        <Suspense fallback={<Loading />}>
        <div>
                {
                    !isLoading ? (
                        <QuestionForm
                            initialQuestion={question.data}
                            onSave={handleSave}
                            onCancel={() => router.push(backTo)}
                            loading={loading}
                        />
                    ) : (
                        <Loading />
                    )
                }
        </div>
        </Suspense>
    )
}

export default EditQuestion