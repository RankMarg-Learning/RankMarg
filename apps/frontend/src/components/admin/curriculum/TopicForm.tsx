import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Topic, Subject } from "@/types/typeAdmin";

interface TopicFormProps {
  initialTopic?: Topic;
  subjects: Subject[];
  selectedSubjectId?: string;
  onSave: (topic: Omit<Topic, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const TopicForm = ({ initialTopic, subjects, selectedSubjectId, onSave, onCancel }: TopicFormProps) => {
  const [name, setName] = useState(initialTopic?.name || "");
  const [subjectId, setSubjectId] = useState(initialTopic?.subjectId || selectedSubjectId || "");
  const [weightage, setWeightage] = useState(initialTopic?.weightage || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      name,
      subjectId,
      weightage: weightage,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="subjectId">Subject *</Label>
        <select
          id="subjectId"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          required
          disabled={!!selectedSubjectId}
        >
          <option value="">-- Select Subject --</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <Label htmlFor="name">Topic Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="weightage">Weightage</Label>
        <Input
          id="weightage"
          type="number"
          min="0"
          step="0.1"
          value={weightage}
          onChange={(e) => setWeightage(parseInt(e.target.value))}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialTopic ? "Update Topic" : "Add Topic"}
        </Button>
      </div>
    </form>
  );
};

export default TopicForm;