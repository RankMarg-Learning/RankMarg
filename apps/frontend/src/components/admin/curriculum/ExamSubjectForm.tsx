import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ExamSubject, Subject } from "@/types/typeAdmin";

interface ExamSubjectFormProps {
  examCode: string;
  subjects: Subject[];
  existingExamSubjects?: ExamSubject[];
  onSave: (examSubject: Omit<ExamSubject, 'examCode'>) => void;
  onCancel: () => void;
}

const ExamSubjectForm = ({ examCode, subjects, existingExamSubjects = [], onSave, onCancel }: ExamSubjectFormProps) => {
  const [subjectId, setSubjectId] = useState("");
  const [weightage, setWeightage] = useState(0);

  // Filter out subjects that are already assigned to this exam
  const availableSubjects = subjects.filter(subject => 
    !existingExamSubjects.some(es => es.subjectId === subject.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      subjectId,
      weightage,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="subjectId">Subject *</Label>
        <SearchableSelect
          value={subjectId}
          onValueChange={setSubjectId}
          placeholder="-- Select Subject --"
          options={[
            { value: "", label: "-- Select Subject --" },
            ...availableSubjects.map((subject) => ({
              value: subject.id,
              label: `${subject.name} ${subject.shortName ? `(${subject.shortName})` : ''}`.trim(),
            }))
          ]}
          searchPlaceholder="Search subjects..."
          emptyMessage="No subjects found."
        />
      </div>
      
      <div>
        <Label htmlFor="weightage">Weightage (%) *</Label>
        <Input
          id="weightage"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={weightage}
          onChange={(e) => setWeightage(parseFloat(e.target.value))}
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Subject
        </Button>
      </div>
    </form>
  );
};

export default ExamSubjectForm;
