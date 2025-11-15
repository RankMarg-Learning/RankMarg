"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/utils/test/date-time-picker";
import { toast } from "@/hooks/use-toast";
import SelectFilter from "@/components/SelectFilter";
import { IntelligentSectionBuilder } from "@/components/admin/test/intelligent-builder/IntelligentSectionBuilder";
import { QuestionPreviewList } from "@/components/admin/test/QuestionPreviewList";
import { Loader2, Sparkles, ArrowLeft, ArrowRight, Check } from "lucide-react";
import api from "@/utils/api";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExamType, TestStatus, Visibility } from "@repo/db/enums";
import { TextFormator } from "@/utils/textFormator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SectionFilter } from "@/components/admin/test/intelligent-builder/types";


interface SelectedQuestion {
  id: string;
  title: string;
  slug: string;
  difficulty: number;
  type: string;
  format: string;
  subject: {
    id: string;
    name: string;
    shortName: string;
  };
  topic: {
    id: string;
    name: string;
    weightage: number;
  };
  subTopic?: {
    id: string;
    name: string;
  };
  category: { category: string }[];
  pyqYear?: string;
}

interface ProcessedSection {
  name: string;
  isOptional: boolean;
  maxQuestions?: number;
  correctMarks: number;
  negativeMarks: number;
  questionLimit?: number;
  subjectId?: string;
  questions: SelectedQuestion[];
}

const STEPS = [
  { id: "basic", label: "Basic Info", description: "Test details" },
  { id: "sections", label: "Add Sections", description: "Configure sections" },
  { id: "preview", label: "Preview Questions", description: "Review & adjust" },
  { id: "final", label: "Final Review", description: "Confirm & create" },
] as const;

type StepId = typeof STEPS[number]["id"];

