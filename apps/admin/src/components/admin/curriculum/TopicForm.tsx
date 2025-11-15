import { useState } from "react";
import { Button } from "@repo/common-ui";
import { Input } from "@repo/common-ui";
import { Label } from "@repo/common-ui";
import { SearchableSelect } from "@repo/common-ui";
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
  const [slug, setSlug] = useState(initialTopic?.slug || "");
  const [subjectId, setSubjectId] = useState(initialTopic?.subjectId || selectedSubjectId || "");
  const [weightage, setWeightage] = useState(initialTopic?.weightage || 0);
  const [orderIndex, setOrderIndex] = useState(initialTopic?.orderIndex || 0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialTopic?.estimatedMinutes || undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      name,
      slug: slug || undefined,
      subjectId,
      weightage: weightage,
      orderIndex,
      estimatedMinutes,
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
          disabled={!!selectedSubjectId}
          options={[
            { value: "", label: "-- Select Subject --" },
            ...subjects.map((subject) => ({
              value: subject.id,
              label: subject.name,
            }))
          ]}
          searchPlaceholder="Search subjects..."
          emptyMessage="No subjects found."
        />
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
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g., mechanics, thermodynamics"
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
          onChange={(e) => setWeightage(parseFloat(e.target.value))}
        />
      </div>

      <div>
        <Label htmlFor="orderIndex">Order Index *</Label>
        <Input
          id="orderIndex"
          type="number"
          min="0"
          value={orderIndex}
          onChange={(e) => setOrderIndex(parseInt(e.target.value))}
          required
        />
      </div>

      <div>
        <Label htmlFor="estimatedMinutes">Estimated Minutes</Label>
        <Input
          id="estimatedMinutes"
          type="number"
          min="1"
          value={estimatedMinutes || ""}
          onChange={(e) => setEstimatedMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="e.g., 120"
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