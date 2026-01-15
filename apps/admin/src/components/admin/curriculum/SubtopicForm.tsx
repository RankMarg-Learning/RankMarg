import { useState } from "react";
import { Button } from "@repo/common-ui";
import { Input } from "@repo/common-ui";
import { Label } from "@repo/common-ui";
import { SearchableSelect } from "@repo/common-ui";
import { Subtopic, Topic } from "@/types/typeAdmin";

interface SubtopicFormProps {
  initialSubtopic?: Subtopic;
  topics: Topic[];
  selectedTopicId?: string;
  onSave: (subtopic: Omit<Subtopic, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const SubtopicForm = ({ initialSubtopic, topics, selectedTopicId, onSave, onCancel }: SubtopicFormProps) => {
  const [name, setName] = useState(initialSubtopic?.name || "");
  const [slug, setSlug] = useState(initialSubtopic?.slug || "");
  const [topicId, setTopicId] = useState(initialSubtopic?.topicId || selectedTopicId || "");
  const [orderIndex, setOrderIndex] = useState(initialSubtopic?.orderIndex || 0);
  const [weightage, setWeightage] = useState(initialSubtopic?.weightage || undefined);
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialSubtopic?.estimatedMinutes || undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      name,
      slug: slug || undefined,
      topicId,
      orderIndex,
      weightage,
      estimatedMinutes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="topicId">Topic *</Label>
        <SearchableSelect
          value={topicId}
          onValueChange={setTopicId}
          placeholder="-- Select Topic --"
          disabled={!!selectedTopicId}
          options={[
            { value: "", label: "-- Select Topic --" },
            ...topics.map((topic) => ({
              value: topic.id,
              label: topic.name,
            }))
          ]}
          searchPlaceholder="Search topics..."
          emptyMessage="No topics found."
        />
      </div>

      <div>
        <Label htmlFor="name">Subtopic Name *</Label>
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
          placeholder="e.g., newton-laws, energy-conservation"
        />
      </div>

      <div>
        <Label htmlFor="weightage">Weightage</Label>
        <Input
          id="weightage"
          type="number"
          min="0"
          value={weightage || ""}
          onChange={(e) => setWeightage(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="e.g., 10"
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
          placeholder="e.g., 45"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialSubtopic ? "Update Subtopic" : "Add Subtopic"}
        </Button>
      </div>
    </form>
  );
};

export default SubtopicForm;