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
          title: "Question added successfully",
          variant: "default",
          duration: 3000,
          className: "bg-gray-100 text-gray-800",
        })
        
        route.push('/admin/questions');
      }
      else {
        toast({
          title: "Failed to add question",
          variant: "default",
          duration: 3000,
          className: "bg-red-500 text-white",
        })
        
      }

    } catch (error) {
      console.error('Failed to create question');
    } finally {
      setLoading(false);
    }
  };


  return (

    <>
      <QuestionForm
        onSave={handleSave}
        onCancel={() => { route.push('/admin/questions'); }}
        loading={loading}
      />
    </>
  )
}

export default QuestionAdd