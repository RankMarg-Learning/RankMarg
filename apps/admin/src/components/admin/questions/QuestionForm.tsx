"use client"
import React, { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@repo/common-ui";
import { Input } from "@repo/common-ui";
import { Textarea } from "@repo/common-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/common-ui";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/common-ui";
import { Save, RefreshCw, Eye, Upload, Loader2 } from "lucide-react";
import { Switch } from "@repo/common-ui";
import { Label } from "@repo/common-ui";
import { QCategory, Question, QuestionFormat } from "@/types/typeAdmin";
import { QuestionType, Role } from "@repo/db/enums";
import MarkdownRenderer from "@/lib/MarkdownRenderer";
import { useSubtopics } from "@/hooks/useSubtopics";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateSlug } from "@/lib/generateSlug";
import { TextFormator } from "@/utils/textFormator";
import { CategoryMultiSelect } from "./CategoryMultiSelect";
import { SearchableSelect } from "@repo/common-ui";
import { useUserData } from "@/context/ClientContextProvider";
import { useImageUpload } from "@/hooks/useImageUpload";
import { replaceLatexDelimiters as replaceLatex } from "@/utils/questionUtils";
import { QuestionPreviewDialog } from "./QuestionPreviewDialog";
import { QuestionOptionsSection } from "./QuestionOptionsSection";

interface QuestionFormProps {
  initialQuestion?: Question;
  onSave: (question: Partial<Question>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const questionSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters long"),
  content: z.string().min(10, "Question content must be at least 10 characters long"),
  type: z.enum(Object.values(QuestionType) as [string, ...string[]]),
  format: z.enum(
    Object.values(QuestionFormat) as [string, ...string[]]).optional(),
  difficulty: z.number().min(1, "Difficulty must be at least 1").max(4, "Difficulty cannot exceed 4"),
  subjectId: z.string().min(1, "Subject is required"),
  topicId: z.string().min(1, "Topic is required"),
  subtopicId: z.string().min(1, "Subtopic is required"),
  category: z
    .array(z.nativeEnum(QCategory))
    .min(1, "At least one category is required"),
  pyqYear: z.string().optional(),
  book: z.string().optional(),
  hint: z.string().optional(),
  solution: z.string().min(1, "Solution is required"),
  strategy: z.string().optional(),
  commonMistake: z.string().optional(),
  questionTime: z.number().min(1, "Time to answer must be at least 1 minute"),
  isNumerical: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  isPublished: z.boolean().default(true),
  options: z
    .array(
      z.object({
        id: z.string().optional(),
        content: z.string().min(1, "Option cannot be empty"),
        isCorrect: z.boolean(),
      })
    )
    .optional()
    .or(z.literal(undefined))
    .refine(
      (options) => {
        if (!options || options.length === 0) return true;
        return options.some(option => option.isCorrect);
      },
      {
        message: "At least one option must be marked as correct",
      }
    ),
})

