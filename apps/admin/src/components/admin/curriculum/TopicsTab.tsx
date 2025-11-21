import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/common-ui";
import { Button, Badge } from "@repo/common-ui";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@repo/common-ui";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@repo/common-ui";
import { SearchableSelect } from "@repo/common-ui";
import { Plus, MoreVertical, BookOpen, List, Pencil, Trash2, ChevronRight, Clock } from "lucide-react";
import { Subject, Topic } from "@/types/typeAdmin";

interface TopicsTabProps {
  topics: Topic[];
  subjects: Subject[];
  selectedSubjectId?: string;
  searchTerm: string;
  isLoading: boolean;
  isLoadingSubjects: boolean;
  onAddTopic: () => void;
  onEditTopic: (topic: Topic) => void;
  onDeleteTopic: (topic: Topic) => void;
  onTopicSelect: (topicId: string) => void;
  onSubjectSelect: (subjectId: string | undefined) => void;
  onAddSubtopic: (topicId: string) => void;
}

export const TopicsTab = ({
  topics,
  subjects,
  selectedSubjectId,
  searchTerm,
  isLoading,
  isLoadingSubjects,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onTopicSelect,
  onSubjectSelect,
  onAddSubtopic,
}: TopicsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Topics</CardTitle>
            <CardDescription>
              {selectedSubjectId && subjects ? 
                `Manage topics within ${subjects.find(s => s.id === selectedSubjectId)?.name}` :
                "Manage topics within subjects"
              }
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <SearchableSelect
              value={selectedSubjectId || "all"}
              onValueChange={(value) => onSubjectSelect(value === "all" ? undefined : value)}
              disabled={isLoadingSubjects}
              placeholder="All Subjects"
              options={[
                { value: "all", label: "All Subjects" },
                ...(subjects?.map((subject) => ({
                  value: subject.id,
                  label: subject.name,
                })) || [])
              ]}
              searchPlaceholder="Search subjects..."
              emptyMessage="No subjects found."
            />
            <Button onClick={onAddTopic} disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Topic
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading topics...</p>
          </div>
        ) : (
          <Table className="border rounded-lg overflow-hidden">
            <TableHeader className="bg-gray-50">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Sr No.</TableHead>
                <TableHead className="font-semibold text-gray-700">Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                <TableHead className="font-semibold text-gray-700">Weightage</TableHead>
                <TableHead className="font-semibold text-gray-700">Est. Time</TableHead>
                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="w-12 h-12 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No topics found</p>
                      {searchTerm && (
                        <p className="text-sm text-muted-foreground">
                          No topics match "{searchTerm}"
                        </p>
                      )}
                      {selectedSubjectId && (
                        <p className="text-sm text-muted-foreground">
                          No topics for selected subject
                        </p>
                      )}
                      <Button onClick={onAddTopic} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Topic
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                topics.map((topic) => (
                  <TableRow 
                    key={topic.id} 
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => onTopicSelect(topic.id)}
                  >
                    <TableCell>
                      <Badge variant="outline">{topic.orderIndex}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        {topic.name}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {subjects?.find(s => s.id === topic.subjectId)?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{topic.weightage || 0}%</span>
                        {topic.weightage && topic.weightage > 0 && (
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${topic.weightage}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {topic.estimatedMinutes ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{topic.estimatedMinutes}m</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onTopicSelect(topic.id);
                          }}>
                            <List className="w-4 h-4 mr-2" />
                            View Subtopics
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onEditTopic(topic);
                          }}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onAddSubtopic(topic.id);
                          }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Subtopic
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTopic(topic);
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

