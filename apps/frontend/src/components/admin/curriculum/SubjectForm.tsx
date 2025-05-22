import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Subject } from "@/types/typeAdmin";
import { Stream } from "@prisma/client";

interface SubjectFormProps {
  initialSubject?: Subject;
  onSave: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const SubjectForm = ({ initialSubject, onSave, onCancel }: SubjectFormProps) => {
  const [name, setName] = useState(initialSubject?.name || "");
  const [stream, setStream] = useState<Stream>(initialSubject?.stream || Stream.JEE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      name,
      stream,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 ">
      <div>
        <Label htmlFor="name">Subject Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="stream">Stream *</Label>
        <select
          id="stream"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={stream}
          onChange={(e) => setStream(e.target.value as Stream)}
          required
        >
          {Object.values(Stream).map((stream) => (
            <option key={stream} value={stream}>
              {stream}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialSubject ? "Update Subject" : "Add Subject"}
        </Button>
      </div>
    </form>
  );
};

export default SubjectForm;