const QuestionForm = ({ initialQuestion, onSave, onCancel, loading }: QuestionFormProps) => {
  const { toast } = useToast();
  const { user } = useUserData();
  const isEditing = !!initialQuestion;
  const isInstructor = user?.role === Role.INSTRUCTOR;
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const solutionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localContent, setLocalContent] = useState("");
  const [localSolution, setLocalSolution] = useState("");
  const [optionRefs, setOptionRefs] = useState<{ [key: number]: React.RefObject<HTMLTextAreaElement> }>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: initialQuestion || {
      slug: "",
      title: "",
      content: "",
      type: QuestionType.MULTIPLE_CHOICE,
      format: QuestionFormat.SINGLE_SELECT,
      difficulty: 1,
      subjectId: "",
      topicId: "",
      subtopicId: "",
      category: [],
      pyqYear: "",
      book: "",
      hint: "",
      solution: "",
      commonMistake: "",
      questionTime: 1,
      isNumerical: undefined,
      isPublished: false,
      options: [],
    },
  });

  const { subtopics: allSubtopics, isLoading: isLoadingSubtopics } = useSubtopics();

  const insertImageAtCursor = (imageMarkdown: string, fieldName?: string) => {
    let targetRef: React.RefObject<HTMLTextAreaElement> | undefined;
    
    if (fieldName === 'content') {
      targetRef = contentTextareaRef;
    } else if (fieldName === 'solution') {
      targetRef = solutionTextareaRef;
    } else if (fieldName?.startsWith('option-')) {
      const optionIndex = parseInt(fieldName.split('-')[1]);
      targetRef = optionRefs[optionIndex];
    }

    const textarea = targetRef?.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = textarea.value || "";
    const newContent = currentContent.substring(0, start) + imageMarkdown + currentContent.substring(end);

    textarea.value = newContent;

    if (fieldName === 'content') {
      setLocalContent(newContent);
      setValue("content", newContent, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      trigger("content");
    } else if (fieldName === 'solution') {
      setLocalSolution(newContent);
      setValue("solution", newContent, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      trigger("solution");
    } else if (fieldName?.startsWith('option-')) {
      const optionIndex = parseInt(fieldName.split('-')[1]);
      const options = getValues("options") || [];
      if (options[optionIndex]) {
        options[optionIndex] = { ...options[optionIndex], content: newContent };
        setValue("options", options, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
        trigger("options");
      }
    }

    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    textarea.dispatchEvent(inputEvent);
    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    textarea.dispatchEvent(changeEvent);

    const newCursorPos = start + imageMarkdown.length;
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 100);
  };

  const { uploadImage, isUploading } = useImageUpload({
    onImageInserted: insertImageAtCursor,
    getFormValue: getValues,
  });

  const handleImageUploadForField = async (file: File, targetRef?: React.RefObject<HTMLTextAreaElement>, fieldName?: string) => {
    await uploadImage(file, fieldName);
  };

  const replaceLatexDelimiters = () => {
    const fields = ['content', 'hint', 'solution', 'commonMistake', 'strategy'] as const;

    fields.forEach(fieldName => {
      const currentValue = getValues(fieldName);
      if (currentValue && typeof currentValue === 'string') {
        const updatedValue = replaceLatex(currentValue);
        setValue(fieldName, updatedValue);

        if (fieldName === 'content') {
          setLocalContent(updatedValue);
        } else if (fieldName === 'solution') {
          setLocalSolution(updatedValue);
        }
      }
    });

    const currentOptions = getValues("options");
    if (currentOptions && Array.isArray(currentOptions)) {
      const updatedOptions = currentOptions.map(option => {
        if (option.content && typeof option.content === 'string') {
          return { ...option, content: replaceLatex(option.content) };
        }
        return option;
      });
      setValue("options", updatedOptions);
    }

    toast({
      title: "LaTeX delimiters replaced successfully!",
      variant: "default",
      duration: 500,
      className: "bg-green-500 text-white",
    });
  };

  useEffect(() => {
    const options = watch("options") || [];
    const newRefs: { [key: number]: React.RefObject<HTMLTextAreaElement> } = {};
    options.forEach((_, index) => {
      newRefs[index] = optionRefs[index] || React.createRef<HTMLTextAreaElement>();
    });
    setOptionRefs(newRefs);
  }, [watch("options")]);

  useEffect(() => {
    if (initialQuestion?.content) {
      setLocalContent(initialQuestion.content);
    }
    if (initialQuestion?.solution) {
      setLocalSolution(initialQuestion.solution);
    }
  }, [initialQuestion?.content, initialQuestion?.solution]);

  useEffect(() => {
    if (initialQuestion) {
      reset(initialQuestion);
    }
  }, [initialQuestion, reset]);

  useEffect(() => {
    const title = watch("title");
    if (title && !initialQuestion) {
      const slug = generateSlug(title);
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [watch("title"), !initialQuestion]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'content') {
        if (value.content !== localContent) {
          setLocalContent(value.content || "");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, localContent]);

  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes('mac'));
  }, []);

  useEffect(() => {
    if (isInstructor) {
      setValue("isPublished", false);
    }
  }, [isInstructor, setValue]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleSaveWithPublish();
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setIsPreviewOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSubtopicChange = (subtopicId: string) => {
    if (allSubtopics) {
      const selectedSubtopic = allSubtopics.find(st => st.id === subtopicId);
      if (selectedSubtopic && selectedSubtopic.topic && selectedSubtopic.topic.subject) {
        setValue("topicId", selectedSubtopic.topic.id);
        setValue("subjectId", selectedSubtopic.topic.subject.id);
      }
    }
    setValue("subtopicId", subtopicId);
  };

  const onSubmit = (data: Partial<Question>) => {
    if (isInstructor) {
      data.isPublished = false;
    }
    if (!isEditing) {
      data.createdAt = new Date().toISOString();
    }
    onSave(data);
  };

  const handleSaveWithPublish = async () => {
    try {
      const isValid = await trigger();
      
      if (!isValid) {
        toast({
          title: "Please fix validation errors before saving",
          variant: "default",
          duration: 3000,
          className: "bg-red-500 text-white",
        });
        return;
      }

      const formData = getValues();
      const dataWithPublish = {
        ...formData,
        isPublished: isInstructor ? false : true
      };

      toast({
        title: "Saving and publishing question...",
        variant: "default",
        duration: 2000,
        className: "bg-blue-500 text-white",
      });

      onSave(dataWithPublish);

    } catch (error) {
      console.error('Error saving with publish:', error);
      toast({
        title: "Error saving question",
        variant: "default",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
    }
  };

  const addOption = () => {
    const options = getValues("options") || [];
    if (options.length >= 4) {
      toast({
        title: "Maximum options reached!!",
        variant: "default",
        duration: 500,
        className: "bg-red-500 text-white",
      })
      return;
    }
    setValue("options", [...options, { content: "", isCorrect: false }]);
  };

  const removeOption = (index: number) => {
    const options = getValues("options") || [];
    options.splice(index, 1);
    setValue("options", options);
  };

  const updateOption = (index: number, field: "content" | "isCorrect", value: string | boolean) => {
    const options = getValues("options") || [];
    options[index] = { ...options[index], [field]: value };
    setValue("options", options);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalContent(value);
    setValue("content", value);
  };

  const handleOptionContentChange = (index: number, value: string) => {
    const options = getValues("options") || [];
    options[index] = { ...options[index], content: value };
    setValue("options", options);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith("image/"));

    if (imageFile) {
      handleImageUploadForField(imageFile, contentTextareaRef, "content");
    } else {
      toast({
        title: "Please drop an image file",
        variant: "default",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
    }
  };

  const handleSolutionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSolutionDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSolutionDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith("image/"));

    if (imageFile) {
      handleImageUploadForField(imageFile, solutionTextareaRef, "solution");
    } else {
      toast({
        title: "Please drop an image file",
        variant: "default",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
    }
  };

  const handleOptionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleOptionDragLeave = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleOptionDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith("image/"));

    if (imageFile) {
      handleImageUploadForField(imageFile, optionRefs[index], `option-${index}`);
    } else {
      toast({
        title: "Please drop an image file",
        variant: "default",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isEditing ? "Edit Question" : "Add New Question"}</CardTitle>
              <CardDescription>
                {isEditing
                  ? "Update the question details below"
                  : "Fill in the details to create a new question"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border">
                <div className="flex items-center gap-1">
                  <kbd className="text-xs">
                    {isMac ? '⌘' : 'Ctrl'}
                  </kbd> + <kbd className="text-xs">Shift</kbd> + <kbd className="text-xs">S</kbd> Save & Publish
                </div>
                <div className="w-px h-3 bg-gray-300"></div>
                <div className="flex items-center gap-1">
                  <kbd className="text-xs">
                    {isMac ? '⌘' : 'Ctrl'}
                  </kbd> + <kbd className="text-xs">Shift</kbd> + <kbd className="text-xs">A</kbd> Preview
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">Question Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter the question title"
                className={`h-9 ${errors.title ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="type" className="text-sm">Question Type <span className="text-red-500">*</span></Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select Type" /></SelectTrigger>
                      <SelectContent>
                        {Object.values(QuestionType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {TextFormator(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="format" className="text-sm">Question Format <span className="text-red-500">*</span></Label>
                <Controller
                  control={control}
                  name="format"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select Format" /></SelectTrigger>
                      <SelectContent>
                        {Object.values(QuestionFormat).map((format) => (
                          <SelectItem key={format} value={format}>
                            {TextFormator(format)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.format && <p className="text-red-500 text-xs">{errors.format.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="difficulty" className="text-sm">Difficulty <span className="text-red-500">*</span></Label>
                <Controller
                  control={control}
                  name="difficulty"
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select Difficulty" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Easy</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">Hard</SelectItem>
                        <SelectItem value="4">Very Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.difficulty && <p className="text-red-500 text-xs">{errors.difficulty.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <CategoryMultiSelect control={control} errors={errors} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="questionTime" className="text-sm">Time to Answer (minutes)</Label>
                <Controller
                  name="questionTime"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="questionTime"
                      type="number"
                      min="1"
                      placeholder="Time in minutes"
                      className="h-9"
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        field.onChange(isNaN(value) ? 2 : value);
                      }}
                    />
                  )}
                />
                {errors.questionTime && <p className="text-red-500 text-xs">{errors.questionTime.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtopic" className="text-sm">Sub Topic <span className="text-red-500">*</span></Label>
            <Controller
              name="subtopicId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  onValueChange={handleSubtopicChange}
                  placeholder="Search and select subtopic"
                  options={
                    allSubtopics?.map(st => ({
                      value: st.id,
                      label: `${st.name} (${st.topic?.name} - ${st.topic?.subject?.name})`
                    })) || []
                  }
                  searchPlaceholder="Search subtopics..."
                  emptyMessage={isLoadingSubtopics ? "Loading subtopics..." : "No subtopics found"}
                />
              )}
            />
            {errors.subtopicId && <p className="text-red-500 text-xs">{errors.subtopicId.message}</p>}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm">
                  Question Content <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="content"
                    ref={contentTextareaRef}
                    value={localContent || watch("content") || ""}
                    onChange={handleContentChange}
                    placeholder="Write your question here... You can drag and drop images here or use the upload button below."
                    rows={Math.max(6, Math.ceil((localContent || (watch("content") || "")).split('\n').length / 2))}
                    className={`transition-all duration-200 ${
                      errors.content
                        ? "border-red-500"
                        : isDragOver
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-300"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  />
                  <div className="absolute top-2 right-2">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUploadForField(file, contentTextareaRef, "content");
                        }
                        if (e.target) {
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                        isUploading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-primary-500 hover:bg-primary-600"
                      } text-white`}
                      title={isUploading ? "Uploading..." : "Upload image"}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </label>
                  </div>
                  {isDragOver && (
                    <div className="absolute inset-0 bg-primary-50 border-2 border-primary-500 border-dashed rounded flex items-center justify-center pointer-events-none">
                      <div className="text-primary-600 font-medium">Drop image here</div>
                    </div>
                  )}
                </div>
                {errors.content && <p className="text-red-500 text-xs">{errors.content.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm">Question Preview</Label>
                <div className="w-full border-2 border-gray-300 min-h-36 p-2 rounded-md bg-gray-50">
                  {(localContent || watch("content")) ? (
                    <MarkdownRenderer content={localContent || watch("content") || ""} className="text-sm" />
                  ) : (
                    <div className="text-gray-400 text-sm">
                      <p>Preview your question here...</p>
                      <p className="mt-2 text-xs">💡 Tip: Drag & drop images or use the upload button to add images to your question</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {watch("type") === QuestionType.MULTIPLE_CHOICE && (
            <QuestionOptionsSection
              watch={watch}
              setValue={setValue}
              errors={errors}
              optionRefs={optionRefs}
              onAddOption={addOption}
              onRemoveOption={removeOption}
              onUpdateOption={updateOption}
              onOptionContentChange={handleOptionContentChange}
              onOptionDragOver={handleOptionDragOver}
              onOptionDragLeave={handleOptionDragLeave}
              onOptionDrop={handleOptionDrop}
              onFileSelect={(file, fieldName) => handleImageUploadForField(file, optionRefs[parseInt(fieldName.split('-')[1])], fieldName)}
              isUploading={isUploading}
            />
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="solution" className="text-sm">Solution <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Textarea
                    id="solution"
                    ref={solutionTextareaRef}
                    value={localSolution || watch("solution") || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setLocalSolution(value);
                      setValue("solution", value);
                    }}
                    placeholder="Provide a solution/explanation"
                    rows={Math.max(5, Math.ceil((localSolution || (watch("solution") || "")).split('\n').length / 2))}
                    className={`transition-all duration-200 ${
                      errors.solution ? "border-red-500" : "border-gray-300"
                    }`}
                    onDragOver={handleSolutionDragOver}
                    onDragLeave={handleSolutionDragLeave}
                    onDrop={handleSolutionDrop}
                  />
                  <div className="absolute top-2 right-2">
                    <input
                      type="file"
                      id="image-upload-solution"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUploadForField(file, solutionTextareaRef, "solution");
                        }
                        if (e.target) {
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="image-upload-solution"
                      className={`cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                        isUploading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-primary-500 hover:bg-primary-600"
                      } text-white`}
                      title={isUploading ? "Uploading..." : "Upload image"}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </label>
                  </div>
                </div>
                {errors.solution && <p className="text-red-500 text-xs">{errors.solution.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution" className="text-sm">Solution Preview</Label>
                <div className="w-full border-2 border-gray-300 min-h-28 p-2 rounded-md bg-gray-50">
                  {watch("solution") ? (
                    <MarkdownRenderer content={watch("solution")} className="text-sm" />
                  ) : (
                    <div className="text-gray-400 text-sm">
                      <p>Preview your solution here...</p>
                      <p className="mt-2 text-xs">💡 Tip: Use the upload button to add images to your solution</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="strategy" className="text-sm">Strategy</Label>
                <Textarea
                  id="strategy"
                  {...register("strategy")}
                  placeholder="Provide solving strategy or approach for this question"
                  rows={2}
                  className={`${errors.strategy ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.strategy && <p className="text-red-500 text-xs">{errors.strategy.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="hint" className="text-sm">Hint</Label>
                <Textarea
                  id="hint"
                  {...register("hint")}
                  placeholder="Provide a hint for students"
                  rows={2}
                  className={`${errors.hint ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.hint && <p className="text-red-500 text-xs">{errors.hint.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="commonMistake" className="text-sm">Common Mistakes</Label>
              <Textarea
                id="commonMistake"
                {...register("commonMistake")}
                placeholder="Common errors students make with this question"
                rows={2}
                className={`${errors.commonMistake ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.commonMistake && <p className="text-red-500 text-xs">{errors.commonMistake.message}</p>}
            </div>
          </div>

          {watch("type") === QuestionType.INTEGER && (
            <div className="space-y-2">
              <Label htmlFor="isNumerical" className="text-sm">
                Correct Numerical Answer <span className="text-red-500">*</span>
              </Label>
              <Input
                id="isNumerical"
                {...register("isNumerical", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
                type="number"
                step="any"
                placeholder="Enter the correct numerical answer"
                className={`border max-w-xs h-9 ${errors.isNumerical ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.isNumerical && <p className="text-red-500 text-xs">{errors.isNumerical.message}</p>}
            </div>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="pyqYear" className="text-sm">PYQ Year</Label>
                <Controller
                  name="pyqYear"
                  control={control}
                  rules={{
                    required: "PYQ Year is required",
                    pattern: {
                      value: /^\[.*\]\s*-\s*\d{4}$/,
                      message: "Format must be [Exam Name] - Year (e.g., [JEE Main] - 2024)"
                    }
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="pyqYear"
                      placeholder="[Exam Name] - Year"
                      className={`${errors.pyqYear ? "border-red-500" : "border-gray-300"}`}
                    />
                  )}
                />
                {errors.pyqYear && <p className="text-red-500 text-xs">{errors.pyqYear.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="book" className="text-sm">Book Reference</Label>
                <Input
                  id="book"
                  {...register("book")}
                  placeholder="e.g., HC Verma, NCERT"
                  className={`border h-9 ${errors.book ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.book && <p className="text-red-500 text-xs">{errors.book.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
              isInstructor 
                ? "bg-gray-50 border-gray-200 opacity-60 hidden" 
                : "bg-primary-50 border-primary-200"
            }`}>
              <Switch
                id="isPublished"
                checked={watch("isPublished")}
                onCheckedChange={(checked) => {
                  if (!isInstructor) {
                    setValue("isPublished", checked);
                  }
                }}
                disabled={isInstructor}
              />
              <div>
                <Label htmlFor="isPublished" className="font-medium text-sm">
                  Publish question immediately
                  {isInstructor && <span className="text-red-500 ml-1">(Instructors cannot publish)</span>}
                </Label>
                <p className="text-xs text-gray-600">
                  {isInstructor 
                    ? "Only admins can publish questions. Your question will be saved as a draft."
                    : "Make this question available to students right away"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={replaceLatexDelimiters}
              className="flex items-center gap-2 bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100"
            >
              <RefreshCw className="h-4 w-4" />
              Replace LaTeX Delimiters
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className={`hover:bg-primary-500`}>
            {
              loading ? "Saving..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Update Question" : "Save Question"}
                </>
              )
            }
          </Button>
        </CardFooter>
      </form>
      <QuestionPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        watch={watch}
      />
    </Card>
  );
};

export default QuestionForm;
