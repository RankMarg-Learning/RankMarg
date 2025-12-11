import { useRef } from "react";
import { Button } from "@repo/common-ui";
import { Label } from "@repo/common-ui";
import { Switch } from "@repo/common-ui";
import { Textarea } from "@repo/common-ui";
import { PlusCircle, Trash2, Upload, Loader2 } from "lucide-react";
import { UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import { Question } from "@/types/typeAdmin";
import MarkdownRenderer from "@/lib/MarkdownRenderer";

interface QuestionOptionsSectionProps {
  watch: UseFormWatch<Question>;
  setValue: UseFormSetValue<Question>;
  errors: FieldErrors<Question>;
  optionRefs: { [key: number]: React.RefObject<HTMLTextAreaElement> };
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onUpdateOption: (index: number, field: "content" | "isCorrect", value: string | boolean) => void;
  onOptionContentChange: (index: number, value: string) => void;
  onOptionDragOver: (e: React.DragEvent, index: number) => void;
  onOptionDragLeave: (e: React.DragEvent, index: number) => void;
  onOptionDrop: (e: React.DragEvent, index: number) => void;
  onFileSelect: (file: File, fieldName: string) => void;
  isUploading: boolean;
}

export const QuestionOptionsSection = ({
  watch,
  setValue,
  errors,
  optionRefs,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onOptionContentChange,
  onOptionDragOver,
  onOptionDragLeave,
  onOptionDrop,
  onFileSelect,
  isUploading,
}: QuestionOptionsSectionProps) => {
  const options = watch("options") || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          Options <span className="text-red-500">*</span>
        </Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddOption} className="flex items-center gap-1 h-8">
          <PlusCircle className="h-3 w-3" /> Add Option
        </Button>
      </div>

      {options.length > 0 ? (
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="border rounded p-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Option {index + 1}</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={option.isCorrect}
                        onCheckedChange={(checked) => onUpdateOption(index, "isCorrect", checked)}
                      />
                      <span className="text-xs">Correct</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveOption(index)}
                      className="text-red-500 h-7 w-7"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Textarea
                    ref={optionRefs[index]}
                    value={option.content}
                    onChange={(e) => onOptionContentChange(index, e.target.value)}
                    placeholder={`Enter option ${index + 1} content... You can drag and drop images here or use the upload button.`}
                    rows={1}
                    className="border border-gray-300 transition-all duration-200"
                    onDragOver={(e) => onOptionDragOver(e, index)}
                    onDragLeave={(e) => onOptionDragLeave(e, index)}
                    onDrop={(e) => onOptionDrop(e, index)}
                  />
                  <div className="absolute top-2 right-2">
                    <input
                      type="file"
                      id={`image-upload-option-${index}`}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onFileSelect(file, `option-${index}`);
                        }
                        if (e.target) {
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor={`image-upload-option-${index}`}
                      className={`cursor-pointer inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors ${
                        isUploading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-primary-500 hover:bg-primary-600"
                      } text-white`}
                      title={isUploading ? "Uploading..." : "Upload image"}
                    >
                      {isUploading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                    </label>
                  </div>
                </div>

                <div className="rounded p-1 flex items-center gap-2 bg-gray-50">
                  <Label className="text-xs text-gray-600 block font-bold">Preview:</Label>
                  <MarkdownRenderer content={option.content} className="text-sm" />
                </div>

                {errors.options?.[index]?.content && (
                  <p className="text-red-500 text-xs">{errors.options[index].content.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 border-2 border-dashed rounded border-gray-300 bg-gray-50">
          <p className="text-gray-500 text-sm">No options added yet.</p>
          <Button type="button" variant="ghost" size="sm" onClick={onAddOption} className="flex items-center gap-1 mx-auto h-7 mt-2">
            <PlusCircle className="h-3 w-3" /> Add option
          </Button>
        </div>
      )}

      {errors.options?.root?.message && (
        <p className="text-red-500 text-xs bg-red-50 p-2 rounded border border-red-200">
          {errors.options.root.message}
        </p>
      )}
    </div>
  );
};
