import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/common-ui";
import MarkdownRenderer from "@/lib/MarkdownRenderer";
import { QuestionType } from "@repo/db/enums";
import { TextFormator } from "@/utils/textFormator";
import { UseFormWatch } from "react-hook-form";
import { Question } from "@/types/typeAdmin";

interface QuestionPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  watch: UseFormWatch<Question>;
}

export const QuestionPreviewDialog = ({ open, onOpenChange, watch }: QuestionPreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Preview</DialogTitle>
          <DialogDescription>
            Preview of all renderable content in your question
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Question Title</h3>
            <div className="p-3 bg-gray-50 rounded-md border">
              <p className="text-gray-800">{watch("title") || "No title provided"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Question Content</h3>
            <div className="p-4 bg-white rounded-md border">
              {watch("content") ? (
                <MarkdownRenderer content={watch("content")} />
              ) : (
                <p className="text-gray-500 italic">No content provided</p>
              )}
            </div>
          </div>

          {watch("type") === QuestionType.MULTIPLE_CHOICE && watch("options")?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Options</h3>
              <div className="space-y-3">
                {watch("options").map((option, index) => (
                  <div key={index} className={`p-3 rounded-md border ${option.isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${option.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <div className="flex-1">
                        <MarkdownRenderer content={option.content} />
                      </div>
                      {option.isCorrect && (
                        <span className="text-green-600 font-medium text-sm">✓ Correct</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {watch("type") === QuestionType.INTEGER && watch("isNumerical") && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Correct Answer</h3>
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-blue-800 font-medium">{watch("isNumerical")}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Solution</h3>
            <div className="p-4 bg-white rounded-md border">
              {watch("solution") ? (
                <MarkdownRenderer content={watch("solution")} />
              ) : (
                <p className="text-gray-500 italic">No solution provided</p>
              )}
            </div>
          </div>

          {watch("strategy") && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Strategy</h3>
              <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <MarkdownRenderer content={watch("strategy")} />
              </div>
            </div>
          )}

          {watch("hint") && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Hint</h3>
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <MarkdownRenderer content={watch("hint")} />
              </div>
            </div>
          )}

          {watch("commonMistake") && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Common Mistakes</h3>
              <div className="p-3 bg-red-50 rounded-md border border-red-200">
                <MarkdownRenderer content={watch("commonMistake")} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Question Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-md border">
              <div>
                <p className="text-sm font-medium text-gray-600">Type</p>
                <p className="text-sm text-gray-800">{TextFormator(watch("type"))}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Difficulty</p>
                <p className="text-sm text-gray-800">
                  {watch("difficulty") === 1 && "Easy"}
                  {watch("difficulty") === 2 && "Medium"}
                  {watch("difficulty") === 3 && "Hard"}
                  {watch("difficulty") === 4 && "Very Hard"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Time</p>
                <p className="text-sm text-gray-800">{watch("questionTime")} min</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-sm text-gray-800">
                  {watch("isPublished") ? "Published" : "Draft"}
                </p>
              </div>
            </div>
          </div>

          {watch("category")?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {watch("category").map((cat, index) => (
                  <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                    {TextFormator(cat)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(watch("pyqYear") || watch("book")) && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">References</h3>
              <div className="space-y-2">
                {watch("pyqYear") && (
                  <div className="p-2 bg-gray-50 rounded border">
                    <p className="text-sm font-medium text-gray-600">PYQ Year</p>
                    <p className="text-sm text-gray-800">{watch("pyqYear")}</p>
                  </div>
                )}
                {watch("book") && (
                  <div className="p-2 bg-gray-50 rounded border">
                    <p className="text-sm font-medium text-gray-600">Book Reference</p>
                    <p className="text-sm text-gray-800">{watch("book")}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
