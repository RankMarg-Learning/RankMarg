"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { DateTimePicker } from "@/utils/test/date-time-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import Questionset from "@/components/questions/QuestionTable"
import SelectFilter from "@/components/SelectFilter";
// Zod Schemas


interface Section {
  name: string;
  questions: string[];
  isOptional: boolean;
  maxQuestions: number | null;
  markingSchema: {
    correct: number;
    incorrect: number;
  };
}

export default function CreateTest() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [testKey, setTestKey] = useState("")
  const [isSwitchOn, setIsSwitchOn] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [infiniteTime, setInfiniteTime] = useState(true)
  const [sections, setSections] = useState<Section[]>([])
  const [currentSectionName, setCurrentSectionName] = useState("")
  const [currentSectionOptional, setCurrentSectionOptional] = useState(false)
  const [currentSectionMaxQuestions, setCurrentSectionMaxQuestions] = useState<number | null>(null)
  const [currentSectionCorrectMarks, setCurrentSectionCorrectMarks] = useState(4)
  const [currentSectionIncorrectMarks, setCurrentSectionIncorrectMarks] = useState(1)
  const [examType, setExamType] = useState("")
  const [stream, setStream] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const testData = {
        title,
        description,
        testKey: testKey || null,
        stream: stream || null,
        duration: parseInt(duration),
        startTime: startDate || null,
        endTime: endDate || null,
        sections: sections.map(section => ({
          name: section.name,
          isOptional: section.isOptional,
          maxQuestions: section.maxQuestions,
          questions: section.questions,
          markingSchema: {
            correct: section.markingSchema.correct,
            incorrect: section.markingSchema.incorrect,
          }
        })),
        examType: examType,
      }

      const response = await axios.post('/api/test', testData)

      if (response.status === 200) {
        toast({ title: "Success", description: "Test Created Successfully", variant: "success" })
        setTimeout(() => {
          router.push('/admin/tests')
        }, 2000)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" })
      } else {
        toast({ title: "Error", description: "Failed to create test", variant: "destructive" })
      }
    }
  }
  const handleExamType = (value: string[]) => {
    setExamType(value[0] === "Default" ? "" : value[0]);
  };

  const handleQuestionSelect = (questions: string[]) => {
    setSelectedQuestions(questions)
  }

  const handleStream = (value: string[]) => {
    setStream(value[0] === "Default" ? "" : value[0]);
  };

  const handleAddSection = () => {
    if (currentSectionName && selectedQuestions.length > 0) {
      setSections([...sections, {
        name: currentSectionName,
        questions: selectedQuestions,
        isOptional: currentSectionOptional,
        maxQuestions: currentSectionMaxQuestions,
        markingSchema: {
          correct: currentSectionCorrectMarks,
          incorrect: currentSectionIncorrectMarks,
        }
      }])
      setCurrentSectionName("")
      setCurrentSectionOptional(false)
      setCurrentSectionMaxQuestions(null)
      setSelectedQuestions([])
      setCurrentSectionCorrectMarks(4)
      setCurrentSectionIncorrectMarks(1)
    } else {
      toast({ title: "Error", description: "Section name and questions are required", variant: "destructive" })
    }
  }

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index))
  }

  return (
    <div className=" py-1">
        <form onSubmit={handleSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Details</CardTitle>
                <CardDescription>Enter the basic information for your test.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter test title"
                  />
                  <Label className="text-xs text-gray-500">Test Title</Label>
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
                <div className="flex flex-wrap  mb-6 w-full">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <Label htmlFor="stream">Stream</Label>
                    <SelectFilter
                      width={"full"}
                      placeholder="Stream"
                      selectName={["Default", "NEET", "JEE"]}
                      onChange={handleStream}
                    />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <Label htmlFor="examType">Exam Type</Label>
                    <SelectFilter
                      width={"full"}
                      placeholder="Difficulty"
                      selectName={["Default", "Mock-Test", "Topic-wise", "Subject-wise"]}
                      onChange={handleExamType}
                    />

                  </div>
                  
                </div>
                <div className="flex flex-wrap  mb-6 w-full">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <Label htmlFor="duration">Duration (minutes)</Label>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="timeSettings">Time Settings</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="infiniteTime"
                        checked={infiniteTime}
                        onCheckedChange={setInfiniteTime}
                      />
                      <Label htmlFor="infiniteTime">Infinite Time</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <DateTimePicker setDate={setStartDate} />
                    </div>
                    {!infiniteTime && (
                      <div>
                        <Label>End Time</Label>
                        <DateTimePicker setDate={setEndDate} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="testKey">Test Key</Label>
                    <Switch
                      id="testKey"
                      checked={isSwitchOn}
                      onCheckedChange={setIsSwitchOn}
                    />
                  </div>
                  {isSwitchOn && (
                    <Input
                      id="testKey"
                      value={testKey}
                      onChange={(e) => setTestKey(e.target.value)}
                      placeholder="Enter the test key"
                    />
                  )}
                </div>
               
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Test Sections</CardTitle>
                <CardDescription>Create sections and add questions to each section.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="sectionName">Section Name</Label>
                  <Input
                    id="sectionName"
                    value={currentSectionName}
                    onChange={(e) => setCurrentSectionName(e.target.value)}
                    placeholder="Enter section name"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sectionOptional"
                      checked={currentSectionOptional}
                      onCheckedChange={setCurrentSectionOptional}
                    />
                    <Label htmlFor="sectionOptional">Optional Section</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxQuestions">Max Questions</Label>
                  <Input
                    id="maxQuestions"
                    type="number"
                    value={currentSectionMaxQuestions?.toString() || ''}
                    onChange={(e) => setCurrentSectionMaxQuestions(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Enter max questions (optional)"
                  />
                </div>
                <div className="flex flex-wrap  mb-6 w-full">
                  <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <Label htmlFor="correctMarks">Correct Answer Marks</Label>
                    <Input
                      id="correctMarks"
                      type="number"
                      step="0.01"
                      value={currentSectionCorrectMarks}
                      onChange={(e) => setCurrentSectionCorrectMarks(parseFloat(e.target.value))}
                      placeholder="Enter marks for correct answer"
                    />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <Label htmlFor="incorrectMarks">Incorrect Answer Marks</Label>
                    <Input
                      id="incorrectMarks"
                      type="number"
                      step="0.01"
                      value={currentSectionIncorrectMarks}
                      onChange={(e) => setCurrentSectionIncorrectMarks(parseFloat(e.target.value))}
                      placeholder="Enter marks for incorrect answer"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Select Questions for Section</Label>
                  <Questionset
                    onSelectedQuestionsChange={handleQuestionSelect}
                    selectedQuestions={selectedQuestions}
                    isCheckBox={true}
                  />
                </div>
                <Button type="button" onClick={handleAddSection}>Add Section</Button>
                <div className="space-y-4">
                  <Label>Sections Overview</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Section Name</TableHead>
                        <TableHead>Optional</TableHead>
                        <TableHead>Max Questions</TableHead>
                        <TableHead>Questions Count</TableHead>
                        <TableHead>Correct Marks</TableHead>
                        <TableHead>Incorrect Marks</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sections.map((section, index) => (
                        <TableRow key={index}>
                          <TableCell>{section.name}</TableCell>
                          <TableCell>{section.isOptional ? 'Yes' : 'No'}</TableCell>
                          <TableCell>{section.maxQuestions || 'N/A'}</TableCell>
                          <TableCell>{section.questions.length}</TableCell>
                          <TableCell>{section.markingSchema.correct}</TableCell>
                          <TableCell>{section.markingSchema.incorrect}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveSection(index)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-6 justify-end flex">
            <Button type="submit" size="lg">Create Test</Button>
          </div>
              </CardContent>
            </Card>
        </form>
    </div>
  )
}

