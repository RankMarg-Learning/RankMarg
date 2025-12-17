"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/common-ui';
import MarkdownRenderer from '@/lib/MarkdownRenderer';
import { QuestionType } from '@repo/db/enums';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { getQuestionBySlug } from '@/services/question.service';
import { useToast } from '@/hooks/use-toast';

interface QuestionData {
  id: string;
  title: string;
  slug?: string;
  type: string;
  format?: string;
  content: string;
  difficulty?: number;
  category?: string[];
  topic?: { name: string };
  solution?: string;
  hint?: string;
  strategy?: string;
  commonMistake?: string;
  isNumerical?: number;
  questionTime?: number;
  pyqYear?: string;
  book?: string;
  isPublished?: boolean;
  options?: Array<{
    id?: string;
    content: string;
    isCorrect: boolean;
  }>;
}

interface QuestionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string | null;
  questionSlugMap?: Map<string, string>;
}

export const QuestionViewDialog: React.FC<QuestionViewDialogProps> = ({
  open,
  onOpenChange,
  questionId,
  questionSlugMap,
}) => {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!open || !questionId) {
        setQuestion(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      setQuestion(null);

      try {
        // Get slug from map or use questionId as slug
        const slug = questionSlugMap?.get(questionId) || questionId;
        const response = await getQuestionBySlug(slug);

        if (response && response.success !== false && response.data) {
          setQuestion(response.data as QuestionData);
        } else {
          const errorMessage = response?.message || "Question not found. Please ensure the question exists.";
          setError(errorMessage);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        const errorMessage = error?.message || "Error fetching question";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [open, questionId, questionSlugMap, toast]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuestion(null);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {loading ? 'Loading Question...' : question?.title || 'Question Details'}
          </DialogTitle>
          <DialogDescription>
            {loading ? 'Fetching question data...' : 'View complete question content, options, and correct answer'}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading question details...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-destructive mb-4" />
            <p className="text-destructive font-medium mb-2">Error loading question</p>
            <p className="text-muted-foreground text-sm text-center">{error}</p>
          </div>
        )}

        {!loading && !error && question && (
          <div className="space-y-6 mt-4">
            {/* Question Content */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Question Content
              </h3>
              <div className="p-4 bg-white rounded-md border border-gray-200 shadow-sm">
                {question.content ? (
                  <MarkdownRenderer content={question.content} />
                ) : (
                  <p className="text-gray-500 italic">No content provided</p>
                )}
              </div>
            </div>

            {/* Options for Multiple Choice Questions */}
            {question.type === QuestionType.MULTIPLE_CHOICE && question.options && question.options.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Options
                <span className="text-sm font-normal text-gray-500">
                  ({question.options.length} options)
                </span>
              </h3>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div
                    key={option.id || index}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      option.isCorrect
                        ? 'bg-green-50 border-green-300 shadow-sm'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold flex-shrink-0 ${
                          option.isCorrect
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <MarkdownRenderer content={option.content} />
                      </div>
                      {option.isCorrect && (
                        <div className="flex items-center gap-1 text-green-600 font-medium text-sm flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Correct</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Answer for Integer Type Questions */}
          {question.type === QuestionType.INTEGER && question.isNumerical !== undefined && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Correct Answer
              </h3>
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <p className="text-blue-800 font-semibold text-lg">
                    {question.isNumerical}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Solution */}
          {question.solution && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Solution</h3>
              <div className="p-4 bg-white rounded-md border border-gray-200 shadow-sm">
                <MarkdownRenderer content={question.solution} />
              </div>
            </div>
          )}

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuestionViewDialog;
