// src/hooks/useAddQuestion.ts

//! Not in Use 

import { addQuestions } from "@/services/question.service";
import { Question } from "@/types/typeAdmin";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAddQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (question:Partial<Question>) => addQuestions(question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};
