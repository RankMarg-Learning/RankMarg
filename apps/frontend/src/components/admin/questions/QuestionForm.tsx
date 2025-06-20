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
import { StandardEnum, Stream ,QuestionType} from "@prisma/client";
import MarkdownRenderer from "@/lib/MarkdownRenderer";
import { useSubjects } from "@/hooks/useSubject";
import { useTopics } from "@/hooks/useTopics";
import { useSubtopics } from "@/hooks/useSubtopics";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateSlug } from "@/lib/generateSlug";
import { TextFormator } from "@/utils/textFormator";
import { CategoryMultiSelect } from "./CategoryMultiSelect";
import { PYQ_Year } from "@/constant/pyqYear";

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
  class: z.enum(Object.values(StandardEnum) as [string, ...string[]]),
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
    .or(z.literal(undefined)),
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
      class: undefined,
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
  const { subjects } = useSubjects(watch("stream"))
  const { topics } = useTopics(watch("subjectId"))
  const { subtopics } = useSubtopics(watch("topicId"))

  return (
    <Card className="w-full">
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

          <div className="space-y-2">
            <Label htmlFor="title">Question Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter the question title"
              className={`border ${errors.title ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Question Type <span className="text-red-500">*</span></Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} >
                    <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="format">Question Format <span className="text-red-500">*</span></Label>
              <Controller
                control={control}
                name="format"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select Format" /></SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty <span className="text-red-500">*</span></Label>
              <Controller
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                    <SelectTrigger><SelectValue placeholder="Select Difficulty" /></SelectTrigger>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CategoryMultiSelect control={control} errors={errors} />
            <div className="space-y-2">
              <Label htmlFor="class">Class <span className="text-red-500">*</span></Label>
              <Controller
                control={control}
                name="class"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value?.toString()}>
                    <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>
                      {Object.values(StandardEnum).map((class1) => (
                        <SelectItem key={class1} value={class1}>
                          {TextFormator(class1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.class && <p className="text-red-500 text-xs">{errors.class.message}</p>}

            </div>
            <div className="space-y-2">
              <Label htmlFor="questionTime">Time to Answer (minutes)</Label>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stream">Stream <span className="text-red-500">*</span></Label>
              <Controller
                name="stream"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Stream).map((stream) => (
                        <SelectItem key={stream} value={stream}>
                          {stream}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.stream && <p className="text-red-500 text-xs">{errors.stream.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
              <Controller
                name="subjectId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.data?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subjectId && <p className="text-red-500 text-xs">{errors.subjectId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic <span className="text-red-500">*</span></Label>
              <Controller
                name="topicId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics?.data?.length > 0 ? (
                        topics?.data?.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="No Topics">
                          No Topics Available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.topicId && <p className="text-red-500 text-xs">{errors.topicId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtopic">Sub Topic <span className="text-red-500">*</span></Label>
              <Controller
                name="subtopicId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Sub Topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {subtopics?.data?.length > 0 ? (
                        subtopics?.data?.map((subtopic) => (
                          <SelectItem key={subtopic.id} value={subtopic.id}>
                            {subtopic.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="No Subtopics">
                          No Subtopics Available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subtopicId && <p className="text-red-500 text-xs">{errors.subtopicId.message}</p>}
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="content">
                Question Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                {...register("content")}
                placeholder="Write your question here..."
                rows={8}
                className={`border ${errors.content ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.content && <p className="text-red-500 text-xs">{errors.content.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Question Preview </Label>
              <div className="w-full m-2 border-2 border-gray-300 min-h-44 p-2 rounded-md h">
                {
                  <MarkdownRenderer content={watch("content") || `Preview your question here...`} className="text-sm " />
                }
              </div>
            </div>
          </div>



          {watch("type") === QuestionType.MULTIPLE_CHOICE && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption} className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" /> Add Option
                </Button>
              </div>

              {watch("options")?.length > 0 ? (
                <div className="space-y-3">
                  {watch("options").map((option, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-1">
                        <Input
                          value={option.content}
                          onChange={(e) => updateOption(index, "content", e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />

                        {errors.options?.[index]?.content && (
                          <p className="text-red-500 text-xs">{errors.options[index].content.message}</p>
                        )}
                      </div>
                      {
                        <MarkdownRenderer content={option.content || `Preview Option ${index}`} className="text-sm border-2 border-gray-200 p-2 rounded-md" />
                      }
                      <div className="flex items-center gap-2 pt-2">
                        <Switch
                          checked={option.isCorrect}
                          onCheckedChange={(checked) => updateOption(index, "isCorrect", checked)}
                        />
                        <span className="text-sm">Correct</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed rounded-md border-gray-300">
                  <p className="text-gray-500">No options added yet.</p>
                  <Button type="button" variant="ghost" size="sm" onClick={addOption} className="mt-2">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add your first option
                  </Button>
                </div>
              )}

              {/* Show validation errors */}
              {errors.options?.root?.message && (
                <p className="text-red-500 text-xs">{errors.options.root.message}</p>
              )}
            </div>
          )}


          {watch("type") === QuestionType.INTEGER && (
            <div className="space-y-2">
              <Label htmlFor="isNumerical">
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
                className={`border ${errors.isNumerical ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.isNumerical && <p className="text-red-500 text-xs ">{errors.isNumerical.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="solution">Solution <span className="text-red-500">*</span></Label>
              <Textarea
                id="solution"
                {...register("solution")}
                placeholder="Provide a solution/explanation"
                rows={3}
                className={`border ${errors.solution ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.solution && <p className="text-red-500 text-xs">{errors.solution.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hint">Hint</Label>
              <Textarea
                id="hint"
                {...register("hint")}
                placeholder="Provide a hint for students"
                rows={3}
                className={`border ${errors.hint ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.hint && <p className="text-red-500 text-xs">{errors.hint.message}</p>}
            </div>

          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Common Mistakes */}
            <div className="space-y-2">
              <Label htmlFor="commonMistake">Common Mistakes</Label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tag */}
            <div className="space-y-2">
              <Label htmlFor="tag">PYQ Year</Label>
              <Controller
                name="pyqYear"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={`border ${errors.pyqYear ? "border-red-500" : "border-gray-300"}`}>
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

            {/* Book Reference */}
            <div className="space-y-2">
              <Label htmlFor="book">Book Reference</Label>
              <Input
                id="book"
                {...register("book")}
                placeholder="e.g., HC Verma, NCERT"
                className={`border ${errors.book ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.book && <p className="text-red-500 text-xs">{errors.book.message}</p>}
            </div>
          </div>



          <div className="flex items-center space-x-2">
            <Switch
              id="isPublished"
              checked={watch("isPublished")} 
              onCheckedChange={(checked) => setValue("isPublished", checked)}
            />
            <Label htmlFor="isPublished">Publish question immediately</Label>
          </div>

        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className={`hover:bg-primary-500
            
            `}>
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

// const handleChange = (
//   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
// ) => {
//   const { name, value } = e.target;
//   setQuestion((prev) => ({ ...prev, [name]: value }));
// };

// const handleSelectChange = (name: string, value: string) => {
//   setQuestion((prev) => ({ ...prev, [name]: value }));
// };

// const handleSwitchChange = (name: string, checked: boolean) => {
//   setQuestion((prev) => ({ ...prev, [name]: checked }));
// };

// const handleDifficultyChange = (value: string) => {
//   setQuestion((prev) => ({ ...prev, difficulty: parseInt(value) }));
// };

// const addOption = () => {
//   const newOptions = [...(question.options || [])];
//   newOptions.push({
//     content: "",
//     isCorrect: false,
//   });
//   setQuestion((prev) => ({ ...prev, options: newOptions }));
// };

// const removeOption = (index: number) => {
//   const newOptions = [...(question.options || [])];
//   newOptions.splice(index, 1);
//   setQuestion((prev) => ({ ...prev, options: newOptions }));
// };

// const updateOption = (index: number, field: keyof Option, value: string | boolean) => {
//   const newOptions = [...(question.options || [])];
//   newOptions[index] = { ...newOptions[index], [field]: value };
//   setQuestion((prev) => ({ ...prev, options: newOptions }));
// };

// const handleSubmit = (e: React.FormEvent) => {
//   e.preventDefault();

//   if ( !question.content || !question.class) {
//     toast({
//       title: "Missing required fields",
//       description: "Please fill in all required fields",
//       variant: "destructive",
//     });
//     return;
//   }

//   if (question.type === QuestionType.MULTIPLE_CHOICE ) {
//     if (!question.options || question.options.length < 2) {
//       toast({
//         title: "Not enough options",
//         description: "MCQ questions must have at least 2 options",
//         variant: "destructive",
//       });
//       return;
//     }

//     const hasCorrectOption = question.options.some(option => option.isCorrect);
//     if (!hasCorrectOption) {
//       toast({
//         title: "No correct option",
//         description: "Please mark at least one option as correct",
//         variant: "destructive",
//       });
//       return;
//     }
//   }

//   if (!isEditing) {
//     question.createdAt = new Date().toISOString();
//   }

//   onSave(question);
// };

{/* <Controller
  control={control}
  name="category"
  render={({ field }) => {
    const selectedValues = Array.isArray(field.value) ? field.value : [];

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          Categories <span className="text-red-500">*</span>
        </label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {selectedValues.length > 0
                ? selectedValues.map(TextFormator).join(", ")
                : "Select Categories"}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-full p-0">
            <Command>
              <CommandGroup>
                {categoryOptions.map((cat) => {
                  const isChecked = selectedValues.includes(cat);
                  return (
                    <CommandItem
                      key={cat}
                      onSelect={() => {
                        if (isChecked) {
                          field.onChange(selectedValues.filter((c) => c !== cat));
                        } else {
                          field.onChange([...selectedValues, cat]);
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          {
                            "bg-primary text-primary-foreground": isChecked,
                          }
                        )}
                      >
                        {isChecked && <CheckIcon className="h-4 w-4" />}
                      </div>
                      {TextFormator(cat)}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {errors.category && (
          <p className="text-red-500 text-xs">{errors.category.message}</p>
        )}
      </div>
    );
  }}
/> */}