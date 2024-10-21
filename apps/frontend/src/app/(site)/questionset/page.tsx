"use client";
import {  CheckIcon, Search, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import React, {   use, useEffect, useState } from "react";
// import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { QTableRow } from "@/components/questions/QTableRow"; 
import { QTableRowSkeleton } from "@/components/questions/QTableRowSkeleton";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { QuestionTableProps } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";





const Questionset = () => {
  const [tabSubject, setTabSubject] = useState( "");
  const [difficulty, setDifficulty] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("");
 
  try {
    const storedFilters = JSON.parse(localStorage.getItem('questionFilters'));
    if (storedFilters) {
      console.log('Stored Filters:', storedFilters);
    } else {
      console.log('No filters found in localStorage');
    }
  } catch (error) {
    console.error('Error parsing filters from localStorage', error);
  }
  

 

  

  const handleDifficulty = (value: string[]) => {
    if(value[0] === "Default"){
      setDifficulty("");
      return;
    }
    setDifficulty(value[0]);
  };
  const handleStatus = (value: string[]) => {
    if(value[0] === "Default"){
      setStatus("");
      return;
    }
    setStatus(value[0]);
  };


  console.log(difficulty,topic);


  const { data: questions } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const { data } = await axios.get("/api/question");
      return data;
    },
  });

  // console.log(questions);

  
    return (
        <>
          {/* <div className="flex min-h-screen w-full flex-col bg-muted/40"> */}
    
          <div className="flex flex-col sm:gap-2 sm:py-4 mx-1   ">
            {/* <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 "> */}
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 ">
              <Card className="py-8">
              <h1 className="text-2xl font-bold text-center pb-3">Pick Random Question </h1>
              <RandomQuestion 
                
              />
              </Card>
              <Tabs defaultValue="all">

                <div className="grid md:flex items-center ">
                  <TabsList>
                    <TabsTrigger
                      value="all"
                      onClick={() => {
                        setTabSubject("");
                      }}
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="Mathematics"
                      onClick={() => {
                        setTabSubject("Mathematics");
                      }}
                    >
                      Mathematics
                    </TabsTrigger>
                    <TabsTrigger
                      value="Physics"
                      onClick={() => {
                        setTabSubject("Physics");
                      }}
                    >
                      Physics
                    </TabsTrigger>
                    <TabsTrigger
                      value="Chemistry"
                      onClick={() => {
                        setTabSubject("Chemistry");
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
                      placeholder="Status"
                      selectName={["Default","Solved", "Unsolved", "Attempted"]}
                      onChange={handleStatus}
                    />
                    
                    
                    <Button size="sm" className="h-9 gap-1">
                      <Shuffle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Pick random
                      </span>
                    </Button>
                  </div>
                </div>
                <TabsContent value={tabSubject || "all"}>
                  <Card x-chunk="dashboard-06-chunk-0" >
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Class</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Accurcy</TableHead>
                            <TableHead className="hidden md:table-cell">Subject</TableHead>
                            
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {questions
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
                      <h2>Paginations</h2>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </div>
          {/* </div> */}
        </>
  )
}

export default Questionset

import { topics } from "@/constant/topics";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";



const RandomQuestion = () => {
  const router = useRouter();
  const [topicTitle, setTopicTitle] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const handleRandom = async() => {
    localStorage.setItem('questionFilters', JSON.stringify({topicTitle, difficulty, }));
    try {
      const question = await axios.post(`/api/pickRandom`,
      {
        topic: topicTitle,
        difficulty: difficulty,
      }
      );
      if(question){
        router.push(`/questions/${question.data.slug}`);
      }
    } catch (error) {
      console.error( error);
    }

  }

  
  
  return (
      <div className="flex flex-wrap  mb-6 w-full">
        <div className="w-full md:w-2/5 px-3 mb-6 md:mb-0">
          
          <Combobox
            onchange={(newTopic: string) => {
            setTopicTitle(newTopic);
            }}
          />
          </div>
          <div className="w-full md:w-1/5 px-3 mb-6 md:mb-0">
                  
                  <SelectFilter
                    width={"full"}
                    placeholder="Difficulty"
                    selectName={["Easy", "Medium", "Hard"]}
                    onChange={(value: string[]) => setDifficulty(value[0])}
                  />
                 
          </div>
          <div className="w-full md:w-1/5 px-3 mb-6 md:mb-0">
          <Button size="sm" className="h-9 gap-1"
          onClick={handleRandom}
          >
                      <Shuffle className="h-4 w-4" />
                      <span >
                        Pick random
                      </span>
                    </Button>
          </div>

      </div>
  )
}

interface ComboboxProps {
  onchange: (value: string) => void;
}

function Combobox({ onchange }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  React.useEffect(() => {
    onchange(value);
  }, [value, onchange]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? topics.find((topic) => topic === value) : "Select Topic..."}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
       className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search topic..." className="h-9" />
          <CommandList>
            <CommandEmpty>No topic found.</CommandEmpty>
            <CommandGroup>
              {topics.map((topic) => (
                <CommandItem
                  key={topic}
                  value={topic}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {topic}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === topic ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}