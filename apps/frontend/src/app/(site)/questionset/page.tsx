"use client";
import { Search } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SelectFilter from "@/components/SelectFilter";
import React, {  useState } from "react";
import { QTableRow } from "@/components/questions/QTableRow"; 
import { QTableRowSkeleton } from "@/components/questions/QTableRowSkeleton";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { QuestionSetProps, QuestionTableProps } from "@/types";
import Loading from "@/components/Loading";
import RandomQuestion from "@/components/questions/RandomQuestion";
import { Tags } from "@/constant/tags";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";




const Questionset = () => {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");

  const handleDifficulty = (value: string[]) => {
    if(value[0] === "Default"){
      setDifficulty("");
      return;
    }
    setDifficulty(value[0]);
  };
  const handleTags = (value: string[]) => {
    if(value[0] === "Default"){
      setTags("");
      return;
    }
    setTags(value[0]);
  }


  const [currentPage, setCurrentPage] = useState(1);
  


  const { data } = useQuery({
    queryKey: ["questions",currentPage],
    queryFn: async () => {
      const response = await axios.get<QuestionSetProps>(`/api/question?page=${currentPage}`);
      const { data } = response;
      return data;
    },
    
  });


  
    

  const questions = data?.questionSet.filter((question:QuestionTableProps) => {
    const matchesDifficulty = !difficulty || question.difficulty === difficulty;
    const matchesTags = !tags || (question.tag && question.tag === tags);
    const matchesSubject = !subject || question.subject === subject;
    const matchesSearch = !search || 
      question.content.toLowerCase().includes(search.toLowerCase()) || 
      question.topic.toLowerCase().includes(search.toLowerCase());
    return matchesDifficulty && matchesTags && matchesSubject && matchesSearch;
  }) || [];

  


  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (data?.totalPages && currentPage < data.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  
    return (
        (!loading ?(
            <main className="flex flex-col  sm:gap-2 items-start gap-4 p-4 sm:px-3 sm:py-0 md:gap-8 ">
              
              <RandomQuestion 
                setLoading={setLoading}
              />
              
              <Tabs defaultValue="all">

                <div className="grid md:flex items-center ">
                  <TabsList>
                    <TabsTrigger
                      value="all"
                      onClick={() => {
                        setSubject("");
                      }}
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="Mathematics"
                      onClick={() => {
                        setSubject("Mathematics");
                      }}
                    >
                      Mathematics
                    </TabsTrigger>
                    <TabsTrigger
                      value="Physics"
                      onClick={() => {
                        setSubject("Physics");
                      }}
                    >
                      Physics
                    </TabsTrigger>
                    <TabsTrigger
                      value="Chemistry"
                      onClick={() => {
                        setSubject("Chemistry");
                      }}
                    >
                      Chemistry
                    </TabsTrigger>
                  </TabsList>
                  <div className="relative md:ml-7  flex-1 md:mr-2 my-2  md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-lg bg-background pl-8 h-9 md:w-[200px] lg:w-[320px]"
                    />
                  </div>
                  <div className="mr-auto flex items-center gap-2">
                    <SelectFilter
                      width={"[100px]"}
                      placeholder="Difficulty"
                      selectName={["Default","Easy", "Medium", "Hard"]}
                      onChange={handleDifficulty}
                    />
                    <SelectFilter
                      width={"[100px]"}
                      placeholder="PYQ"
                      selectName={Tags}
                      onChange={handleTags}
                    />
                    
                  </div>
                </div>
                <TabsContent value={subject || "all"}>
                  <Card x-chunk="dashboard-06-chunk-0" >
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="hidden md:table-cell">Class</TableHead>
                            <TableHead className="hidden md:table-cell">Difficulty</TableHead>
                            <TableHead >Question </TableHead>
                            <TableHead >Subject</TableHead>
                            <TableHead className="hidden md:table-cell">Topic</TableHead>
                            <TableHead className="hidden ">Accurcy</TableHead>
                            
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data?.questionSet 
                            ? questions.map((question: QuestionTableProps) => {
                                return (
                                  
                                  <QTableRow
                                    key={question.id}
                                    problem={question}
                                  />
                                );
                              })
                            : Array.from({ length: 20 }).map((_, index) => (
                                <QTableRowSkeleton key={index} />
                              ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter className="flex flex-1">
                      
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePrevious();
                              }}
                              aria-disabled={currentPage === 1}
                              className={currentPage === 1 ? "cursor-not-allowed opacity-50" : ""}
                            />
                          </PaginationItem>

                          {Array.from({ length: data?.totalPages }, (_, i) => (
                            <PaginationItem key={i + 1}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageClick(i + 1);
                                }}
                                className={`${
                                  i + 1 === currentPage
                                    ? "bg-yellow-500 text-white font-semibold" 
                                    : "bg-transparent text-muted-foreground"
                                } p-2 rounded`}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleNext();
                              }}
                              aria-disabled={currentPage === data?.totalPages}
                              className={currentPage === data?.totalPages ? "cursor-not-allowed opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          ):(<Loading/> ))
          
  )
}

export default Questionset

