import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/common-ui";
import { Button, Badge } from "@repo/common-ui";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@repo/common-ui";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@repo/common-ui";
import { SearchableSelect } from "@repo/common-ui";
import { Plus, MoreVertical, List, Pencil, Trash2, Clock } from "lucide-react";
import { Subject, Topic, Subtopic } from "@/types/typeAdmin";

interface SubtopicsTabProps {
  subtopics: Subtopic[];
  topics: Topic[];
  subjects: Subject[];
  selectedTopicId?: string;
  searchTerm: string;
  isLoading: boolean;
  isLoadingTopics: boolean;
  onAddSubtopic: () => void;
  onEditSubtopic: (subtopic: Subtopic) => void;
  onDeleteSubtopic: (subtopic: Subtopic) => void;
  onTopicSelect: (topicId: string | undefined) => void;
}

export const SubtopicsTab = ({
  subtopics,
  topics,
  subjects,
  selectedTopicId,
  searchTerm,
  isLoading,
  isLoadingTopics,
  onAddSubtopic,
  onEditSubtopic,
  onDeleteSubtopic,
  onTopicSelect,
}: SubtopicsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Subtopics</CardTitle>
            <CardDescription>
              {selectedTopicId && topics ?
                `Manage subtopics within ${topics.find(t => t.id === selectedTopicId)?.name}` :
                "Manage subtopics within topics"
              }
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <SearchableSelect
              value={selectedTopicId || "all"}
              onValueChange={(value) => onTopicSelect(value === "all" ? undefined : value)}
              disabled={isLoadingTopics}
              placeholder="All Topics"
              options={[
                { value: "all", label: "All Topics" },
                ...(topics?.map((topic) => ({
                  value: topic.id,
                  label: topic.name,
                })) || [])
              ]}
              searchPlaceholder="Search topics..."
              emptyMessage="No topics found."
            />
            <Button onClick={onAddSubtopic} disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subtopic
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading subtopics...</p>
          </div>
        ) : (
          <Table className="border rounded-lg overflow-hidden">
            <TableHeader className="bg-gray-50">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Sr No.</TableHead>
                <TableHead className="font-semibold text-gray-700">Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Topic</TableHead>
                <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                <TableHead className="font-semibold text-gray-700">Weightage</TableHead>
                <TableHead className="font-semibold text-gray-700">Est. Time</TableHead>
                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subtopics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <List className="w-12 h-12 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No subtopics found</p>
                      {searchTerm && (
                        <p className="text-sm text-muted-foreground">
                          No subtopics match "{searchTerm}"
                        </p>
                      )}
                      {selectedTopicId && (
                        <p className="text-sm text-muted-foreground">
                          No subtopics for selected topic
                        </p>
                      )}
                      <Button onClick={onAddSubtopic} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Subtopic
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subtopics.map((subtopic) => (
                  <TableRow key={subtopic.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <TableCell>
                      <Badge variant="outline">{subtopic.orderIndex}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{subtopic.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {topics?.find(t => t.id === subtopic.topicId)?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {subjects?.find(s => s.id === topics?.find(t => t.id === subtopic.topicId)?.subjectId)?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <span>{subtopic.weightage || 0}%</span>
                      {subtopic.weightage && (
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${subtopic.weightage}%` }}
                          ></div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {subtopic.estimatedMinutes ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{subtopic.estimatedMinutes}m</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEditSubtopic(subtopic)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteSubtopic(subtopic)}>
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

