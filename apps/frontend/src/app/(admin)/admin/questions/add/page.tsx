"use client"
import QuestionForm from '@/components/admin/questions/QuestionForm'
import { toast } from '@/hooks/use-toast';
import { addQuestions } from '@/services/question.service';
import { Question } from '@/types/typeAdmin';
import { useRouter } from 'next/navigation';
import { useState } from 'react'

const QuestionAdd = () => {

  const route = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSave = async (questionData: Partial<Question>) => {
    setLoading(true);
    try {
      const question = await addQuestions(questionData);
      if (question.success) {
        toast({
          title: 'Question Added',
          description: 'Question has been added successfully',
        });
        route.push('/admin/questions');
      }
      else {
        toast({
          title: 'Failed',
          description: 'Failed to add question',
        });
      }

    } catch (error) {
      console.error('Failed to create question');
    } finally {
      setLoading(false);
    }
  };


  return (

    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Add New Question</h2>
        <p className="text-gray-500">Create a new question for your exams</p>
      </div>
      <QuestionForm
        onSave={handleSave}
        onCancel={() => { route.push('/admin/questions'); }}
        loading={loading}
      />
    </>
  )
}

export default QuestionAdd