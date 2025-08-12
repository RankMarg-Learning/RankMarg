"use client"
import { useEffect } from "react";
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
import { PlusCircle, Trash2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QCategory, Question, QuestionFormat  } from "@/types/typeAdmin";
import { QuestionType} from "@prisma/client";
import MarkdownRenderer from "@/lib/MarkdownRenderer";
import { useSubtopics } from "@/hooks/useSubtopics";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateSlug } from "@/lib/generateSlug";
import { TextFormator } from "@/utils/textFormator";
import { CategoryMultiSelect } from "./CategoryMultiSelect";
import { PYQ_Year } from "@/constant/pyqYear";
import { SearchableSelect } from "@/components/ui/searchable-select";

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
  stream: z.string().min(1, "Stream is required"),
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

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    watch,
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
      stream: undefined,
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

  useEffect(() => {
    if (initialQuestion) {
      reset(initialQuestion);
    }
  }, [initialQuestion, reset]);

  useEffect(() => {
    const title = watch("title");
    const stream = watch("stream");

    if (title) {
      const slug = generateSlug(title, stream || "entrance");
      setValue("slug", slug);
    }
  }, [watch("title"), watch("stream"), setValue]);

  // Handle hierarchical relationship when subtopic is selected
  const handleSubtopicChange = (subtopicId: string) => {
    if (allSubtopics?.data) {
      const selectedSubtopic = allSubtopics.data.find(st => st.id === subtopicId);
      if (selectedSubtopic && selectedSubtopic.topic && selectedSubtopic.topic.subject) {
        setValue("topicId", selectedSubtopic.topic.id);
        setValue("subjectId", selectedSubtopic.topic.subject.id);
        setValue("stream", selectedSubtopic.topic.subject.stream);
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
        duration: 3000,
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

  

  // Get all subtopics for searchable select (not filtered by topic)
  const { subtopics: allSubtopics, isLoading: isLoadingSubtopics } = useSubtopics()

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('All Subtopics:', allSubtopics);
      console.log('Loading state:', isLoadingSubtopics);
    }
  }, [allSubtopics, isLoadingSubtopics]);

  return (
    <Card className="w-full ">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Question" : "Add New Question"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Update the question details below"
              : "Fill in the details to create a new question"}
          </CardDescription>
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
              <div className="space-y-1">
                <CategoryMultiSelect control={control} errors={errors} />
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
                    allSubtopics?.data?.map(st => ({
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
                <Textarea
                  id="content"
                  {...register("content")}
                  placeholder="Write your question here..."
                  rows={6}
                  className={`border ${errors.content ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.content && <p className="text-red-500 text-xs">{errors.content.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm">Question Preview</Label>
                <div className="w-full border-2 border-gray-300 min-h-36 p-2 rounded-md bg-gray-50">
                  {
                    <MarkdownRenderer content={watch("content") || `Preview your question here...`} className="text-sm" />
                  }
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
                    <div key={index} className="border rounded p-2 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                          <Input
                            value={option.content}
                            onChange={(e) => updateOption(index, "content", e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="h-8"
                          />
                          <div className="flex-1">
                            <MarkdownRenderer content={option.content} className="text-sm" />
                          </div>
                          </div>
                          {errors.options?.[index]?.content && (
                            <p className="text-red-500 text-xs mt-1">{errors.options[index].content.message}</p>
                          )}
                        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="solution" className="text-sm">Solution <span className="text-red-500">*</span></Label>
                <Textarea
                  id="solution"
                  {...register("solution")}
                  placeholder="Provide a solution/explanation"
                  rows={5}
                  className={`border ${errors.solution ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.solution && <p className="text-red-500 text-xs">{errors.solution.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution" className="text-sm">Solution Preview</Label>
                <div className="w-full border-2 border-gray-300 min-h-28 p-2 rounded-md bg-gray-50">
                  {
                    <MarkdownRenderer content={watch("solution") || `Preview your solution here...`} className="text-sm" />
                  }
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="tag" className="text-sm">PYQ Year</Label>
                <Controller
                  name="pyqYear"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={`border h-9 ${errors.pyqYear ? "border-red-500" : "border-gray-300"}`}>
                        <SelectValue placeholder="Select PYQ Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {PYQ_Year?.length > 0 ? (
                          PYQ_Year.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="none">
                            No Years Available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
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
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
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
    </Card >
  );
};

export default QuestionForm;