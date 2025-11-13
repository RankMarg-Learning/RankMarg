"use client"
import React, { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Trash2, Save, Upload, Loader2, RefreshCw, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QCategory, Question, QuestionFormat } from "@/types/typeAdmin";
import { QuestionType } from "@repo/db/enums";
import MarkdownRenderer from "@/lib/MarkdownRenderer";
import { useSubtopics } from "@/hooks/useSubtopics";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateSlug } from "@/lib/generateSlug";
import { TextFormator } from "@/utils/textFormator";
import { CategoryMultiSelect } from "./CategoryMultiSelect";
import { SearchableSelect } from "@/components/ui/searchable-select";
import api from "@/utils/api";

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
  const isEditing = !!initialQuestion;
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const solutionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localContent, setLocalContent] = useState("");
  const [localSolution, setLocalSolution] = useState("");
  const [optionRefs, setOptionRefs] = useState<{ [key: number]: React.RefObject<HTMLTextAreaElement> }>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  // Function to replace LaTeX delimiters
  const replaceLatexDelimiters = () => {
    const fields = ['content', 'hint', 'solution', 'commonMistake', 'strategy'] as const;

    fields.forEach(fieldName => {
      const currentValue = getValues(fieldName);
      if (currentValue && typeof currentValue === 'string') {
        let updatedValue = currentValue;

        // Replace \[ and \] with $$
        updatedValue = updatedValue.replace(/\\\[/g, '$$');
        updatedValue = updatedValue.replace(/\\\]/g, '$$');
        // Replace \( and \) with $
        updatedValue = updatedValue.replace(/\\\(/g, '$');
        updatedValue = updatedValue.replace(/\\\)/g, '$');


        // Update the form value
        setValue(fieldName, updatedValue);

        // Update local state for content and solution
        if (fieldName === 'content') {
          setLocalContent(updatedValue);
        } else if (fieldName === 'solution') {
          setLocalSolution(updatedValue);
        }
      }
    });

    // Replace LaTeX delimiters in options
    const currentOptions = getValues("options");
    if (currentOptions && Array.isArray(currentOptions)) {
      const updatedOptions = currentOptions.map(option => {
        if (option.content && typeof option.content === 'string') {
          let updatedContent = option.content;

          // Replace \( and \) with $
          updatedContent = updatedContent.replace(/\\\(/g, '$');
          updatedContent = updatedContent.replace(/\\\)/g, '$');
          // Replace \[ and \] with $$
          updatedContent = updatedContent.replace(/\\\[/g, '$$');
          updatedContent = updatedContent.replace(/\\\]/g, '$$');


          return { ...option, content: updatedContent };
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
      isPublished: true,
      options: [],
    },
  });


  // Create refs for options when they're added
  useEffect(() => {
    const options = watch("options") || [];
    const newRefs: { [key: number]: React.RefObject<HTMLTextAreaElement> } = {};
    options.forEach((_, index) => {
      newRefs[index] = optionRefs[index] || React.createRef<HTMLTextAreaElement>();
    });
    setOptionRefs(newRefs);
  }, [watch("options")]);

  // Initialize local states when form resets
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

  // Handle hierarchical relationship when subtopic is selected
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
    if (!isEditing) {
      data.createdAt = new Date().toISOString();
    }
    onSave(data);
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

  // Insert image markdown at cursor position for any field
  const insertImageAtCursor = (imageMarkdown: string, targetRef?: React.RefObject<HTMLTextAreaElement>, fieldName?: string) => {
    const textarea = targetRef?.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = textarea.value || "";

    const newContent = currentContent.substring(0, start) + imageMarkdown + currentContent.substring(end);

    // Update the textarea value directly
    textarea.value = newContent;

    // Update form state based on field name
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

    // Create and dispatch a proper input event
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    textarea.dispatchEvent(inputEvent);

    // Also dispatch a change event
    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    textarea.dispatchEvent(changeEvent);

    // Set cursor position after the inserted image
    const newCursorPos = start + imageMarkdown.length;

    // Use setTimeout to ensure the DOM is updated
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 100);
  };

  // Handle image upload for specific fields
  const handleImageUploadForField = async (file: File, targetRef?: React.RefObject<HTMLTextAreaElement>, fieldName?: string) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image size should be less than 5MB",
        variant: "default",
        duration: 500,
        className: "bg-red-500 text-white",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Please upload an image file",
        variant: "default",
        duration: 500,
        className: "bg-red-500 text-white",
      });
      return;
    }

    setIsUploading(true);

    try {
      const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const dataUrl = await readFileAsDataURL(file);

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      const img = await loadImage(dataUrl);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to create canvas context");
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image without cropping
      ctx.drawImage(img, 0, 0);

      const originalImage = canvas.toDataURL("image/png", 0.9);
      
      const questionTitle = getValues("title") || "question";
      const imageName = generateImageName(questionTitle);

      const response = await api.post("/m/upload-s3", {
        image: originalImage,
        folder: "question-images",
        fileName: imageName
      });
      
      const imageUrl = response.data.data;

      const markdownImage = `![${imageName}](${imageUrl})`;
      insertImageAtCursor(markdownImage, targetRef, fieldName);

      toast({
        title: "Image uploaded successfully!",
        variant: "default",
        duration: 3000,
        className: "bg-green-500 text-white",
      });

    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Failed to process or upload image",
        variant: "default",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Generate unique image name with indexing if needed
  const generateImageName = (questionTitle: string) => {
    const baseName = questionTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 30);
    const index = Math.floor(1000 + Math.random() * 9000);
    
    return `${baseName}-${index.toString()}`;
  };

  // Handle content change manually
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalContent(value);
    setValue("content", value);
  };

  // Handle option content change
  const handleOptionContentChange = (index: number, value: string) => {
    const options = getValues("options") || [];
    options[index] = { ...options[index], content: value };
    setValue("options", options);
  };

  // Handle drag and drop for content field
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

  // Handle drag and drop for solution field
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

  // Handle drag and drop for option fields
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

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUploadForField(file, contentTextareaRef, "content");
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = "";
  };

  // Get all subtopics for searchable select (not filtered by topic)
  const { subtopics: allSubtopics, isLoading: isLoadingSubtopics } = useSubtopics()

  // Monitor content changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'content') {
        // Sync local content with form content
        if (value.content !== localContent) {
          setLocalContent(value.content || "");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, localContent]);

  // Initialize local content when form resets
  useEffect(() => {
    if (initialQuestion?.content) {
      setLocalContent(initialQuestion.content);
    }
  }, [initialQuestion?.content]);

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes('mac'));
  }, []);

  // Keyboard shortcut handler for Ctrl+Shift+S (Save & Publish) and Ctrl+Shift+P (Preview)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl+Shift+S (Windows/Linux) or Cmd+Shift+S (Mac) is pressed - Save & Publish
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        
        // Trigger save with publish
        handleSaveWithPublish();
      }
      
      // Check if Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (Mac) is pressed - Preview
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        
        // Open preview dialog
        setIsPreviewOpen(true);
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Save with publish function
  const handleSaveWithPublish = async () => {
    try {
      // First validate the form
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

      // Get form data
      const formData = getValues();
      
      // Set isPublished to true
      const dataWithPublish = {
        ...formData,
        isPublished: true
      };

      // Show loading toast
      toast({
        title: "Saving and publishing question...",
        variant: "default",
        duration: 2000,
        className: "bg-blue-500 text-white",
      });

      // Call the save function
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

  return (
    <Card className="w-full ">
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
              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Question Preview</DialogTitle>
                  <DialogDescription>
                    Preview of all renderable content in your question
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Question Title */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Question Title</h3>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <p className="text-gray-800">{watch("title") || "No title provided"}</p>
                    </div>
                  </div>

                  {/* Question Content */}
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

                  {/* Options (if multiple choice) */}
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

                  {/* Numerical Answer (if integer type) */}
                  {watch("type") === QuestionType.INTEGER && watch("isNumerical") && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">Correct Answer</h3>
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-blue-800 font-medium">{watch("isNumerical")}</p>
                      </div>
                    </div>
                  )}

                  {/* Solution */}
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

                  {/* Strategy */}
                  {watch("strategy") && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">Strategy</h3>
                      <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                        <MarkdownRenderer content={watch("strategy")} />
                      </div>
                    </div>
                  )}

                  {/* Hint */}
                  {watch("hint") && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">Hint</h3>
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                        <MarkdownRenderer content={watch("hint")} />
                      </div>
                    </div>
                  )}

                  {/* Common Mistakes */}
                  {watch("commonMistake") && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">Common Mistakes</h3>
                      <div className="p-3 bg-red-50 rounded-md border border-red-200">
                        <MarkdownRenderer content={watch("commonMistake")} />
                      </div>
                    </div>
                  )}

                  {/* Question Metadata */}
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

                  {/* Categories */}
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

                  {/* References */}
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
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border">
                <div className="flex items-center gap-1">
                  <kbd className="text-xs">
                    {isMac ? '⌘' : 'Ctrl'}
                  </kbd> + <kbd className="text-xs">1</kbd> Save & Publish
                </div>
                <div className="w-px h-3 bg-gray-300"></div>
                <div className="flex items-center gap-1">
                  <kbd className="text-xs">
                    {isMac ? '⌘' : 'Ctrl'}
                  </kbd> + <kbd className="text-xs">2</kbd> Preview
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
                    <Select onValueChange={field.onChange} value={field.value} >
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
                        {
                          Object.values(QuestionFormat).map((format) => (
                            <SelectItem key={format} value={format}>
                              {TextFormator(format)}
                            </SelectItem>
                          ))
                        }
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
                    className={`border transition-all duration-200 ${errors.content
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
                      onChange={handleFileInputChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${isUploading
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
                {/* <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>💡 Drag & drop images here or use the upload button</span>
                  {isUploading && <span className="text-primary-500">Uploading...</span>}
                </div> */}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Options <span className="text-red-500">*</span></Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption} className="flex items-center gap-1 h-8">
                  <PlusCircle className="h-3 w-3" /> Add Option
                </Button>
              </div>

              {watch("options")?.length > 0 ? (
                <div className="space-y-2">
                  {watch("options").map((option, index) => (
                    <div key={index} className="border rounded p-2 ">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Option {index + 1}</Label>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Switch
                                checked={option.isCorrect}
                                onCheckedChange={(checked) => updateOption(index, "isCorrect", checked)}
                              />
                              <span className="text-xs">Correct</span>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} className="text-red-500 h-7 w-7">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="relative">
                          <Textarea
                            ref={optionRefs[index]}
                            value={option.content}
                            onChange={(e) => handleOptionContentChange(index, e.target.value)}
                            placeholder={`Enter option ${index + 1} content... You can drag and drop images here or use the upload button.`}
                            rows={1}
                            className="border border-gray-300 transition-all duration-200"
                            onDragOver={(e) => handleOptionDragOver(e, index)}
                            onDragLeave={(e) => handleOptionDragLeave(e, index)}
                            onDrop={(e) => handleOptionDrop(e, index)}
                          />
                          <div className="absolute top-2 right-2">
                            <input
                              type="file"
                              id={`image-upload-option-${index}`}
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUploadForField(file, optionRefs[index], `option-${index}`);
                                }
                                e.target.value = "";
                              }}
                              className="hidden"
                              disabled={isUploading}
                            />
                            <label
                              htmlFor={`image-upload-option-${index}`}
                              className={`cursor-pointer inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors ${isUploading
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

                        <div className=" rounded p-1 flex items-center gap-2 bg-gray-50">
                          <Label className="text-xs text-gray-600  block font-bold ">Preview:</Label>
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
                  <Button type="button" variant="ghost" size="sm" onClick={addOption} className="flex items-center gap-1 mx-auto h-7 mt-2">
                    <PlusCircle className="h-3 w-3" /> Add option
                  </Button>
                </div>
              )}

              {/* Show validation errors */}
              {errors.options?.root?.message && (
                <p className="text-red-500 text-xs bg-red-50 p-2 rounded border border-red-200">{errors.options.root.message}</p>
              )}
            </div>
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
                    className={`border transition-all duration-200 ${errors.solution ? "border-red-500" : "border-gray-300"
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
                        e.target.value = "";
                      }}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="image-upload-solution"
                      className={`cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${isUploading
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
                  className={`border ${errors.strategy ? "border-red-500" : "border-gray-300"}`}
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
                  className={`border ${errors.hint ? "border-red-500" : "border-gray-300"}`}
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
                className={`border ${errors.commonMistake ? "border-red-500" : "border-gray-300"}`}
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
            <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <Switch
                id="isPublished"
                checked={watch("isPublished")}
                onCheckedChange={(checked) => setValue("isPublished", checked)}
              />
              <div>
                <Label htmlFor="isPublished" className="font-medium text-sm">Publish question immediately</Label>
                <p className="text-xs text-gray-600">Make this question available to students right away</p>
              </div>
            </div>
          </div>

          {/* LaTeX Delimiter Replacement Button */}
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
    </Card>
  );
};

export default QuestionForm;