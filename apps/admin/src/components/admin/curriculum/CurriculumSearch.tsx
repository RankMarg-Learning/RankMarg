import { Card, CardContent, Input } from "@repo/common-ui";
import { Search } from "lucide-react";

interface CurriculumSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const CurriculumSearch = ({ searchTerm, onSearchChange }: CurriculumSearchProps) => {
  return (
    <Card>
      <CardContent className="p-2">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search subjects, topics, subtopics, or exams..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

