"use client"
import { useState, useEffect } from "react";
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
import { test, ExamType,  testQuestion, TestStatus, Visibility, FormStep } from "@/types/typeAdmin";
import { PlusCircle, Trash2, Save, Clock, FileText, ArrowLeft, ArrowRight,  BookOpenIcon, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import QuestionSelector from "./QuestionSelector";
import { Controller,  useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import StepIndicator from "./StepIndicator";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DateTimePicker } from "@/utils/test/date-time-picker";
import { TextFormator } from "@/utils/textFormator";
import { useExams } from "@/hooks/useExams";

interface TestFormProps {
  initialTest?: test;
  onSave: (test: Partial<test>) => void;
  onCancel: () => void;
  loading: boolean;
}

export const testSchema = z.object({
  title: z.string().nonempty("Title is required"),
  description: z
    .string()
    .optional(),
  examCode: z.string().nonempty("Exam Code is required"),
  duration: z
    .number({ invalid_type_error: "Duration must be a number" })
    .min(1, "Duration must be at least 1 minute"),
  examType: z.nativeEnum(ExamType),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  status: z.nativeEnum(TestStatus),
  visibility: z.nativeEnum(Visibility),
  startTime: z
    .union([z.string(), z.date()]) 
    .transform((val) => (typeof val === "string" ? new Date(val) : val)) ,
  endTime: z
    .union([z.date(), z.null()])
    .refine((date) => !date || date > new Date(), {
      message: "End time must be in the future",
    }),
    testSection: z.array(z.object({
    name: z.string().nonempty("Section name is required"),
    isOptional: z.boolean(),
    maxQuestions: z.number().int().optional(),
    correctMarks: z.number().positive("Marks per correct answer must be a positive number"),
    negativeMarks: z.number().positive("Negative marks must be a positive number"),
    testQuestion: z.array(z.object({
      id: z.string().nonempty(),
      title: z.string().optional(),
    })),
  })).min(1, "At least one section is required"),
})


const TestForm = ({ initialTest, onSave, onCancel,loading }: TestFormProps) => {
  const isEditing = !!initialTest;
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BASIC_INFO);
  const [sectionQuestions, setSectionQuestions] = useState<Record<number, number>>({}); 
  const { exams } = useExams();

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(testSchema),
    defaultValues: initialTest || {
      title: "",
      description: "",
      examCode: "",
      duration: 60,
      startTime: new Date(),
      endTime: undefined,
      difficulty: "MEDIUM",
      examType: ExamType.FULL_LENGTH,
      status: TestStatus.DRAFT,
      visibility: Visibility.PRIVATE,
      testSection:  []
    },

  })

  const { fields, append, remove } = useFieldArray({ control, name: "testSection" });

  const handleTotalQuestionsChange = (index: number, value: number) => {
    setSectionQuestions((prev) => ({
      ...prev,
      [index]: value,
    }));
  };
  

  useEffect(() => {
    if (initialTest) {
      reset(initialTest);
    }
  }, [initialTest, reset]);

  useEffect(() => {
    const initialCounts: Record<number, number> = {};
    initialTest?.testSection.forEach((section, index) => {
      initialCounts[index] = section.testQuestion.length;
    });
    setSectionQuestions(initialCounts);
  }, [initialTest]);


  const addSection = () => {
    append({
      name: `Section ${fields.length + 1}`,
      isOptional: false,
      maxQuestions: 0,
      correctMarks: 4,
      negativeMarks: 1,
      testQuestion: [],
    })
  };

  const testSections = watch("testSection");

  const updateSectionQuestions = (sectionIndex: number, updatedQuestions: testQuestion[]) => {
    const updatedSections = [...testSections];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      testQuestion: updatedQuestions,
    };
    setValue("testSection", updatedSections, { shouldValidate: true });
  };


  const onSubmit = (data: Partial<test>) => {
    event.preventDefault();
    if (!isEditing) {
      data.createdAt = new Date().toISOString();
    }
    onSave(data);
  };

  const BasicInfoStep = () => {
    return (<>
      <div className="grid grid-cols-7 gap-4">
        <div className="col-span-5 space-y-2">
          <Label htmlFor="title">
            Title <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="title"
            control={control}
            defaultValue=""
            rules={{ required: "Title is required" }}
            render={({ field, fieldState }) => (
              <>
                <Input {...field} placeholder="Test title" className={fieldState.error ? "border-red-500" : ""} />
                {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
              </>
            )}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="duration">
            Duration (minutes) <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-gray-500" />

            <Controller
              name="duration"
              control={control}
              defaultValue={60}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="60"
                  onChange={(e) => field.onChange(Number(e.target.value) || 60)} 
                  className={errors.duration ? "border-red-500" : ""}
                />
              )}
            />
          </div>

          {errors.duration && <p className="text-red-500 text-xs">{errors.duration.message}</p>}
        </div>
      </div>


      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>

        <Controller
          name="description"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Textarea
              {...field}
              id="description"
              placeholder="Write a description for this test..."
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
          )}
        />
        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="examType">Exam Type</Label>

          <Controller
            name="examType"
            control={control}
            defaultValue={undefined} // Ensures validation triggers
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={errors.examType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ExamType).map(([key, type]) => (
                    <SelectItem key={key} value={key}>
                      {TextFormator(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {errors.examType && <p className="text-red-500 text-sm">{errors.examType.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="examCode">Exam Code<span className="text-red-500">*</span></Label>
          <Controller
            name="examCode"
            control={control}
            rules={{ required: "Stream is required" }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                <SelectTrigger className={errors.examCode ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select exam code" />
                </SelectTrigger>
                <SelectContent>
                  {exams.data.map((exam) => (
                    <SelectItem key={exam.code} value={exam.code}>
                      {exam.name || exam.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {errors.examCode && <p className="text-red-500 text-xs">{errors.examCode.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>

          <Controller
            name="difficulty"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                <SelectTrigger className={errors.difficulty ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            )}
          />

          {errors.difficulty && <p className="text-red-500 text-sm">{errors.difficulty.message}</p>}
        </div>

      </div>

    </>)
  }

  const SectionStep = () => {
    return (
      <>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Test Sections</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSection
              }
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" /> Add Section
            </Button>
          </div>

          {fields && fields.length > 0 ? (
            <div className="space-y-4">
              {fields.map((section, index) => (
                <div key={section.id} className="border p-4 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Section {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-10 gap-3">
                    <div className="col-span-7 space-y-2">
                      <Controller
                        name={`testSection.${index}.name`}
                        control={control}
                        rules={{ required: "Section name is required" }}
                        render={({ field, fieldState }) => (
                          <div className="space-y-2">
                            <Label>Section Name <span className="text-red-500">*</span></Label>
                            <Input {...field} placeholder="Section Name" className={fieldState.error ? "border-red-500" : ""} />
                            {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                          </div>
                        )}
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor={`section-${index}-questions`}>Number of Questions
                        <span className="text-red-500"> *</span>
                      </Label>
                      <input
          type="number"
          min="1"
          className="border p-2 w-full"
          placeholder="Total Questions"
          value={sectionQuestions[index] || 1}
          onChange={(e) => handleTotalQuestionsChange(index, parseInt(e.target.value))}
        />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                    <Controller
                      name={`testSection.${index}.correctMarks`}
                      control={control}
                      rules={{ required: "Correct marks is required", min: 1 }}
                      render={({ field, fieldState }) => (
                        <div className="space-y-2">
                          <Label>Marks per Correct Answer</Label>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.5"
                            className={fieldState.error ? "border-red-500" : ""}
                            placeholder="Enter correct marks"
                          />
                          {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                        </div>
                      )}
                    />

                    <Controller
                      name={`testSection.${index}.negativeMarks`}
                      control={control}
                      rules={{ required: "Negative marks is required", min: 0 }}
                      render={({ field, fieldState }) => (
                        <div className="space-y-2">
                          <Label>Negative Marks</Label>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.5"
                            className={fieldState.error ? "border-red-500" : ""}
                            placeholder="Enter negative marks"
                          />
                          {fieldState.error && <p className="text-red-500 text-xs">{fieldState.error.message}</p>}
                        </div>
                      )}
                    />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`section-${index}-maxQuestions`} className="flex items-center space-x-2">
                          <span>Max Question Attempt</span>
                          <Controller
                            name={`testSection.${index}.isOptional`}
                            control={control}
                            render={({ field }) => (
                              <Switch
                                id={`section-${index}-optional`}
                                checked={field.value}
                                onCheckedChange={(checked) => field.onChange(checked)}
                              />
                            )}
                          />
                          <span className="text-sm text-gray-500">Optional</span>
                        </Label>
                      </div>

                      <Controller
                        name={`testSection.${index}.maxQuestions`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            id={`section-${index}-maxQuestions`}
                            type="number"
                            min="0"
                            step="1"
                            {...field} // Handles field state properly
                            disabled={!watch(`testSection.${index}.isOptional`)}
                            className={!watch(`testSection.${index}.isOptional`) ? "opacity-50 cursor-not-allowed" : ""}
                            placeholder="1"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Questions for this section
                      </Label>
                      <div className="text-xs text-gray-500">
                        {section.testQuestion?.length || 0} selected / {sectionQuestions[index]} max
                      </div>
                    </div>

                    <QuestionSelector
                    key={section.id}
                    isEditing={isEditing}
                      selectedQuestions={section.testQuestion || []}
                      onQuestionsChange={(questions) => updateSectionQuestions(index, questions)}
                      maxQuestions={sectionQuestions[index] || 1}
                      examCode={watch("examCode")}
                    />
                  </div>
                </div>
              ))}

            </div>
          ) : (
            <div className="text-center py-4 border border-dashed rounded-md border-gray-300">
              <p className="text-gray-500">No sections added yet.</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addSection}
                className="mt-2"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add your first section
              </Button>
            </div>
          )}
          {errors.testSection?.message && (
            <p className="text-red-500 text-xs">{errors.testSection.message}</p>
          )}
        </div>
      </>)
  }

  const LastPage = () => {

    return (
      <div className="animate-fade-in">

        <div >
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Test Title</p>
                <p className="font-medium">{watch("title")}</p>
              </div>

              {watch("description") && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p>{watch("description")}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p>{watch("duration")} minutes</p>
              </div>


              {watch("examType") && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Exam Type</p>
                  <Badge variant="outline">{
                    TextFormator(watch("examType"))}</Badge>
                </div>
              )}

              {watch("examCode") && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Exam Code</p>
                  <Badge variant="outline">{
                  watch("examCode")}</Badge>
                </div>
              )}

              {watch("difficulty") && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Difficulty</p>
                  <Badge variant="outline">{TextFormator(watch("difficulty"))}</Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Test Sections ({watch("testSection").length})</h3>

            {watch("totalQuestions") && watch("totalMarks") && (
              <div className="mb-4 flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <BookOpenIcon className="h-3 w-3" />
                  {watch("totalQuestions")} Questions
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {watch("totalMarks")} Marks
                </Badge>
              </div>
            )}

            <div className="space-y-3">
              {watch("testSection").map((section, index) => (
                <div key={index} className="p-3 border rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">
                      Section {index + 1}: {section.name}
                    </h4>
                    {section.isOptional && (
                      <Badge variant="outline" className="text-xs">
                        Optional
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Questions: </span>
                      {section.testQuestion.length || 0}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Marks/Q: </span>
                      {section.correctMarks || 0}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Negative: </span>
                      {section.negativeMarks || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>


          </div>

        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>

            <Controller
              name="startTime"
              control={control}
              defaultValue={null} // Ensure proper initial value
              render={({ field }) => (
                <DateTimePicker
                  date={field.value ? new Date(field.value) : null}
                  setDate={field.onChange}
                />
              )}
            />

            {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End Date</Label>

            <Controller
              name="endTime"
              control={control}
              defaultValue={null} // Ensure proper initial value
              render={({ field }) => (
                <>
                  <DateTimePicker
                    date={field.value ? new Date(field.value) : null}
                    setDate={field.onChange}
                  />
                  {/* Show "∞ (Infinite)" when endTime is not set */}
                  {!field.value && <p className="text-gray-500 text-sm">∞ (Infinite)</p>}
                </>
              )}
            />

            {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
          </div>

        </div>
        <div className="space-y-2">
            <Label htmlFor="visibility">Visibility
              <span className="text-red-500 "> *</span>
            </Label>

            <Controller
            name="visibility"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                <SelectTrigger className={errors.visibility ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                {Object.entries(Visibility).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {TextFormator(label)}
                    </SelectItem>
                  ))}
                </SelectContent>  
              </Select>
            )}
          />

            {errors.visibility && <p className="text-red-500 text-sm">{errors.visibility.message}</p>}
          </div>
      </div>
    )

  }


  
  const StepButtons = () => {

    const handleNextStep = async () => {
      let fieldsToValidate: ("title" | "description" | "examCode" | "duration" | "difficulty" | "examType" | "status" | "visibility" | "testSection" | "testId" | "totalMarks" | "totalQuestions" | "referenceId" | `testSection.${number}.testQuestion.${number}.testSectionId`)[] = [];

      if (currentStep === FormStep.BASIC_INFO) {
        fieldsToValidate = ["title", "duration", "examType", "examCode", "difficulty"];
      } else if (currentStep === FormStep.SECTIONS) {
        fieldsToValidate = ["testSection"];
      }

      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;

      setCurrentStep((prev) => Math.min(prev + 1, FormStep.REVIEW) as FormStep);
    };

    return (
      <div className="flex justify-between w-full">
        <Button
          variant="outline"
          className="bg-primary-400 hover:bg-primary-500 gap-2"
          onClick={
            currentStep === FormStep.BASIC_INFO
              ? onCancel
              : () => setCurrentStep((prev) => Math.max(prev - 1, FormStep.BASIC_INFO) as FormStep)
          }
        >
          <ArrowLeft className="h-4 w-4" />
          {currentStep === FormStep.BASIC_INFO ? "Cancel" : "Previous Step"}
        </Button>

        {currentStep === FormStep.REVIEW ? (
          <div className="flex gap-2">
          <Button type="submit" className="bg-primary-400 hover:bg-primary-500">
            <Pencil className="h-4 w-4"/>Draft
        </Button>
          <Button type="submit" className="bg-primary-400 hover:bg-primary-500">
          {
              loading ? "Saving..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Update Question" : "Save Question"}
                </>
              )
            }
          </Button>
          </div>
        ) : (
          <Button onClick={handleNextStep} className="gap-2">
            Next Step
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };


  return (
    <>
      <StepIndicator currentStep={currentStep} />
      <Card className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Test" : "Add New Test"}</CardTitle>
            <CardDescription>
              {isEditing
                ? "Update the test details below"
                : "Fill in the details to create a new test"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {currentStep === FormStep.BASIC_INFO && <BasicInfoStep />}
            {currentStep === FormStep.SECTIONS && <SectionStep />}
            {currentStep === FormStep.REVIEW && <LastPage />}




          </CardContent>
          <CardFooter className="flex justify-between pt-6">
            <StepButtons />
          </CardFooter>
        </form>
      </Card>
    </>
  );
};

export default TestForm;// const handleSubmit = (e: React.FormEvent) => {
//   e.preventDefault();

//   if (!validateTest()) {
//     return;
//   }

//   try {
//     setLoading(true);

//     if (!isEditing) {
//       test.createdAt = new Date().toISOString();
//       test.createdBy = "admin";

//       if (test.TestSection) {
//         test.TestSection = test.TestSection.map(section => ({
//           ...section,
//           testId: tempTestId
//         }));
//       }
//     }

//     // Set status based on isPublished for backward compatibility
//     if (test.isPublished) {
//       test.status = TestStatus.ACTIVE;
//     } else if (!test.status) {
//       test.status = TestStatus.DRAFT;
//     }

//     // Set visibility if not already set
//     if (!test.visibility) {
//       test.visibility = Visibility.PUBLIC;
//     }

//     let totalQuestions = 0;
//     (test.TestSection || []).forEach(section => {
//       totalQuestions += section.maxQuestions || 0;
//     });
//     test.totalQuestions = totalQuestions;

//     onSave(test);
//   } catch (error) {
//     console.error("Error saving test:", error);
//     toast({
//       title: "Error",
//       description: "An error occurred while saving the test",
//       variant: "destructive",
//     });
//   } finally {
//     setLoading(false);
//   }
// };


