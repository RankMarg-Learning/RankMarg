import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [topicId, setTopicId] = useState(initialSubtopic?.topicId || selectedTopicId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      name,
      topicId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="topicId">Topic *</Label>
        <select
          id="topicId"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          required
          disabled={!!selectedTopicId}
        >
          <option value="">-- Select Topic --</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>
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