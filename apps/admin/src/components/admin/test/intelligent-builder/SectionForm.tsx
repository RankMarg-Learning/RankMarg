"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTopics } from "@/hooks/useTopics";
import { QuestionFormat, QuestionType, QCategory } from "@repo/db/enums";
import { TextFormator } from "@/utils/textFormator";
import type { Subject } from "@/types/typeAdmin";
import { SectionFilter } from "./types";

interface SectionFormProps {
  examCode: string;
  subjects: Subject[];
  isLoadingSubjects: boolean;
  isSavingSection?: boolean;
  onSubmit: (section: SectionFilter) => void;
}

const QUESTION_TYPES = Object.values(QuestionType);
const QUESTION_FORMATS = Object.values(QuestionFormat);
const QUESTION_CATEGORIES = Object.values(QCategory);

export function SectionForm({
  examCode,
  subjects,
  isLoadingSubjects,
  isSavingSection = false,
  onSubmit,
}: SectionFormProps) {
  const [sectionName, setSectionName] = useState("");
  const [isOptional, setIsOptional] = useState(false);
  const [maxQuestions, setMaxQuestions] = useState<number | undefined>();
  const [correctMarks, setCorrectMarks] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(1);
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [difficultyMin, setDifficultyMin] = useState(1);
  const [difficultyMax, setDifficultyMax] = useState(4);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const normalizedExamCode = examCode && examCode !== "Default" ? examCode : undefined;

  const { topics, isLoading: isLoadingTopics } = useTopics(
    selectedSubjectId || undefined,
  );

  useEffect(() => {
    if (selectedSubjectId) {
      setSelectedTopicIds([]);
    }
  }, [selectedSubjectId]);

  const resetForm = useCallback(() => {
    setSectionName("");
    setIsOptional(false);
    setMaxQuestions(undefined);
    setCorrectMarks(4);
    setNegativeMarks(1);
    setQuestionCount(10);
    setSelectedSubjectId("");
    setSelectedTopicIds([]);
    setDifficultyMin(1);
    setDifficultyMax(4);
    setSelectedTypes([]);
    setSelectedFormats([]);
    setSelectedCategories([]);
  }, []);

  const handleToggleSelection = useCallback(
    (value: string, selectedList: string[], setter: (list: string[]) => void) => {
      if (selectedList.includes(value)) {
        setter(selectedList.filter((v) => v !== value));
      } else {
        setter([...selectedList, value]);
      }
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!sectionName.trim()) {
      toast({
        title: "Missing section name",
        description: "Section name is required",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSubjectId) {
      toast({
        title: "Select subject",
        description: "Please select a subject to continue",
        variant: "destructive",
      });
      return;
    }

    if (selectedTopicIds.length === 0) {
      toast({
        title: "Add topics",
        description: "Pick at least one topic for this section",
        variant: "destructive",
      });
      return;
    }

    if (questionCount <= 0) {
      toast({
        title: "Invalid question count",
        description: "Question count must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    const payload: SectionFilter = {
      name: sectionName.trim(),
      isOptional,
      maxQuestions: isOptional ? maxQuestions : undefined,
      correctMarks,
      negativeMarks,
      questionCount,
      subjectId: selectedSubjectId,
      topicIds: selectedTopicIds,
      difficultyRange: {
        min: difficultyMin,
        max: difficultyMax,
      },
      questionTypes: selectedTypes,
      questionFormats: selectedFormats,
      questionCategories: selectedCategories,
    };

    onSubmit(payload);
    resetForm();
  }, [
    correctMarks,
    difficultyMax,
    difficultyMin,
    isOptional,
    maxQuestions,
    negativeMarks,
    onSubmit,
    questionCount,
    resetForm,
    sectionName,
    selectedCategories,
    selectedFormats,
    selectedSubjectId,
    selectedTopicIds,
    selectedTypes,
  ]);

  const selectedTopics = useMemo(() => {
    if (!selectedTopicIds.length) return [];
    return selectedTopicIds
      .map((id) => topics.find((topic) => topic.id === id))
      .filter(Boolean);
  }, [selectedTopicIds, topics]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sectionName">Section Name*</Label>
          <Input
            id="sectionName"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            placeholder="e.g., Physics, Chemistry"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="questionCount">Number of Questions*</Label>
          <Input
            id="questionCount"
            type="number"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value, 10) || 0)}
            placeholder="Enter number of questions"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch id="optional" checked={isOptional} onCheckedChange={setIsOptional} />
          <Label htmlFor="optional">Optional Section</Label>
        </div>
        {isOptional && (
          <Input
            type="number"
            value={maxQuestions ?? ""}
            onChange={(e) => setMaxQuestions(parseInt(e.target.value, 10) || undefined)}
            placeholder="Max questions to attempt"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="correctMarks">Correct Answer Marks*</Label>
          <Input
            id="correctMarks"
            type="number"
            step="0.01"
            value={correctMarks}
            onChange={(e) => setCorrectMarks(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="negativeMarks">Negative Marks*</Label>
          <Input
            id="negativeMarks"
            type="number"
            step="0.01"
            value={negativeMarks}
            onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject*</Label>
        <Select
          value={selectedSubjectId}
          onValueChange={setSelectedSubjectId}
          disabled={isLoadingSubjects || !normalizedExamCode}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !normalizedExamCode
                  ? "Select an exam code first"
                  : isLoadingSubjects
                  ? "Loading subjects..."
                  : "Select a subject"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {isLoadingSubjects ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : subjects.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                No subjects available for {normalizedExamCode || "this exam"}
              </div>
            ) : (
              subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Topics* (Select multiple)</Label>
        <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
          {isLoadingTopics ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading topics...</span>
            </div>
          ) : !selectedSubjectId ? (
            <p className="text-sm text-muted-foreground text-center">
              Select a subject first
            </p>
          ) : topics.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No topics available for this subject
            </p>
          ) : (
            topics.map((topic) => (
              <div key={topic.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`topic-${topic.id}`}
                  checked={selectedTopicIds.includes(topic.id)}
                  onChange={() =>
                    handleToggleSelection(topic.id, selectedTopicIds, setSelectedTopicIds)
                  }
                  className="h-4 w-4"
                />
                <label htmlFor={`topic-${topic.id}`} className="text-sm cursor-pointer">
                  {topic.name}
                </label>
              </div>
            ))
          )}
        </div>
        {selectedTopics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTopics.map(
              (topic) =>
                topic && (
                  <Badge key={topic.id} variant="secondary" className="flex items-center">
                    {topic.name}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setSelectedTopicIds((prev) => prev.filter((id) => id !== topic.id))
                      }
                    />
                  </Badge>
                ),
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Difficulty Range</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="diffMin" className="text-xs">
              Min
            </Label>
            <Select
              value={difficultyMin.toString()}
              onValueChange={(v) => setDifficultyMin(parseInt(v, 10))}
            >
              <SelectTrigger id="diffMin">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Easy</SelectItem>
                <SelectItem value="2">2 - Medium</SelectItem>
                <SelectItem value="3">3 - Hard</SelectItem>
                <SelectItem value="4">4 - Very Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="diffMax" className="text-xs">
              Max
            </Label>
            <Select
              value={difficultyMax.toString()}
              onValueChange={(v) => setDifficultyMax(parseInt(v, 10))}
            >
              <SelectTrigger id="diffMax">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Easy</SelectItem>
                <SelectItem value="2">2 - Medium</SelectItem>
                <SelectItem value="3">3 - Hard</SelectItem>
                <SelectItem value="4">4 - Very Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Question Types (Optional)</Label>
        <div className="flex flex-wrap gap-2">
          {QUESTION_TYPES.map((type) => (
            <Badge
              key={type}
              variant={selectedTypes.includes(type) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleToggleSelection(type, selectedTypes, setSelectedTypes)}
            >
              {TextFormator(type)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Question Formats (Optional)</Label>
        <div className="flex flex-wrap gap-2">
          {QUESTION_FORMATS.map((format) => (
            <Badge
              key={format}
              variant={selectedFormats.includes(format) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                handleToggleSelection(format, selectedFormats, setSelectedFormats)
              }
            >
              {TextFormator(format)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Question Categories (Optional)</Label>
        <div className="flex flex-wrap gap-2">
          {QUESTION_CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant={selectedCategories.includes(category) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                handleToggleSelection(category, selectedCategories, setSelectedCategories)
              }
            >
              {TextFormator(category)}
            </Badge>
          ))}
        </div>
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        className="w-full"
        disabled={isSavingSection}
      >
        {isSavingSection ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Questions...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </>
        )}
      </Button>
    </div>
  );
}
