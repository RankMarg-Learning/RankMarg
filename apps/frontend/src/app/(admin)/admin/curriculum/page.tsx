"use client"
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Subject, Topic, Subtopic, Exam, ExamSubject } from "@/types/typeAdmin";

import {
  Pencil, Trash2, Plus, MoreVertical, BookText,
  BookOpen, List, Zap, Calendar, Users, Search,
  Download, Clock, RefreshCw
} from "lucide-react";
import SubjectForm from "@/components/admin/curriculum/SubjectForm";
import SubtopicForm from "@/components/admin/curriculum/SubtopicForm";
import TopicForm from "@/components/admin/curriculum/TopicForm";
import ExamForm from "@/components/admin/curriculum/ExamForm";
import ExamSubjectForm from "@/components/admin/curriculum/ExamSubjectForm";
import { useSubjects } from "@/hooks/useSubject";
import { useTopics } from "@/hooks/useTopics";
import { useSubtopics } from "@/hooks/useSubtopics";
import { useExams } from "@/hooks/useExams";
import { toast } from "@/hooks/use-toast";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";

// Enhanced filtering and search
interface FilterState {
  stream: string;
  category: string;
  status: string;
  dateRange: string;
}

const Curriculum = () => {
  const [activeTab, setActiveTab] = useState("subjects");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    stream: "",
    category: "",
    status: "",
    dateRange: ""
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");

  // Dialog states
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [subtopicDialogOpen, setSubtopicDialogOpen] = useState(false);
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [examSubjectDialogOpen, setExamSubjectDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);

  // Selected items for editing
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>();
  const [selectedTopic, setSelectedTopic] = useState<Topic | undefined>();
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | undefined>();
  const [selectedExam, setSelectedExam] = useState<Exam | undefined>();
  const [selectedSubjectForTopics, setSelectedSubjectForTopics] = useState<string | undefined>(undefined);
  const [selectedTopicForSubtopics, setSelectedTopicForSubtopics] = useState<string | undefined>(undefined);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'subject' | 'topic' | 'subtopic' | 'exam';
    id: string;
    name: string;
  } | null>(null);

  // Hooks - Initialize with proper default values
  const { saveSubject, isLoading: isLoadingSubjects, removeSubject, subjects } = useSubjects()
  const { removeTopic, saveTopic, isLoading: isLoadingTopics, topics } = useTopics(selectedSubjectForTopics)
  const { removeSubTopic, isLoading: isLoadingSubtopics, saveSubTopic, subtopics } = useSubtopics(selectedTopicForSubtopics)
  const { exams, saveExam, updateExam, removeExam, addSubjectToExam, removeSubjectFromExam, isLoading: isLoadingExams } = useExams()

  const filteredSubjects = useMemo(() =>
    subjects?.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ) || [], [subjects, searchTerm]
  );

  const filteredTopics = useMemo(() =>
    topics?.filter(topic =>
      topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [], [topics, searchTerm]
  );

  const filteredSubtopics = useMemo(() =>
    subtopics?.filter(subtopic =>
      subtopic.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [], [subtopics, searchTerm]
  );

  const filteredExams = useMemo(() =>
    exams.filter(exam =>
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.category === "" || exam.category === filters.category) &&
      (filters.status === "" || (filters.status === "active" ? exam.isActive : !exam.isActive))
    ), [exams, searchTerm, filters.category, filters.status]
  );

  // Statistics
  const stats = useMemo(() => ({
    totalSubjects: subjects?.length || 0,
    totalTopics: topics?.length || 0,
    totalSubtopics: subtopics?.length || 0,
    totalExams: exams.length || 0,
    activeExams: exams.filter(e => e.isActive).length || 0,
    totalSubjectsInExams: exams.reduce((acc, exam) => acc + (exam.examSubjects?.length || 0), 0),
  }), [subjects?.length, topics?.length, subtopics?.length, exams]);

  // Handlers
  const handleAddSubject = useCallback(() => {
    setSelectedSubject(undefined);
    setSubjectDialogOpen(true);
  }, []);

  const handleEditSubject = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setSubjectDialogOpen(true);
  }, []);

  const handleDeleteSubject = useCallback((subject: Subject) => {
    setItemToDelete({
      type: 'subject',
      id: subject.id,
      name: subject.name,
    });
    setDeleteDialogOpen(true);
  }, []);

  const handleAddTopic = useCallback((subjectId?: string) => {
    setSelectedTopic(undefined);
    setSelectedSubjectForTopics(subjectId);
    setTopicDialogOpen(true);
  }, []);

  const handleEditTopic = useCallback((topic: Topic) => {
    setSelectedTopic(topic);
    setTopicDialogOpen(true);
  }, []);

  const handleDeleteTopic = useCallback((topic: Topic) => {
    setItemToDelete({
      type: 'topic',
      id: topic.id,
      name: topic.name,
    });
    setDeleteDialogOpen(true);
  }, []);

  const handleAddSubtopic = useCallback((topicId?: string) => {
    setSelectedSubtopic(undefined);
    setSelectedTopicForSubtopics(topicId);
    setSubtopicDialogOpen(true);
  }, []);

  const handleEditSubtopic = useCallback((subtopic: Subtopic) => {
    setSelectedSubtopic(subtopic);
    setSubtopicDialogOpen(true);
  }, []);

  const handleDeleteSubtopic = useCallback((subtopic: Subtopic) => {
    setItemToDelete({
      type: 'subtopic',
      id: subtopic.id,
      name: subtopic.name,
    });
    setDeleteDialogOpen(true);
  }, []);

  const handleAddExam = useCallback(() => {
    setSelectedExam(undefined);
    setExamDialogOpen(true);
  }, []);

  const handleEditExam = useCallback((exam: Exam) => {
    setSelectedExam(exam);
    setExamDialogOpen(true);
  }, []);

  const handleDeleteExam = useCallback((exam: Exam) => {
    setItemToDelete({
      type: 'exam',
      id: exam.code,
      name: exam.name,
    });
    setDeleteDialogOpen(true);
  }, []);

  const handleAddSubjectToExam = useCallback((examCode: string) => {
    setSelectedExam(filteredExams.find(e => e.code === examCode));
    setExamSubjectDialogOpen(true);
  }, [filteredExams]);

  // Enhanced save handlers with proper types matching hook interfaces
  const handleSaveSubject = useCallback((subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedSubject) {
      saveSubject.mutate(
        {
          id: selectedSubject.id,
          name: subject.name,
          shortName: subject.shortName,
        },
        {
          onSuccess: () => {
            setSubjectDialogOpen(false);
            toast({
              title: "Success",
              description: "Subject updated successfully",
            });
          },
          onError: (error) => {
            console.error('Failed to update subject:', error);
            toast({
              title: "Error",
              description: "Failed to update subject!",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      saveSubject.mutate(
        {
          name: subject.name,
          shortName: subject.shortName, 
        },
        {
          onSuccess: () => {
            setSubjectDialogOpen(false);
            toast({
              title: "Success",
              description: "Subject created successfully",
            });
          },
          onError: (error) => {
            console.error('Failed to add subject:', error);
            toast({
              title: "Error",
              description: "Failed to add subject!",
              variant: "destructive",
            });
          },
        }
      );
    }
  }, [selectedSubject, saveSubject]);

  const handleSaveTopic = useCallback((topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedTopic) {
      saveTopic.mutate({
        id: selectedTopic.id,
        name: topic.name,
        slug: topic.slug,
        subjectId: topic.subjectId,
        weightage: topic.weightage || 0,
        orderIndex: topic.orderIndex,
        estimatedMinutes: topic.estimatedMinutes,
      },
        {
          onSuccess: () => {
            setTopicDialogOpen(false);
            toast({
              title: "Success",
              description: "Topic updated successfully",
            });
          }
        })
    } else {
      saveTopic.mutate({
        name: topic.name,
        slug: topic.slug,
        subjectId: topic.subjectId,
        weightage: topic.weightage || 0,
        orderIndex: topic.orderIndex,
        estimatedMinutes: topic.estimatedMinutes,
      },
        {
          onSuccess: () => {
            setTopicDialogOpen(false);
            toast({
              title: "Success",
              description: "Topic created successfully",
            });
          }
        })
    }
  }, [selectedTopic, saveTopic]);

  const handleSaveSubtopic = useCallback((subtopic: Omit<Subtopic, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedSubtopic) {
      saveSubTopic.mutate({
        id: selectedSubtopic.id,
        name: subtopic.name,
        slug: subtopic.slug,
        topicId: subtopic.topicId,
        orderIndex: subtopic.orderIndex,
        estimatedMinutes: subtopic.estimatedMinutes,
      },
        {
          onSuccess: () => {
            setSubtopicDialogOpen(false);
            toast({
              title: "Success",
              description: "Subtopic updated successfully",
            });
          }
        })
    } else {
      saveSubTopic.mutate({
        name: subtopic.name,
        slug: subtopic.slug,
        topicId: subtopic.topicId,
        orderIndex: subtopic.orderIndex,
        estimatedMinutes: subtopic.estimatedMinutes,
      },
        {
          onSuccess: () => {
            setSubtopicDialogOpen(false);
            toast({
              title: "Success",
              description: "Subtopic created successfully",
            });
          }
        })
    }
  }, [selectedSubtopic, saveSubTopic]);

  const handleSaveExam = useCallback((exam: Omit<Exam, 'createdAt' | 'updatedAt'>) => {
    if (selectedExam) {
      updateExam.mutate({ id: selectedExam.code, exam });
      setExamDialogOpen(false);
    } else {
      saveExam.mutate(exam);
      setExamDialogOpen(false);
    }
  }, [selectedExam, updateExam, saveExam]);

  const handleSaveExamSubject = useCallback((examSubject: Omit<ExamSubject, 'examCode'>) => {
    if (selectedExam) {
      addSubjectToExam.mutate({ examId: selectedExam.code, subjectId: examSubject.subjectId, weightage: examSubject.weightage });
      setExamSubjectDialogOpen(false);
    }
  }, [selectedExam, addSubjectToExam]);

  const handleConfirmDelete = useCallback(() => {
    if (!itemToDelete) return;

    switch (itemToDelete.type) {
      case 'subject':
        removeSubject.mutate(itemToDelete.id);
        break;
      case 'topic':
        removeTopic.mutate(itemToDelete.id);
        break;
      case 'subtopic':
        removeSubTopic.mutate(itemToDelete.id);
        break;
      case 'exam':
        removeExam.mutate(itemToDelete.id);
        break;
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  }, [itemToDelete, removeSubject, removeTopic, removeSubTopic, removeExam]);

  // Bulk operations
  const handleBulkAction = useCallback(() => {
    if (selectedItems.length === 0 || !bulkAction) return;

    switch (bulkAction) {
      case 'delete':
        // Implement bulk delete
        toast({
          title: "Bulk Delete",
          description: `Deleting ${selectedItems.length} items...`,
          variant: "default",
          duration: 3000,
          className: "bg-red-100 text-red-800",
        });
        break;
      case 'export':
        // Implement bulk export
        toast({
          title: "Export",
          description: `Exporting ${selectedItems.length} items...`,

        });
        break;
    }

    setSelectedItems([]);
    setBulkAction("");
    setBulkActionDialogOpen(false);
  }, [selectedItems, bulkAction]);

  // Utility functions
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  }, []);



  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      stream: "",
      category: "",
      status: "",
      dateRange: ""
    });
    setSearchTerm("");
  }, []);

  return (
    <div className="container mx-auto p-3 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">
            Curriculum Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your educational content hierarchy and exam configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetFilters} className="hover:bg-blue-50 hover:border-blue-200">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" className="hover:bg-green-50 hover:border-green-200">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoadingSubjects ? "..." : stats.totalSubjects}
                </p>
              </div>
              <BookText className="w-8 h-8 text-blue-600" />
            </div>
              <p className="text-xs text-muted-foreground mt-1">Unique Subjects</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Topics</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoadingTopics ? "..." : stats.totalTopics}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all subjects</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Exams</p>
                <p className="text-2xl font-bold text-orange-600">
                  {isLoadingExams ? "..." : stats.activeExams}
                </p>
              </div>
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subjects in Exams</p>
                <p className="text-2xl font-bold text-purple-600">
                  {isLoadingExams ? "..." : stats.totalSubjectsInExams}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total associations</p>
          </CardContent>
        </Card>
      </div>



      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg shadow-sm">
          <TabsTrigger
            value="subjects"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-600 transition-all duration-200 rounded-md"
          >
            <BookText className="w-4 h-4" />
            Subjects
          </TabsTrigger>
          <TabsTrigger
            value="topics"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-600 transition-all duration-200 rounded-md"
          >
            <BookOpen className="w-4 h-4" />
            Topics
          </TabsTrigger>
          <TabsTrigger
            value="subtopics"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-600 transition-all duration-200 rounded-md"
          >
            <List className="w-4 h-4" />
            Subtopics
          </TabsTrigger>
          <TabsTrigger
            value="exams"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-600 transition-all duration-200 rounded-md"
          >
            <Calendar className="w-4 h-4" />
            Exams
          </TabsTrigger>
        </TabsList>

        {/* Search  */}
        <Card >
          <CardContent className="p-2">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search subjects, topics, subtopics, or exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Subjects</CardTitle>
                  <CardDescription>Manage subjects for different streams</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  

                  <Button onClick={handleAddSubject} disabled={isLoadingSubjects}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSubjects ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading subjects...</p>
                </div>
              ) : (
                <Table className="border rounded-lg overflow-hidden">
                  <TableHeader className="bg-gray-50">
                    <TableRow className="hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Short Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <BookText className="w-12 h-12 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No subjects found</p>
                            {searchTerm && (
                              <p className="text-sm text-muted-foreground">
                                No subjects match "{searchTerm}"
                              </p>
                            )}
                            <Button onClick={handleAddSubject} variant="outline" size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Add First Subject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubjects?.map((subject) => (
                        <TableRow key={subject.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <TableCell>
                            <div>
                              <div className="font-medium">{subject.name}</div>
                              {subject.shortName && (
                                <Badge variant="secondary" className="mt-1">
                                  {subject.shortName}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{subject.shortName || "-"}</TableCell>
                         


                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="hover:bg-gray-200">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEditSubject(subject)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddTopic(subject.id)}>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Topic
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteSubject(subject)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Topics</CardTitle>
                  <CardDescription>Manage topics within subjects</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <SearchableSelect
                    value={selectedSubjectForTopics || "all"}
                    onValueChange={(value) => setSelectedSubjectForTopics(value === "all" ? undefined : value)}
                    disabled={isLoadingSubjects}
                    placeholder="All Subjects"
                    options={[
                      { value: "all", label: "All Subjects" },
                      ...(subjects?.map((subject) => ({
                        value: subject.id,
                        label: subject.name,
                      })) || [])
                    ]}
                    searchPlaceholder="Search subjects..."
                    emptyMessage="No subjects found."
                  />
                  <Button onClick={() => handleAddTopic()} disabled={isLoadingTopics}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Topic
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTopics ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading topics...</p>
                </div>
              ) : (
                <Table className="border rounded-lg overflow-hidden">
                  <TableHeader className="bg-gray-50">
                    <TableRow className="hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">Sr No.</TableHead>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                      <TableHead className="font-semibold text-gray-700">Weightage</TableHead>
                      <TableHead className="font-semibold text-gray-700">Est. Time</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTopics?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <BookOpen className="w-12 h-12 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No topics found</p>
                            {searchTerm && (
                              <p className="text-sm text-muted-foreground">
                                No topics match "{searchTerm}"
                              </p>
                            )}
                            {selectedSubjectForTopics && (
                              <p className="text-sm text-muted-foreground">
                                No topics for selected subject
                              </p>
                            )}
                            <Button onClick={() => handleAddTopic()} variant="outline" size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Add First Topic
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTopics?.map((topic) => (
                        <TableRow key={topic.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <TableCell>
                            <Badge variant="outline">{topic.orderIndex}</Badge>
                          </TableCell>
                          <TableCell>
                              <div className="font-medium">{topic.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {subjects?.find(s => s.id === topic.subjectId)?.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{topic.weightage || 0}%</span>
                              {topic.weightage && topic.weightage > 0 && (
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${topic.weightage}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            {topic.estimatedMinutes ? (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{topic.estimatedMinutes}m</span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEditTopic(topic)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddSubtopic(topic.id)}>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Subtopic
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteTopic(topic)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subtopics Tab */}
        <TabsContent value="subtopics" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Subtopics</CardTitle>
                  <CardDescription>Manage subtopics within topics</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <SearchableSelect
                    value={selectedTopicForSubtopics || "all"}
                    onValueChange={(value) => setSelectedTopicForSubtopics(value === "all" ? undefined : value)}
                    disabled={isLoadingTopics}
                    placeholder="All Topics"
                    options={[
                      { value: "all", label: "All Topics" },
                      ...(topics?.map((topic) => ({
                        value: topic.id,
                        label: topic.name,
                      })) || [])
                    ]}
                    searchPlaceholder="Search topics..."
                    emptyMessage="No topics found."
                  />
                  <Button onClick={() => handleAddSubtopic()} disabled={isLoadingSubtopics}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subtopic
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSubtopics ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading subtopics...</p>
                </div>
              ) : (
                <Table className="border rounded-lg overflow-hidden">
                  <TableHeader className="bg-gray-50">
                    <TableRow className="hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">Sr No.</TableHead>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Topic</TableHead>
                      <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                      <TableHead className="font-semibold text-gray-700">Est. Time</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubtopics?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <List className="w-12 h-12 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No subtopics found</p>
                            {searchTerm && (
                              <p className="text-sm text-muted-foreground">
                                No subtopics match "{searchTerm}"
                              </p>
                            )}
                            {selectedTopicForSubtopics && (
                              <p className="text-sm text-muted-foreground">
                                No subtopics for selected topic
                              </p>
                            )}
                            <Button onClick={() => handleAddSubtopic()} variant="outline" size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Add First Subtopic
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubtopics?.map((subtopic) => (
                        <TableRow key={subtopic.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <TableCell>
                            <Badge variant="outline">{subtopic.orderIndex}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{subtopic.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {topics?.find(t => t.id === subtopic.topicId)?.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {subjects?.find(s => s.id === topics?.find(t => t.id === subtopic.topicId)?.subjectId)?.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {subtopic.estimatedMinutes ? (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{subtopic.estimatedMinutes}m</span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEditSubtopic(subtopic)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteSubtopic(subtopic)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Exams</CardTitle>
                  <CardDescription>Manage exams and their subject configurations</CardDescription>
                </div>
                <Button onClick={handleAddExam} disabled={isLoadingExams}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exam
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingExams ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading exams...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredExams.map((exam) => (
                    <Card key={exam.code} >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-lg">{exam.name}</CardTitle>
                              <span className={`px-2 py-1 rounded-full text-xs ${exam.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                }`}>
                                {exam.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {exam.fullName && (
                              <CardDescription className="mt-1">{exam.fullName}</CardDescription>
                            )}
                            {exam.description && (
                              <p className="text-sm text-muted-foreground mt-2">{exam.description}</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleEditExam(exam)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Exam
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddSubjectToExam(exam.code)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Subject
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteExam(exam)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Exam
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{exam.totalMarks}</div>
                            <div className="text-sm text-muted-foreground">Total Marks</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{exam.duration}</div>
                            <div className="text-sm text-muted-foreground">Minutes</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{exam.minDifficulty}-{exam.maxDifficulty}</div>
                            <div className="text-sm text-muted-foreground">Difficulty</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{exam.examSubjects?.length || 0}</div>
                            <div className="text-sm text-muted-foreground">Subjects</div>
                          </div>
                        </div>

                        {/* Exam Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <span className="font-medium">Category:</span> {exam.category || "Not specified"}
                          </div>
                          <div>
                            <span className="font-medium">Negative Marking:</span> {exam.negativeMarking ? "Yes" : "No"}
                            {exam.negativeMarking && exam.negativeMarkingRatio && (
                              <span className="ml-1">({exam.negativeMarkingRatio})</span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium">Exam Date:</span> {formatDate(exam.examDate)}
                          </div>
                        </div>

                        {/* Subjects Section */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-lg">Subjects</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddSubjectToExam(exam.code)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Subject
                            </Button>
                          </div>

                          {exam.examSubjects && exam.examSubjects.length > 0 ? (
                            <div className="space-y-2">
                              {exam.examSubjects.map((examSubject) => (
                                <div
                                  key={`${examSubject.examCode}-${examSubject.subjectId}`}
                                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                    <div>
                                      <div className="font-medium">
                                        {examSubject.subject?.name}
                                        {examSubject.subject?.shortName && (
                                          <span className="text-sm text-muted-foreground ml-2">
                                            ({examSubject.subject.shortName})
                                          </span>
                                        )}
                                      </div>
                                     
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <div className="font-medium text-blue-600">
                                        {examSubject.weightage}%
                                      </div>
                                      <div className="text-xs text-muted-foreground">Weightage</div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeSubjectFromExam.mutate({ examId: exam.code, subjectId: examSubject.subjectId })}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No subjects added to this exam yet.</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => handleAddSubjectToExam(exam.code)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Subject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredExams.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No exams found</h3>
                      <p className="mb-4">Create your first exam to get started.</p>
                      <Button onClick={handleAddExam}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Exam
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubject ? "Edit Subject" : "Add Subject"}
            </DialogTitle>
          </DialogHeader>
          <SubjectForm
            initialSubject={selectedSubject}
            onSave={handleSaveSubject}
            onCancel={() => setSubjectDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTopic ? "Edit Topic" : "Add Topic"}
            </DialogTitle>
          </DialogHeader>
          <TopicForm
            initialTopic={selectedTopic}
            subjects={subjects || []}
            selectedSubjectId={selectedSubjectForTopics}
            onSave={handleSaveTopic}
            onCancel={() => setTopicDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={subtopicDialogOpen} onOpenChange={setSubtopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubtopic ? "Edit Subtopic" : "Add Subtopic"}
            </DialogTitle>
          </DialogHeader>
          <SubtopicForm
            initialSubtopic={selectedSubtopic}
            topics={topics || []}
            selectedTopicId={selectedTopicForSubtopics}
            onSave={handleSaveSubtopic}
            onCancel={() => setSubtopicDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedExam ? "Edit Exam" : "Add Exam"}
            </DialogTitle>
          </DialogHeader>
          <ExamForm
            initialExam={selectedExam}
            subjects={subjects || []}
            onSave={handleSaveExam}
            onCancel={() => setExamDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={examSubjectDialogOpen} onOpenChange={setExamSubjectDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Subject to Exam ({selectedExam?.code})</DialogTitle>
          </DialogHeader>
          <ExamSubjectForm
            examCode={selectedExam?.code || ""}
            subjects={subjects || []}
            existingExamSubjects={selectedExam?.examSubjects}
            onSave={handleSaveExamSubject}
            onCancel={() => setExamSubjectDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete{" "}
              <strong>{itemToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Action</label>
              <Select
                value={bulkAction}
                onValueChange={(value) => setBulkAction(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select Action</SelectItem>
                  <SelectItem value="delete">Delete Selected</SelectItem>
                  <SelectItem value="export">Export Selected</SelectItem>
                  <SelectItem value="archive">Archive Selected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedItems.length} items selected
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkAction} disabled={!bulkAction}>
                Execute
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Curriculum;