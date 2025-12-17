"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { testQuestion } from '@/types/typeAdmin';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/common-ui';
import { Trash2, Check, GripVertical, Search, Filter, Eye } from 'lucide-react';
import { Badge } from '@repo/common-ui';
import { Input } from '@repo/common-ui';
import { Separator } from '@repo/common-ui';
import Questionset from '@/components/questions/QuestionTable';
import QuestionViewDialog from './QuestionViewDialog';

interface OptimizedQuestionSelectorProps {
  isEditing?: boolean;
  selectedQuestions: testQuestion[];
  onQuestionsChange: (questions: testQuestion[]) => void;
  maxQuestions: number;
  examCode: string;
}

interface SelectedQuestion {
  id: string;
  title: string;
  slug?: string;
}

const OptimizedQuestionSelector: React.FC<OptimizedQuestionSelectorProps> = ({
  selectedQuestions,
  onQuestionsChange,
  maxQuestions,
  examCode,
  isEditing = false,
}) => {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [questionFilter, setQuestionFilter] = useState<"all" | "my-questions">("my-questions");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [questionSlugMap, setQuestionSlugMap] = useState<Map<string, string>>(new Map());
  const questionTableKey = useMemo(() => `question-table-${examCode}`, [examCode]);

  const memoizedSelectedQuestions = useMemo(() =>
    selectedQuestions.map((q) => ({
      id: q.id,
      title: q.title || "Unknown Question"
    })), [selectedQuestions]);

  const filteredSelectedQuestions = useMemo(() => {
    if (!searchTerm) return selectedQuestions;
    return selectedQuestions.filter(q =>
      q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedQuestions, searchTerm]);

  const removeQuestion = useCallback((questionId: string) => {
    onQuestionsChange(
      selectedQuestions.filter((q) => q.id !== questionId)
    );
  }, [selectedQuestions, onQuestionsChange]);

  const getQuestionTitle = useCallback((questionId: string) => {
    const question = selectedQuestions.find((q) => q.id === questionId);
    return question ? question.title || "Unknown Question" : "Unknown Question";
  }, [selectedQuestions]);

  const handleDragStart = useCallback((index: number) => {
    setDraggedItemIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
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
  }, [draggedItemIndex, selectedQuestions, onQuestionsChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedItemIndex(null);
  }, []);

  const handleQuestionSelect = useCallback((questions: SelectedQuestion[]) => {
    const uniqueMap = new Map<string, SelectedQuestion>();
    const slugMap = new Map<string, string>();
    
    questions.forEach((q) => {
      if (!uniqueMap.has(q.id)) {
        uniqueMap.set(q.id, q);
        
        const slug = q.slug;
        if (slug && typeof slug === 'string') {
          slugMap.set(q.id, slug);
        }
      }
    });
    
    const limited = Array.from(uniqueMap.values())
      .slice(0, Math.max(0, maxQuestions))
      .map((q) => ({ id: q.id, title: q.title }));
    
    setQuestionSlugMap(slugMap);
    onQuestionsChange(limited);
  }, [maxQuestions, onQuestionsChange]);

  const clearAllQuestions = useCallback(() => {
    onQuestionsChange([]);
  }, [onQuestionsChange]);

  const handleViewQuestion = useCallback((questionId: string) => {
    setSelectedQuestionId(questionId);
    setIsPreviewOpen(true);
  }, []);

  const progressPercentage = (selectedQuestions.length / maxQuestions) * 100;
  const isComplete = selectedQuestions.length === maxQuestions;

  return (
    <div className="space-y-4">
      {/* Question Bank Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={showQuestionBank ? "default" : "outline"}
            size="sm"
            onClick={() => setShowQuestionBank(!showQuestionBank)}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {showQuestionBank ? "Hide" : "Show"} Question Bank
          </Button>
          {showQuestionBank && (
          <Select
            onValueChange={(value) => setQuestionFilter(value as "all" | "my-questions")}
            value={questionFilter}
            
          >
            <SelectTrigger className="w-24 text-sm">
              <SelectValue placeholder="My Questions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="my-questions">My Questions</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isComplete ? "default" : "outline"}
            className={isComplete ? "bg-green-500 text-white" : ""}
          >
            {selectedQuestions.length} / {maxQuestions}
          </Badge>
          {selectedQuestions.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllQuestions}
              className="text-red-500 hover:text-red-700"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-primary'
            }`}
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>

      {/* Question Bank */}
      {showQuestionBank && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Select Questions from Bank</span>
          </div>

          <Questionset
            key={questionTableKey}
            onSelectedQuestionsChange={handleQuestionSelect}
            selectedQuestions={memoizedSelectedQuestions}
            isCheckBox={true}
            isPublished={true}
            examCode={examCode}
            questionFilter={questionFilter as "all" | "my-questions"}
          />
        </div>
      )}

      <Separator />

      {/* Selected Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center gap-2">
            Selected Questions
            {isComplete && <Check className="h-4 w-4 text-green-500" />}
          </h4>

          {selectedQuestions.length > 5 && (
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search selected questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 h-8"
              />
            </div>
          )}
        </div>

        {filteredSelectedQuestions.length > 0 ? (
          <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
            {filteredSelectedQuestions.map((question, index) => {
              const originalIndex = selectedQuestions.findIndex(q => q.id === question.id);
              return (
                <div
                  key={question.id}
                  className={`p-3 hover:bg-slate-50 flex justify-between items-center transition-colors ${draggedItemIndex === originalIndex ? "bg-slate-100" : ""
                    }`}
                  draggable={true}
                  onDragStart={() => handleDragStart(originalIndex)}
                  onDragOver={(e) => handleDragOver(e, originalIndex)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center flex-1 gap-3">
                    <div className="cursor-move text-gray-400 hover:text-gray-600">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {originalIndex + 1}
                      </Badge>
                      <span 
                        className="text-sm truncate flex-1 cursor-pointer hover:text-primary"
                        onClick={() => handleViewQuestion(question.id)}
                        title="Click to view question details"
                      >
                        {getQuestionTitle(question.id)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewQuestion(question.id)}
                      className="h-8 w-8 p-0 text-primary-500 hover:text-primary-700"
                      title="View question details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      title="Remove question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : selectedQuestions.length > 0 && searchTerm ? (
          <div className="text-center py-4 text-muted-foreground">
            No questions match your search
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <div className="space-y-2">
              <p className="text-muted-foreground">No questions selected yet</p>
              <p className="text-sm text-muted-foreground">
                Click "Show Question Bank" above to select questions
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {selectedQuestions.length > 0 && (
        <div className="bg-secondary/20 p-3 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isComplete ? (
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Section complete
                </span>
              ) : (
                `${maxQuestions - selectedQuestions.length} more questions needed`
              )}
            </span>
            <span className="font-medium">
              {selectedQuestions.length} selected
            </span>
          </div>
        </div>
      )}

      <QuestionViewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        questionId={selectedQuestionId}
        questionSlugMap={questionSlugMap}
      />
    </div>
  );
};

export default OptimizedQuestionSelector;
