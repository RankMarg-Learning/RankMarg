"use client"
import {  useState, useMemo, useCallback } from "react";
import { testQuestion } from "@/types/typeAdmin";
import { Button } from "@repo/common-ui";
import { Trash2, Check, GripVertical} from "lucide-react";
import Questionset from "@/components/questions/QuestionTable";

interface QuestionSelectorProps {
  isEditing?: boolean;
  selectedQuestions: testQuestion[];
  onQuestionsChange: (questions: testQuestion[]) => void;
  maxQuestions: number;
  examCode: string;
}
interface SelectedQuestion {
  id: string;
  title: string;
}

const QuestionSelector = ({
  selectedQuestions,
  onQuestionsChange,
  maxQuestions,
  examCode,
}: QuestionSelectorProps) => {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  
  // Stable key that only changes when examCode changes
  const questionTableKey = useMemo(() => `question-table-${examCode}`, [examCode]);
  
  // Memoize the selected questions to prevent unnecessary re-renders
  const memoizedSelectedQuestions = useMemo(() => 
    selectedQuestions.map((q) => ({
      id: q.id,
      title: q.title
    })), [selectedQuestions]);

  const removeQuestion = (questionId: string) => {
    onQuestionsChange(
      selectedQuestions.filter((q) => q.id !== questionId)
    );
  };


  const getQuestionTitle = (questionId: string) => {
    // if(isEditing){
    //   return selectedQuestions.find((q) => q.id === questionId)?.title || "Unknown Question";
    // }
    const question = selectedQuestions.find((q) => q.id === questionId);
    return question ? question.title : "Unknown Question";
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newQuestions = [...selectedQuestions];
    const draggedItem = newQuestions[draggedItemIndex];

    if (newQuestions[index] !== draggedItem) {
      newQuestions.splice(draggedItemIndex, 1);
      newQuestions.splice(index, 0, draggedItem);
      onQuestionsChange(newQuestions);
    }

    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };


  const handleQuestionSelect = useCallback((questions: SelectedQuestion[]) => {
    const uniqueMap = new Map<string, SelectedQuestion>();
    questions.forEach((q) => {
      if (!uniqueMap.has(q.id)) uniqueMap.set(q.id, q);
    });
    const limited = Array.from(uniqueMap.values())
      .slice(0, Math.max(0, maxQuestions))
      .map((q) => ({ id: q.id, title: q.title }));
    onQuestionsChange(limited);
  }, [maxQuestions, onQuestionsChange]);

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <div className="w-full">
          <Questionset
            key={questionTableKey}
            onSelectedQuestionsChange={handleQuestionSelect}
            selectedQuestions={memoizedSelectedQuestions}
            isCheckBox={true}
            isPublished={true}
            examCode={examCode}
          />
        </div>
      </div>

      {/* Selected questions */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Selected Questions</h4>
        {selectedQuestions.length > 0 ? (
          <ul className="border rounded-md divide-y ">
            {selectedQuestions.map((question, index) => (
              <li
                key={question.id}
                className={`p-2 hover:bg-slate-50 flex justify-between items-center  ${draggedItemIndex === index ? "bg-slate-100" : ""
                  }`}
                draggable={true}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-center flex-1">
                  <div
                    className="mr-2 cursor-move"
                    title="Drag to reorder"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                  <span className="text-sm truncate w-3/4">
                    {getQuestionTitle(question.id)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                  className="h-8 w-8 p-0 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center border border-dashed rounded-md text-sm text-gray-500">
            No questions selected yet. Search above to add questions.
          </div>
        )}
      </div>

      {/* Selection counter */}
      <div className="flex justify-between items-center mt-2 text-sm">
        <span className="text-gray-500">
          {selectedQuestions.length === maxQuestions ? (
            <span className="text-green-600 flex items-center">
              <Check className="h-4 w-4 mr-1" /> Maximum questions selected
            </span>
          ) : (
            `${selectedQuestions.length} of ${maxQuestions} questions selected`
          )}
        </span>
      </div>


    </div>
  );
};

export default QuestionSelector;