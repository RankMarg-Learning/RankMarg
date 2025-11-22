import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/common-ui";
import { Button } from "@repo/common-ui";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@repo/common-ui";
import SubjectForm from "./SubjectForm";
import TopicForm from "./TopicForm";
import SubtopicForm from "./SubtopicForm";
import ExamForm from "./ExamForm";
import ExamSubjectForm from "./ExamSubjectForm";
import { Subject, Topic, Subtopic, Exam, ExamSubject } from "@/types/typeAdmin";
import { DeleteItem } from "./types";

interface CurriculumDialogsProps {
  // Subject Dialog
  subjectDialogOpen: boolean;
  setSubjectDialogOpen: (open: boolean) => void;
  selectedSubject?: Subject;
  onSaveSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => void;

  // Topic Dialog
  topicDialogOpen: boolean;
  setTopicDialogOpen: (open: boolean) => void;
  selectedTopic?: Topic;
  selectedSubjectId?: string;
  subjects: Subject[];
  onSaveTopic: (topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>) => void;

  // Subtopic Dialog
  subtopicDialogOpen: boolean;
  setSubtopicDialogOpen: (open: boolean) => void;
  selectedSubtopic?: Subtopic;
  selectedTopicId?: string;
  topics: Topic[];
  onSaveSubtopic: (subtopic: Omit<Subtopic, 'id' | 'createdAt' | 'updatedAt'>) => void;

  // Exam Dialog
  examDialogOpen: boolean;
  setExamDialogOpen: (open: boolean) => void;
  selectedExam?: Exam;
  onSaveExam: (exam: Omit<Exam, 'createdAt' | 'updatedAt'>) => void;

  // Exam Subject Dialog
  examSubjectDialogOpen: boolean;
  setExamSubjectDialogOpen: (open: boolean) => void;
  onSaveExamSubject: (examSubject: Omit<ExamSubject, 'examCode'>) => void;

  // Delete Dialog
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  itemToDelete: DeleteItem | null;
  onConfirmDelete: () => void;

  // Bulk Action Dialog
  bulkActionDialogOpen: boolean;
  setBulkActionDialogOpen: (open: boolean) => void;
  bulkAction: string;
  setBulkAction: (action: string) => void;
  selectedItems: string[];
  onBulkAction: () => void;
}

export const CurriculumDialogs = ({
  subjectDialogOpen,
  setSubjectDialogOpen,
  selectedSubject,
  onSaveSubject,
  topicDialogOpen,
  setTopicDialogOpen,
  selectedTopic,
  selectedSubjectId,
  subjects,
  onSaveTopic,
  subtopicDialogOpen,
  setSubtopicDialogOpen,
  selectedSubtopic,
  selectedTopicId,
  topics,
  onSaveSubtopic,
  examDialogOpen,
  setExamDialogOpen,
  selectedExam,
  onSaveExam,
  examSubjectDialogOpen,
  setExamSubjectDialogOpen,
  onSaveExamSubject,
  deleteDialogOpen,
  setDeleteDialogOpen,
  itemToDelete,
  onConfirmDelete,
  bulkActionDialogOpen,
  setBulkActionDialogOpen,
  bulkAction,
  setBulkAction,
  selectedItems,
  onBulkAction,
}: CurriculumDialogsProps) => {
  return (
    <>
      {/* Subject Dialog */}
      <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubject ? "Edit Subject" : "Add Subject"}
            </DialogTitle>
          </DialogHeader>
          <SubjectForm
            initialSubject={selectedSubject}
            onSave={onSaveSubject}
            onCancel={() => setSubjectDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Topic Dialog */}
      <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTopic ? "Edit Topic" : "Add Topic"}
            </DialogTitle>
          </DialogHeader>
          <TopicForm
            initialTopic={selectedTopic}
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            onSave={onSaveTopic}
            onCancel={() => setTopicDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Subtopic Dialog */}
      <Dialog open={subtopicDialogOpen} onOpenChange={setSubtopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubtopic ? "Edit Subtopic" : "Add Subtopic"}
            </DialogTitle>
          </DialogHeader>
          <SubtopicForm
            initialSubtopic={selectedSubtopic}
            topics={topics}
            selectedTopicId={selectedTopicId}
            onSave={onSaveSubtopic}
            onCancel={() => setSubtopicDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Exam Dialog */}
      <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedExam ? "Edit Exam" : "Add Exam"}
            </DialogTitle>
          </DialogHeader>
          <ExamForm
            initialExam={selectedExam}
            subjects={subjects}
            onSave={onSaveExam}
            onCancel={() => setExamDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Exam Subject Dialog */}
      <Dialog open={examSubjectDialogOpen} onOpenChange={setExamSubjectDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Subject to Exam ({selectedExam?.code})</DialogTitle>
          </DialogHeader>
          <ExamSubjectForm
            examCode={selectedExam?.code || ""}
            subjects={subjects}
            existingExamSubjects={selectedExam?.examSubjects}
            onSave={onSaveExamSubject}
            onCancel={() => setExamSubjectDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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
              <Button variant="destructive" onClick={onConfirmDelete}>
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
              <Button onClick={onBulkAction} disabled={!bulkAction}>
                Execute
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

