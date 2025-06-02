"use client"
import QuestionForm from '@/components/admin/questions/QuestionForm';
import Loading from '@/components/Loading';
import { toast } from '@/hooks/use-toast';
import { getQuestionBySlug, updateQuestion } from '@/services/question.service';
import { Question } from '@/types/typeAdmin';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, {  useState } from 'react'

const EditQuestion = ({ params }: { params: { id: string } }) => {
    const { id } = params;
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: question, isLoading, isError } = useQuery({
        queryKey: ["question", id],
        queryFn: () => getQuestionBySlug(id),
        enabled: !!id,
        retry: 2,
        staleTime: 5 * 60 * 1000,
    });
    if (!isLoading && !isError && !question) {
        router.push("/admin/questions");
        return null;
    }

    const handleSave = async (questionData: Partial<Question>) => {
        if (!id) return;
        try {
            setLoading(true);
           const res =  await updateQuestion(id, questionData);
            if(!res.success){
                toast({
                    type: "foreground",
                    description: res.message,
                });
                return;
            }
            toast({
                type: "foreground",
                description: "Question updated successfully",
            });

            router.push("/admin/questions");

        } catch (error) {
            toast({
                type: "foreground",
                description: "Failed to update question",
            });

        }
        finally {
            setLoading(false);
        }

    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Edit Question</h2>
                <p className="text-gray-500">Update question details</p>
                {
                    !isLoading ? (
                        <QuestionForm
                            initialQuestion={question.data}
                            onSave={handleSave}
                            onCancel={() => router.push('/admin/questions')}
                            loading={loading}
                        />
                    ) : (
                        <Loading />
                    )
                }

            </div>
        </div>
    )
}

export default EditQuestion