export default function IntelligentTestCreate() {
  const router = useRouter();
  
  // Basic test information
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [testKey, setTestKey] = useState("");
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [infiniteTime, setInfiniteTime] = useState(true);
  const [examType, setExamType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [examCode, setExamCode] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [status, setStatus] = useState("DRAFT");
  
  // Section and question management
  const [sectionFilters, setSectionFilters] = useState<SectionFilter[]>([]);
  const [generatedSections, setGeneratedSections] = useState<ProcessedSection[]>([]);
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  
  // Step management
  const [currentStep, setCurrentStep] = useState<StepId>("basic");

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  // Handlers for select filters
  const handleDifficulty = (value: string[]) => {
    setDifficulty(value[0] === "Default" ? "" : value[0]);
  };

  const handleExamCode = (value: string[]) => {
    setExamCode(value[0] === "Default" ? "" : value[0]);
  };

  const handleVisibility = (value: string) => {
    setVisibility(value);
  };

  const handleStatus = (value: string) => {
    setStatus(value);
  };

  // Generate options from enums
  const examTypeOptions = Object.entries(ExamType).map(([key, value]) => ({
    value: key,
    label: TextFormator(value),
  }));

  const visibilityOptions = Object.entries(Visibility).map(([key, value]) => ({
    value: key,
    label: TextFormator(value),
  }));

  const testStatusOptions = Object.entries(TestStatus).map(([key, value]) => ({
    value: key,
    label: TextFormator(value),
  }));

  // Validation functions
  const validateBasicInfo = (): boolean => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Test title is required",
        variant: "destructive",
      });
      return false;
    }
    if (!examCode || examCode === "Default") {
      toast({
        title: "Validation Error",
        description: "Exam code is required",
        variant: "destructive",
      });
      return false;
    }
    if (!duration || parseInt(duration) <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid duration is required",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  // Step navigation handlers
  const handleNextStep = () => {
    switch (currentStep) {
      case "basic":
        if (validateBasicInfo()) {
          setCurrentStep("sections");
        }
        break;
      case "sections":
        if (sectionFilters.length === 0) {
          toast({
            title: "Error",
            description: "Please add at least one section",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep("preview");
        break;
      case "preview":
        setCurrentStep("final");
        break;
      default:
        break;
    }
  };

  const handlePreviousStep = () => {
    const steps: StepId[] = ["basic", "sections", "preview", "final"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleGoToStep = (stepId: StepId) => {
    const targetIndex = STEPS.findIndex((s) => s.id === stepId);
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    
    // Only allow going to completed steps or next step
    if (targetIndex <= currentIndex + 1) {
      setCurrentStep(stepId);
    }
  };

  // Section management
  const handleAddSection = async (section: SectionFilter) => {
    setIsSavingSection(true);
    try {
      // Generate questions for this section only
      const response = await api.post("/test/intelligent-create", {
        sections: [section],
        examCode,
        totalQuestions: section.questionCount,
        duration: parseInt(duration),
      });

      if (response.data.success && response.data.data.sections.length > 0) {
        const generatedSection = response.data.data.sections[0];
        const normalizedSection: ProcessedSection = {
          ...generatedSection,
          questionLimit: section.questionCount,
          subjectId: section.subjectId,
        };
        
        // Add to section filters and generated sections
        setSectionFilters([...sectionFilters, section]);
        setGeneratedSections([...generatedSections, normalizedSection]);
        
        toast({
          title: "Section Added Successfully",
          description: `${section.name} added with ${generatedSection.questions.length} questions`,
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Error adding section:", error);
      toast({
        title: "Error",
        description: "Failed to generate questions for this section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSection(false);
    }
  };

  const handleRemoveSection = (index: number) => {
    const sectionName = sectionFilters[index]?.name;
    setSectionFilters(sectionFilters.filter((_, i) => i !== index));
    setGeneratedSections(generatedSections.filter((_, i) => i !== index));
    
    toast({
      title: "Section Removed",
      description: `${sectionName} has been removed`,
    });
  };

  const handleUpdateSections = (sections: ProcessedSection[]) => {
    setGeneratedSections(sections);
  };

  // Final test creation
  const handleCreateTest = async () => {
    try {
      if (!validateBasicInfo()) return;

      if (generatedSections.length === 0) {
        toast({
          title: "Error",
          description: "No sections with questions available",
          variant: "destructive",
        });
        return;
      }

      if (!startDate) {
        toast({
          title: "Validation Error",
          description: "Please select a start date and time",
          variant: "destructive",
        });
        return;
      }

      setIsCreatingTest(true);

      // Transform generated sections to match the API format
      const testSection = generatedSections.map((section) => ({
        name: section.name,
        isOptional: section.isOptional,
        maxQuestions: section.maxQuestions,
        correctMarks: section.correctMarks,
        negativeMarks: section.negativeMarks,
        testQuestion: section.questions.map((q) => ({ id: q.id })),
      }));

      const testData = {
        title,
        description,
        testKey: testKey || null,
        examCode,
        difficulty: difficulty || "MEDIUM",
        duration: parseInt(duration),
        startTime: startDate,
        endTime: endDate || null,
        testSection,
        examType: examType || ExamType.FULL_LENGTH,
        status,
        visibility,
      };

      const response = await api.post("/test", testData);

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Test Created Successfully",
          variant: "success",
        });
        setTimeout(() => {
          router.push("/admin/tests");
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating test:", error);
      toast({
        title: "Error",
        description: "Failed to create test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTest(false);
    }
  };

  // Calculate summary statistics
  const totalQuestions = generatedSections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );
  const totalMarks = generatedSections.reduce(
    (sum, section) =>
      sum + section.questions.length * section.correctMarks,
    0
  );

  return (
    <div className="py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          <h1 className="text-xl font-bold">Intelligent Test Creator</h1>
        </div>
        <p className="text-muted-foreground">
          Create tests with AI-powered question selection through a step-by-step process
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => handleGoToStep(step.id)}
                    disabled={index > currentStepIndex + 1}
                    className={`flex flex-col items-center gap-2 ${
                      index <= currentStepIndex ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep === step.id
                          ? "bg-primary text-primary-foreground"
                          : index < currentStepIndex
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-1 bg-muted mx-2">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: index < currentStepIndex ? "100%" : "0%",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Basic Information */}
      {currentStep === "basic" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
              <CardDescription>
                Enter the basic information for your test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Test Title*</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter test title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter test description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="examCode">Exam Code*</Label>
                  <SelectFilter
                    width={"full"}
                    placeholder="Select Exam Code"
                    selectName={["Default", "NEET", "JEE"]}
                    onChange={handleExamCode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examType">Exam Type*</Label>
                  <Select value={examType} onValueChange={(value) => setExamType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty*</Label>
                  <SelectFilter
                    width={"full"}
                    placeholder="Select Difficulty"
                    selectName={["Default", "EASY", "MEDIUM", "HARD"]}
                    onChange={handleDifficulty}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)*</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    placeholder="Enter test duration"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/tests")}
            >
              Cancel
            </Button>
            <Button onClick={handleNextStep}>
              Next: Add Sections
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Add Sections */}
      {currentStep === "sections" && (
        <div className="space-y-4">
          <IntelligentSectionBuilder
            examCode={examCode}
            sections={sectionFilters}
            onAddSection={handleAddSection}
            onRemoveSection={handleRemoveSection}
            isSavingSection={isSavingSection}
          />

          {sectionFilters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Summary</CardTitle>
                <CardDescription>
                  Overview of your test configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Sections</p>
                    <p className="text-2xl font-bold">{sectionFilters.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                    <p className="text-2xl font-bold">{totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Marks</p>
                    <p className="text-2xl font-bold">{totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-2xl font-bold">{duration} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={handlePreviousStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNextStep} disabled={sectionFilters.length === 0}>
              Next: Preview Questions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Adjust Questions */}
      {currentStep === "preview" && (
        <div className="space-y-4">
          <QuestionPreviewList
            sections={generatedSections}
            onUpdateSections={handleUpdateSections}
            onBack={() => {}}
            onCreate={() => {}}
            hideActions={true}
            examCode={examCode}
          />

          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={handlePreviousStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sections
            </Button>
            <Button onClick={handleNextStep}>
              Next: Final Review
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Final Review */}
      {currentStep === "final" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Final Review</CardTitle>
              <CardDescription>
                Review all test details before creating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Test Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Exam Code</p>
                    <p className="font-medium">{examCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Test Key</p>
                    <Badge variant="outline">{testKey ? testKey : "Not set"}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="outline">{TextFormator(examType || ExamType.FULL_LENGTH)}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <Badge variant="outline">{TextFormator(difficulty || "MEDIUM")}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge>{TextFormator(status)}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Visibility</p>
                    <Badge variant="outline">{TextFormator(visibility)}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Time</p>
                    <p className="font-medium">
                      {startDate?.toLocaleString() || "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Test Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {generatedSections.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Sections</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {totalQuestions}
                    </p>
                    <p className="text-sm text-muted-foreground">Questions</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">{totalMarks}</p>
                    <p className="text-sm text-muted-foreground">Total Marks</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {(parseInt(duration) / totalQuestions).toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Min/Question</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Access Control */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Access Control</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="finalTestKey">Require Test Key</Label>
                    <Switch
                      id="finalTestKey"
                      checked={isSwitchOn}
                      onCheckedChange={(checked) => {
                        setIsSwitchOn(checked);
                        if (!checked) {
                          setTestKey("");
                        }
                      }}
                    />
                  </div>
                  {isSwitchOn && (
                    <Input
                      id="finalTestKeyInput"
                      value={testKey}
                      onChange={(e) => setTestKey(e.target.value)}
                      placeholder="Enter the test key"
                    />
                  )}
                  {!isSwitchOn && (
                    <p className="text-sm text-muted-foreground">
                      Leave disabled to make the test accessible without a key.
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Publication Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Publication Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="finalTimeSettings">Time Settings</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="finalTimeSettings"
                        checked={infiniteTime}
                        onCheckedChange={(checked) => {
                          setInfiniteTime(checked);
                          if (checked) {
                            setEndDate(undefined);
                          }
                        }}
                      />
                      <Label htmlFor="finalTimeSettings">Infinite Time</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date &amp; Time*</Label>
                      <DateTimePicker
                        date={startDate ?? undefined}
                        setDate={(date) => setStartDate(date ?? undefined)}
                      />
                    </div>

                    {!infiniteTime && (
                      <div className="space-y-2">
                        <Label>End Date &amp; Time</Label>
                        <DateTimePicker
                          date={endDate ?? undefined}
                          setDate={(date) => setEndDate(date ?? undefined)}
                        />
                      </div>
                    )}
                  </div>

                  {infiniteTime && (
                    <p className="text-gray-500 text-sm">∞ (No end time set)</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility*</Label>
                    <Select value={visibility} onValueChange={handleVisibility}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        {visibilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Test Status*</Label>
                    <Select value={status} onValueChange={handleStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test status" />
                      </SelectTrigger>
                      <SelectContent>
                        {testStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Section Breakdown</h3>
                <div className="space-y-3">
                  {generatedSections.map((section, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{section.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {section.questions.length} questions • +
                          {section.correctMarks} / -{section.negativeMarks} marks
                          {section.isOptional && " • Optional"}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {section.questions.length * section.correctMarks} marks
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={handlePreviousStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Preview
            </Button>
            <Button
              onClick={handleCreateTest}
              disabled={isCreatingTest}
              size="lg"
              
            >
              {isCreatingTest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Test...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Test
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
