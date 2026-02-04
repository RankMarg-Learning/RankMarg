import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/common-ui";
import { Button, Badge } from "@repo/common-ui";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@repo/common-ui";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@repo/common-ui";
import { Plus, MoreVertical, BookText, BookOpen, Pencil, Trash2, ChevronRight } from "lucide-react";
import { Subject } from "@/types/typeAdmin";

interface SubjectsTabProps {
  subjects: Subject[];
  searchTerm: string;
  isLoading: boolean;
  questionCounts?: Record<string, number>;
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subject: Subject) => void;
  onSubjectSelect: (subjectId: string) => void;
  onAddTopic: (subjectId: string) => void;
}

export const SubjectsTab = ({
  subjects,
  searchTerm,
  isLoading,
  questionCounts = {},
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onSubjectSelect,
  onAddTopic,
}: SubjectsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Manage subjects for different streams</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={onAddSubject} disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading subjects...</p>
          </div>
        ) : (
          <Table className="border rounded-lg overflow-hidden">
            <TableHeader className="bg-gray-50">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Short Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Questions</TableHead>
                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <BookText className="w-12 h-12 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No subjects found</p>
                      {searchTerm && (
                        <p className="text-sm text-muted-foreground">
                          No subjects match "{searchTerm}"
                        </p>
                      )}
                      <Button onClick={onAddSubject} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Subject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((subject) => (
                  <TableRow
                    key={subject.id}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => onSubjectSelect(subject.id)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {subject.name}
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                        {subject.shortName && (
                          <Badge variant="secondary" className="mt-1">
                            {subject.shortName}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{subject.shortName || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={questionCounts[subject.id] > 0 ? "default" : "secondary"}>
                        {questionCounts[subject.id] || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onSubjectSelect(subject.id);
                          }}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            View Topics
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onEditSubject(subject);
                          }}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onAddTopic(subject.id);
                          }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Topic
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSubject(subject);
                          }}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

