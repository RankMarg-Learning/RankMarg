"use client"
import { useState, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/common-ui";
import { Subject, Topic, Subtopic, Exam, ExamSubject } from "@/types/typeAdmin";
import { BookText, BookOpen, List, Calendar, Home } from "lucide-react";
import { useSubjects } from "@/hooks/useSubject";
import { useTopics } from "@/hooks/useTopics";
import { useSubtopics } from "@/hooks/useSubtopics";
import { useExams } from "@/hooks/useExams";
import { toast } from "@/hooks/use-toast";

// Import new components
import { CurriculumBreadcrumb } from "@/components/admin/curriculum/CurriculumBreadcrumb";
import { CurriculumHeader } from "@/components/admin/curriculum/CurriculumHeader";
import { CurriculumStats } from "@/components/admin/curriculum/CurriculumStats";
import { CurriculumSearch } from "@/components/admin/curriculum/CurriculumSearch";
import { SubjectsTab } from "@/components/admin/curriculum/SubjectsTab";
import { TopicsTab } from "@/components/admin/curriculum/TopicsTab";
import { SubtopicsTab } from "@/components/admin/curriculum/SubtopicsTab";
import { ExamsTab } from "@/components/admin/curriculum/ExamsTab";
import { CurriculumDialogs } from "@/components/admin/curriculum/CurriculumDialogs";
import { FilterState, DeleteItem } from "@/components/admin/curriculum/types";

// Loading component for Suspense fallback
const CurriculumLoading = () => (
  <div className="container mx-auto p-3 space-y-3">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Main curriculum component that uses search params
const CurriculumContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-based state management
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "subjects");
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(searchParams.get('subject') || undefined);
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(searchParams.get('topic') || undefined);

  const [filters, setFilters] = useState<FilterState>({
    stream: searchParams.get('stream') || "",
    category: searchParams.get('category') || "",
    status: searchParams.get('status') || "",
    dateRange: searchParams.get('dateRange') || ""
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

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DeleteItem | null>(null);

  // Hooks - Initialize with proper default values
  const { saveSubject, isLoading: isLoadingSubjects, removeSubject, subjects } = useSubjects()
  const { removeTopic, saveTopic, isLoading: isLoadingTopics, topics } = useTopics(selectedSubjectId)
  const { removeSubTopic, isLoading: isLoadingSubtopics, saveSubTopic, subtopics } = useSubtopics(selectedTopicId)
  const { exams, saveExam, updateExam, removeExam, addSubjectToExam, removeSubjectFromExam, isLoading: isLoadingExams } = useExams()

  const filteredSubjects = useMemo(() =>
    subjects?.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())) || [], [subjects, searchTerm]
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

  // URL parameter management
  const updateURL = useCallback((params: Record<string, string | undefined>) => {
    const current = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== '') {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    const newURL = `${window.location.pathname}?${current.toString()}`;
    router.push(newURL, { scroll: false });
  }, [router, searchParams]);

  // Navigation handlers
  const handleSubjectSelect = useCallback((subjectId: string | undefined) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId(undefined); // Reset topic when subject changes
    setActiveTab("topics");
    updateURL({
      subject: subjectId,
      topic: undefined,
      tab: "topics"
    });
  }, [updateURL]);

  const handleTopicSelect = useCallback((topicId: string | undefined) => {
    setSelectedTopicId(topicId);
    setActiveTab("subtopics");
    updateURL({
      topic: topicId,
      tab: "subtopics"
    });
  }, [updateURL]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    updateURL({ tab });
  }, [updateURL]);

  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
    updateURL({ search: search || undefined });
  }, [updateURL]);

  // Breadcrumb data
  const breadcrumbData = useMemo(() => {
    const items = [
      { label: "Curriculum", href: "/admin/curriculum", icon: Home }
    ];

    if (selectedSubjectId && subjects) {
      const subject = subjects.find(s => s.id === selectedSubjectId);
      if (subject) {
        items.push({
          label: subject.name,
          href: `/admin/curriculum?tab=topics&subject=${selectedSubjectId}`,
          icon: BookText
        });
      }
    }

    if (selectedTopicId && topics) {
      const topic = topics.find(t => t.id === selectedTopicId);
      if (topic) {
        items.push({
          label: topic.name,
          href: `/admin/curriculum?tab=subtopics&subject=${selectedSubjectId}&topic=${selectedTopicId}`,
          icon: BookOpen
        });
      }
    }

    return items;
  }, [selectedSubjectId, selectedTopicId, subjects, topics]);

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
        subjectId: topic.subjectId || selectedSubjectId,
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
        subjectId: topic.subjectId || selectedSubjectId,
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
  }, [selectedTopic, selectedSubjectId, saveTopic]);

  const handleSaveSubtopic = useCallback((subtopic: Omit<Subtopic, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedSubtopic) {
      saveSubTopic.mutate({
        id: selectedSubtopic.id,
        name: subtopic.name,
        slug: subtopic.slug,
        topicId: subtopic.topicId || selectedTopicId,
        orderIndex: subtopic.orderIndex,
        estimatedMinutes: subtopic.estimatedMinutes,
        weightage: subtopic.weightage || 0,
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
        topicId: subtopic.topicId || selectedTopicId,
        orderIndex: subtopic.orderIndex,
        estimatedMinutes: subtopic.estimatedMinutes,
        weightage: subtopic.weightage || 0,
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
  }, [selectedSubtopic, selectedTopicId, saveSubTopic]);

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
        toast({
          title: "Bulk Delete",
          description: `Deleting ${selectedItems.length} items...`,
          variant: "default",
          duration: 3000,
          className: "bg-red-100 text-red-800",
        });
        break;
      case 'export':
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

  // Reset filters and navigation
  const resetFilters = useCallback(() => {
    setFilters({
      stream: "",
      category: "",
      status: "",
      dateRange: ""
    });
    setSearchTerm("");
    setSelectedSubjectId(undefined);
    setSelectedTopicId(undefined);
    setActiveTab("subjects");
    updateURL({
      search: undefined,
      stream: undefined,
      category: undefined,
      status: undefined,
      dateRange: undefined,
      subject: undefined,
      topic: undefined,
      tab: "subjects"
    });
  }, [updateURL]);

  return (
    <div className="container mx-auto p-3 space-y-3">
      {/* Breadcrumb Navigation */}
      <CurriculumBreadcrumb items={breadcrumbData} />

      {/* Header */}
      <CurriculumHeader onReset={resetFilters} />

      {/* Statistics Dashboard */}
      <CurriculumStats
        stats={stats}
        isLoadingSubjects={isLoadingSubjects}
        isLoadingTopics={isLoadingTopics}
        isLoadingExams={isLoadingExams}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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

        {/* Search */}
        <CurriculumSearch searchTerm={searchTerm} onSearchChange={handleSearchChange} />

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <SubjectsTab
            subjects={filteredSubjects}
            searchTerm={searchTerm}
            isLoading={isLoadingSubjects}
            onAddSubject={handleAddSubject}
            onEditSubject={handleEditSubject}
            onDeleteSubject={handleDeleteSubject}
            onSubjectSelect={handleSubjectSelect}
            onAddTopic={handleAddTopic}
          />
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value="topics" className="space-y-4">
          <TopicsTab
            topics={filteredTopics}
            subjects={subjects || []}
            selectedSubjectId={selectedSubjectId}
            searchTerm={searchTerm}
            isLoading={isLoadingTopics}
            isLoadingSubjects={isLoadingSubjects}
            onAddTopic={handleAddTopic}
            onEditTopic={handleEditTopic}
            onDeleteTopic={handleDeleteTopic}
            onTopicSelect={handleTopicSelect}
            onSubjectSelect={handleSubjectSelect}
            onAddSubtopic={handleAddSubtopic}
          />
        </TabsContent>

        {/* Subtopics Tab */}
        <TabsContent value="subtopics" className="space-y-4">
          <SubtopicsTab
            subtopics={filteredSubtopics}
            topics={topics || []}
            subjects={subjects || []}
            selectedTopicId={selectedTopicId}
            searchTerm={searchTerm}
            isLoading={isLoadingSubtopics}
            isLoadingTopics={isLoadingTopics}
            onAddSubtopic={handleAddSubtopic}
            onEditSubtopic={handleEditSubtopic}
            onDeleteSubtopic={handleDeleteSubtopic}
            onTopicSelect={handleTopicSelect}
          />
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-4">
          <ExamsTab
            exams={filteredExams}
            isLoading={isLoadingExams}
            onAddExam={handleAddExam}
            onEditExam={handleEditExam}
            onDeleteExam={handleDeleteExam}
            onAddSubjectToExam={handleAddSubjectToExam}
            removeSubjectFromExam={removeSubjectFromExam}
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>

      {/* All Dialogs */}
      <CurriculumDialogs
        subjectDialogOpen={subjectDialogOpen}
        setSubjectDialogOpen={setSubjectDialogOpen}
        selectedSubject={selectedSubject}
        onSaveSubject={handleSaveSubject}
        topicDialogOpen={topicDialogOpen}
        setTopicDialogOpen={setTopicDialogOpen}
        selectedTopic={selectedTopic}
        selectedSubjectId={selectedSubjectId}
        subjects={subjects || []}
        onSaveTopic={handleSaveTopic}
        subtopicDialogOpen={subtopicDialogOpen}
        setSubtopicDialogOpen={setSubtopicDialogOpen}
        selectedSubtopic={selectedSubtopic}
        selectedTopicId={selectedTopicId}
        topics={topics || []}
        onSaveSubtopic={handleSaveSubtopic}
        examDialogOpen={examDialogOpen}
        setExamDialogOpen={setExamDialogOpen}
        selectedExam={selectedExam}
        onSaveExam={handleSaveExam}
        examSubjectDialogOpen={examSubjectDialogOpen}
        setExamSubjectDialogOpen={setExamSubjectDialogOpen}
        onSaveExamSubject={handleSaveExamSubject}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        itemToDelete={itemToDelete}
        onConfirmDelete={handleConfirmDelete}
        bulkActionDialogOpen={bulkActionDialogOpen}
        setBulkActionDialogOpen={setBulkActionDialogOpen}
        bulkAction={bulkAction}
        setBulkAction={setBulkAction}
        selectedItems={selectedItems}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
};

// Main component with Suspense boundary
const Curriculum = () => {
  return (
    <Suspense fallback={<CurriculumLoading />}>
      <CurriculumContent />
    </Suspense>
  );
};

export default Curriculum;
