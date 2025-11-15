import { useState } from "react";
import { Button } from "@repo/common-ui";
import { Input } from "@repo/common-ui";
import { Label } from "@repo/common-ui";
import { Subject } from "@/types/typeAdmin";

interface SubjectFormProps {
  initialSubject?: Subject;
  onSave: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const SubjectForm = ({ initialSubject, onSave, onCancel }: SubjectFormProps) => {
  const [name, setName] = useState(initialSubject?.name || "");
  const [shortName, setShortName] = useState(initialSubject?.shortName || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      name,
      shortName: shortName || undefined,
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
        <Label htmlFor="shortName">Short Name</Label>
        <Input
          id="shortName"
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
          placeholder="e.g., PHY, CHEM, MATH"
        />
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
