"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Subject, Topic, Subtopic } from "@/types/typeAdmin";

import {
  Pencil, Trash2, Plus, MoreVertical, BookText,
  BookOpen, List, Zap
} from "lucide-react";
import SubjectForm from "@/components/admin/curriculum/SubjectForm";
import SubtopicForm from "@/components/admin/curriculum/SubtopicForm";
import TopicForm from "@/components/admin/curriculum/TopicForm";
import { useSubjects } from "@/hooks/useSubject";
import { useTopics } from "@/hooks/useTopics";
import { useSubtopics } from "@/hooks/useSubtopics";
import { Stream } from "@prisma/client";
import { toast } from "@/hooks/use-toast";

const Curriculum = () => {
  const [activeTab, setActiveTab] = useState("subjects");
  const [searchTerm, setSearchTerm] = useState("");

  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [subtopicDialogOpen, setSubtopicDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>();
  const [selectedTopic, setSelectedTopic] = useState<Topic | undefined>();
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | undefined>();
  const [selectedSubjectForTopics, setSelectedSubjectForTopics] = useState<string | "">("");
  const [selectedTopicForSubtopics, setSelectedTopicForSubtopics] = useState<string | "">("");
  const [selectedStreamForSubjects, setSelectedStreamForSubjects] = useState<string | "">("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'subject' | 'topic' | 'subtopic';
    id: string;
    name: string;
  } | null>(null);

  const { saveSubject, isLoading: isLoadingSubjects, removeSubject, subjects } = useSubjects(selectedStreamForSubjects)
  const { removeTopic, saveTopic, isLoading: isLoadingTopics, topics } = useTopics(selectedSubjectForTopics)
  const { removeSubTopic, isLoading: isLoadingSubtopics, saveSubTopic, subtopics } = useSubtopics(selectedTopicForSubtopics)



  const filteredSubjects = subjects?.data?.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTopics = topics?.data?.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubtopics = subtopics?.data?.filter(subtopic =>
    subtopic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubject = () => {
    setSelectedSubject(undefined);
    setSubjectDialogOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSubjectDialogOpen(true);
  };

  const handleDeleteSubject = (subject: Subject) => {

    setItemToDelete({
      type: 'subject',
      id: subject.id,
      name: subject.name,
    });
    setDeleteDialogOpen(true);
  };

  const handleAddTopic = (subjectId?: string) => {
    setSelectedTopic(undefined);
    setSelectedSubjectForTopics(subjectId);
    setTopicDialogOpen(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setTopicDialogOpen(true);
  };

  const handleDeleteTopic = (topic: Topic) => {
    setItemToDelete({
      type: 'topic',
      id: topic.id,
      name: topic.name,
    });
    setDeleteDialogOpen(true);
  };

  const handleAddSubtopic = (topicId?: string) => {
    setSelectedSubtopic(undefined);
    setSelectedTopicForSubtopics(topicId);
    setSubtopicDialogOpen(true);
  };

  const handleEditSubtopic = (subtopic: Subtopic) => {
    setSelectedSubtopic(subtopic);
    setSubtopicDialogOpen(true);
  };

  const handleDeleteSubtopic = (subtopic: Subtopic) => {
    setItemToDelete({
      type: 'subtopic',
      id: subtopic.id,
      name: subtopic.name,
    });
    setDeleteDialogOpen(true);
  };

  const handleSaveSubject = (subject: Omit<Subject, 'id'>) => {
    if (selectedSubject) {
      saveSubject.mutate(
        {
          id: selectedSubject.id,
          name: subject.name,
          stream: subject.stream,
        },
        {
          onSuccess: () => {
            setSubjectDialogOpen(false);
          },
          onError: (error) => {
            console.error('Failed to update subject:', error);
            alert('Failed to update subject!');
          },
        }
      );
    } else {
      saveSubject.mutate(
        {
          name: subject.name,
          stream: subject.stream,
        },
        {
          onSuccess: () => {
            setSubjectDialogOpen(false);
          },
          onError: (error) => {
            console.error('Failed to add subject:', error);
            alert('Failed to add subject!');
          },
        }
      );
    }
  };

  const handleSaveTopic = (topic: Omit<Topic, 'id' | 'createdAt'>) => {
    if (selectedTopic) {
      saveTopic.mutate({
        id: selectedTopic.id,
        name: topic.name,
        subjectId: topic.subjectId,
        weightage: topic.weightage,
      },
        {
          onSuccess: () => {
            setTopicDialogOpen(false);
          }
        })
    } else {
      saveTopic.mutate({
        name: topic.name,
        subjectId: topic.subjectId,
        weightage: topic.weightage,
      },
        {
          onSuccess: () => {
            setTopicDialogOpen(false);
          }
        })
    }
  };

  const handleSaveSubtopic = (subtopic: Omit<Subtopic, 'id' | 'createdAt'>) => {
    if (selectedSubtopic) {
      saveSubTopic.mutate({
        id: selectedSubtopic.id,
        name: subtopic.name,
        topicId: subtopic.topicId,
      },
        {
          onSuccess: () => {
            setSubtopicDialogOpen(false);
          }
        }
      )

    } else {
      saveSubTopic.mutate({
        name: subtopic.name,
        topicId: subtopic.topicId,
      },
        {
          onSuccess: () => {
            setSubtopicDialogOpen(false);
          }
        }
      )
    }
  };



  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'subject') {
        removeSubject.mutate(itemToDelete.id,
          {
            onSuccess: () => {
              setDeleteDialogOpen(false);
              setItemToDelete(null);
            },
            onError: (error) => {
              toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
                duration: 3000,
              })
            }
          }
        )
      }
      if (itemToDelete.type === 'topic') {
        removeTopic.mutate(itemToDelete.id,
          {
            onSuccess: () => {
              setDeleteDialogOpen(false);
              setItemToDelete(null);
            }
          }
        )
      }
      if (itemToDelete.type === 'subtopic') {
        removeSubTopic.mutate(itemToDelete.id,
          {
            onSuccess: () => {
              setDeleteDialogOpen(false);
              setItemToDelete(null);
            }
          }
        )
      }
    }
  };

  const getTopicNameById = (topicId: string) => {
    const topic = topics?.data?.find(t => t.id === topicId);
    return topic ? topic.name : "Unknown Topic";
  };

  const getSubjectNameById = (subjectId: string) => {
    const subject = subjects?.data?.find(s => s.id === subjectId);
    return subject ? subject.name : "Unknown Subject";
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Curriculum Management</h1>
          <div className="w-1/3">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <BookText className="h-4 w-4" />
              Subjects
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="subtopics" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Subtopics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subjects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Subjects</CardTitle>
                  <CardDescription>Manage all subjects in your curriculum</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedStreamForSubjects || ""}
                    onChange={(e) => setSelectedStreamForSubjects(e.target.value || "")}
                  >
                    <option value="">All Stream</option>
                    {Object.values(Stream).map((stream) => (
                      <option key={stream} value={stream}>
                        {stream}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleAddSubject} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Subject
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Stream</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingSubjects ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : filteredSubjects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            No subjects found. {searchTerm && "Try a different search term."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSubjects.map((subject) => (
                          <TableRow key={subject.id}>
                            <TableCell className="font-medium">{subject.name}</TableCell>
                            <TableCell>{subject.stream}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddTopic(subject.id)}
                                  title="Add Topic"
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Topic
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditSubject(subject)}>
                                      <Pencil className="h-4 w-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteSubject(subject)}>
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Topics</CardTitle>
                  <CardDescription>Manage topics across all subjects</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedSubjectForTopics || ""}
                    onChange={(e) => setSelectedSubjectForTopics(e.target.value || "")}
                  >
                    <option value="">All Subjects</option>
                    {subjects?.data?.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  <Button onClick={() => handleAddTopic(selectedSubjectForTopics)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Topic
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Weightage</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingTopics ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : filteredTopics.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No topics found. {searchTerm && "Try a different search term."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTopics.map((topic) => (
                          <TableRow key={topic.id}>
                            <TableCell className="font-medium">{topic.name}</TableCell>
                            <TableCell>{getSubjectNameById(topic.subjectId)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                                {topic.weightage || 0}%
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddSubtopic(topic.id)}
                                  title="Add Subtopic"
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Subtopic
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditTopic(topic)}>
                                      <Pencil className="h-4 w-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteTopic(topic)}>
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subtopics">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Subtopics</CardTitle>
                  <CardDescription>Manage subtopics across all topics</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedTopicForSubtopics || ""}
                    onChange={(e) => setSelectedTopicForSubtopics(e.target.value || "")}
                  >
                    <option value="">All Topics</option>
                    {topics?.data?.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                  <Button onClick={() => handleAddSubtopic(selectedTopicForSubtopics)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Subtopic
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingSubtopics ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : filteredSubtopics.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            No subtopics found. {searchTerm && "Try a different search term."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSubtopics.map((subtopic) => (
                          <TableRow key={subtopic.id}>
                            <TableCell className="font-medium">{subtopic.name}</TableCell>
                            <TableCell>{getTopicNameById(subtopic.topicId)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditSubtopic(subtopic)}>
                                      <Pencil className="h-4 w-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteSubtopic(subtopic)}>
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
        <DialogContent className="sm:max-w-md ">
          <DialogHeader>
            <DialogTitle>{selectedSubject ? "Edit Subject" : "Add Subject"}</DialogTitle>
          </DialogHeader>
          <SubjectForm
            initialSubject={selectedSubject}
            onSave={handleSaveSubject}
            onCancel={() => setSubjectDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
        <DialogContent className="sm:max-w-md ">
          <DialogHeader>
            <DialogTitle>{selectedTopic ? "Edit Topic" : "Add Topic"}</DialogTitle>
          </DialogHeader>
          <TopicForm
            initialTopic={selectedTopic}
            subjects={subjects?.data}
            selectedSubjectId={selectedSubjectForTopics}
            onSave={handleSaveTopic}
            onCancel={() => setTopicDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={subtopicDialogOpen} onOpenChange={setSubtopicDialogOpen}>
        <DialogContent className="sm:max-w-md ">
          <DialogHeader>
            <DialogTitle>{selectedSubtopic ? "Edit Subtopic" : "Add Subtopic"}</DialogTitle>
          </DialogHeader>
          <SubtopicForm
            initialSubtopic={selectedSubtopic}
            topics={topics?.data}
            selectedTopicId={selectedTopicForSubtopics}
            onSave={handleSaveSubtopic}
            onCancel={() => setSubtopicDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {itemToDelete && (
              <p>
                Are you sure you want to delete the {itemToDelete.type} <strong>{itemToDelete.name}</strong>?
                {itemToDelete.type === 'subject' && (
                  <span className="block mt-2 text-red-500">
                    Warning: This will also delete all topics and subtopics associated with this subject.
                  </span>
                )}
                {itemToDelete.type === 'topic' && (
                  <span className="block mt-2 text-red-500">
                    Warning: This will also delete all subtopics associated with this topic.
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Curriculum;