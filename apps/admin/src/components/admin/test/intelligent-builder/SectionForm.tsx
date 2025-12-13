"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Label } from "@repo/common-ui";
import { Input } from "@repo/common-ui";
import { Button } from "@repo/common-ui";
import { Switch } from "@repo/common-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/common-ui";
import { Badge } from "@repo/common-ui";
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
  const [topicWeightages, setTopicWeightages] = useState<Record<string, number>>({});
  const [difficultyMin, setDifficultyMin] = useState(1);
  const [difficultyMax, setDifficultyMax] = useState(4);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [typeWeightages, setTypeWeightages] = useState<Record<string, number>>({});
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [formatWeightages, setFormatWeightages] = useState<Record<string, number>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryWeightages, setCategoryWeightages] = useState<Record<string, number>>({});

  const normalizedExamCode = examCode && examCode !== "Default" ? examCode : undefined;

  const { topics, isLoading: isLoadingTopics } = useTopics(
    selectedSubjectId || undefined,
  );

  useEffect(() => {
    if (selectedSubjectId) {
      setSelectedTopicIds([]);
      setTopicWeightages({});
    }
  }, [selectedSubjectId]);

  // Clean up weightages when items are deselected
  useEffect(() => {
    setTopicWeightages((prev) => {
      const updated = { ...prev };
      selectedTopicIds.forEach((id) => {
        if (!updated[id]) updated[id] = 0;
      });
      Object.keys(updated).forEach((id) => {
        if (!selectedTopicIds.includes(id)) delete updated[id];
      });
      return updated;
    });
  }, [selectedTopicIds]);

  useEffect(() => {
    setTypeWeightages((prev) => {
      const updated = { ...prev };
      selectedTypes.forEach((type) => {
        if (!updated[type]) updated[type] = 0;
      });
      Object.keys(updated).forEach((type) => {
        if (!selectedTypes.includes(type)) delete updated[type];
      });
      return updated;
    });
  }, [selectedTypes]);

  useEffect(() => {
    setFormatWeightages((prev) => {
      const updated = { ...prev };
      selectedFormats.forEach((format) => {
        if (!updated[format]) updated[format] = 0;
      });
      Object.keys(updated).forEach((format) => {
        if (!selectedFormats.includes(format)) delete updated[format];
      });
      return updated;
    });
  }, [selectedFormats]);

  useEffect(() => {
    setCategoryWeightages((prev) => {
      const updated = { ...prev };
      selectedCategories.forEach((category) => {
        if (!updated[category]) updated[category] = 0;
      });
      Object.keys(updated).forEach((category) => {
        if (!selectedCategories.includes(category)) delete updated[category];
      });
      return updated;
    });
  }, [selectedCategories]);

  const resetForm = useCallback(() => {
    setSectionName("");
    setIsOptional(false);
    setMaxQuestions(undefined);
    setCorrectMarks(4);
    setNegativeMarks(1);
    setQuestionCount(10);
    setSelectedSubjectId("");
    setSelectedTopicIds([]);
    setTopicWeightages({});
    setDifficultyMin(1);
    setDifficultyMax(4);
    setSelectedTypes([]);
    setTypeWeightages({});
    setSelectedFormats([]);
    setFormatWeightages({});
    setSelectedCategories([]);
    setCategoryWeightages({});
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
      topicWeightages: Object.keys(topicWeightages).length > 0 ? topicWeightages : undefined,
      difficultyRange: {
        min: difficultyMin,
        max: difficultyMax,
      },
      questionTypes: selectedTypes,
      questionTypeWeightages: Object.keys(typeWeightages).length > 0 ? typeWeightages : undefined,
      questionFormats: selectedFormats,
      questionFormatWeightages: Object.keys(formatWeightages).length > 0 ? formatWeightages : undefined,
      questionCategories: selectedCategories,
      questionCategoryWeightages: Object.keys(categoryWeightages).length > 0 ? categoryWeightages : undefined,
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
    categoryWeightages,
    selectedFormats,
    formatWeightages,
    selectedSubjectId,
    selectedTopicIds,
    topicWeightages,
    selectedTypes,
    typeWeightages,
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
          <div className="space-y-2 mt-2">
            <Label className="text-xs text-muted-foreground">
              Assign Weightage (1-100) - Leave empty for equal distribution
            </Label>
            {selectedTopics.map(
              (topic) =>
                topic && (
                  <div key={topic.id} className="flex items-center gap-2 p-2 border rounded-md">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm font-medium">{topic.name}</span>
                      <X
                        className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setSelectedTopicIds((prev) => prev.filter((id) => id !== topic.id));
                          setTopicWeightages((prev) => {
                            const updated = { ...prev };
                            delete updated[topic.id];
                            return updated;
                          });
                        }}
                      />
                    </div>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={topicWeightages[topic.id] || ""}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value, 10) : 0;
                        if (value >= 1 && value <= 100) {
                          setTopicWeightages((prev) => ({ ...prev, [topic.id]: value }));
                        } else if (value === 0) {
                          setTopicWeightages((prev) => {
                            const updated = { ...prev };
                            delete updated[topic.id];
                            return updated;
                          });
                        }
                      }}
                      placeholder="Weightage (1-100)"
                      className="w-32"
                    />
                  </div>
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
        {selectedTypes.length > 0 && (
          <div className="space-y-2 mt-2">
            <Label className="text-xs text-muted-foreground">
              Assign Weightage (1-100) - Leave empty for equal distribution
            </Label>
            {selectedTypes.map((type) => (
              <div key={type} className="flex items-center gap-2 p-2 border rounded-md">
                <div className="flex-1">
                  <span className="text-sm font-medium">{TextFormator(type)}</span>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={typeWeightages[type] || ""}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value, 10) : 0;
                    if (value >= 1 && value <= 100) {
                      setTypeWeightages((prev) => ({ ...prev, [type]: value }));
                    } else if (value === 0) {
                      setTypeWeightages((prev) => {
                        const updated = { ...prev };
                        delete updated[type];
                        return updated;
                      });
                    }
                  }}
                  placeholder="Weightage (1-100)"
                  className="w-32"
                />
              </div>
            ))}
          </div>
        )}
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
        {selectedFormats.length > 0 && (
          <div className="space-y-2 mt-2">
            <Label className="text-xs text-muted-foreground">
              Assign Weightage (1-100) - Leave empty for equal distribution
            </Label>
            {selectedFormats.map((format) => (
              <div key={format} className="flex items-center gap-2 p-2 border rounded-md">
                <div className="flex-1">
                  <span className="text-sm font-medium">{TextFormator(format)}</span>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formatWeightages[format] || ""}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value, 10) : 0;
                    if (value >= 1 && value <= 100) {
                      setFormatWeightages((prev) => ({ ...prev, [format]: value }));
                    } else if (value === 0) {
                      setFormatWeightages((prev) => {
                        const updated = { ...prev };
                        delete updated[format];
                        return updated;
                      });
                    }
                  }}
                  placeholder="Weightage (1-100)"
                  className="w-32"
                />
              </div>
            ))}
          </div>
        )}
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
        {selectedCategories.length > 0 && (
          <div className="space-y-2 mt-2">
            <Label className="text-xs text-muted-foreground">
              Assign Weightage (1-100) - Leave empty for equal distribution
            </Label>
            {selectedCategories.map((category) => (
              <div key={category} className="flex items-center gap-2 p-2 border rounded-md">
                <div className="flex-1">
                  <span className="text-sm font-medium">{TextFormator(category)}</span>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={categoryWeightages[category] || ""}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value, 10) : 0;
                    if (value >= 1 && value <= 100) {
                      setCategoryWeightages((prev) => ({ ...prev, [category]: value }));
                    } else if (value === 0) {
                      setCategoryWeightages((prev) => {
                        const updated = { ...prev };
                        delete updated[category];
                        return updated;
                      });
                    }
                  }}
                  placeholder="Weightage (1-100)"
                  className="w-32"
                />
              </div>
            ))}
          </div>
        )}
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
