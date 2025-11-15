"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Shuffle, Check as CheckIcon, ChevronsUpDown } from "lucide-react";
import SelectFilter from "@/components/SelectFilter";
import { filterData } from "@/constant/topics"; // Add your filterData here if needed.
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/common-ui";
import { Button } from "@repo/common-ui";
import { Badge } from "@repo/common-ui";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/common-ui";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@repo/common-ui";

const RandomQuestion = () => {
  const router = useRouter();
  const [stream, setStream] = useState("JEE"); 
  const [subject, setSubject] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [storedFilters, setStoredFilters] = useState(null);

  useEffect(() => {
    setStream(localStorage.getItem('stream') || "JEE");
    const filters = localStorage.getItem("questionFilters");
    if (filters) {
      setStoredFilters(JSON.parse(filters));
    }
  }, []);

  useEffect(() => {
    if (subject) {
      setFilteredTopics(filterData[stream]?.[subject] || []);
    } else {
      setFilteredTopics([]);
    }
    setTopicTitle(""); 
  }, [subject, stream]);

  const handleRandom = async () => {
    localStorage.setItem(
      "questionFilters",
      JSON.stringify({ stream, subject, topicTitle, difficulty })
    );

    try {
      const response = await axios.post(`/api/pickRandom`, {
        stream,
        subject,
        topic: topicTitle,
        difficulty,
      });

      if (response.data) {
        router.push(`/question/${response.data.slug}`);
      }
    } catch (error) {
      console.error("Error fetching random question:", error);
    }
  };

  return (
  //    <Skeleton className="w-full rounded-md my-2">
  //   <CardHeader>
  //     <Skeleton className="h-8 w-3/4 mx-auto" />
  //   </CardHeader>
  //   <CardContent>
  //     <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
  //       <Skeleton className="h-10 w-full" />
  //       <Skeleton className="h-10 w-full" />
  //       <Skeleton className="h-10 w-full" />
  //       <Skeleton className="h-10 w-full md:w-1/3" />
  //     </div>
  //     <div className="flex flex-wrap mt-4">
  //       <Skeleton className="h-6 w-32 mr-2 mt-2" />
  //       <Skeleton className="h-6 w-32 mr-2 mt-2" />
  //       <Skeleton className="h-6 w-32 mr-2 mt-2" />
  //     </div>
  //   </CardContent>
  // </Skeleton> :
    <Card className="w-full rounded-md my-2">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
          Pick Random Question
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          
          {/* Subject Selector */}
          <SelectFilter
            width="full"
            placeholder="Subject"
            selectName={["Default", ...Object.keys(filterData[stream] || {})]}
            onChange={(value) => setSubject(value[0] === "Default" ? "" : value[0])}
          />

          {/* Topic Selector */}
          <Combobox
            topics={filteredTopics}
            onChange={(value) => setTopicTitle(value || "")}
          />

          {/* Difficulty Selector */}
          <SelectFilter
            width="full"
            placeholder="Difficulty"
            selectName={["Default", "Easy", "Medium", "Hard"]}
            onChange={(value) => setDifficulty(value[0] === "Default" ? "" : value[0])}
          />

          {/* Shuffle Button */}
          <Button className="w-full md:w-1/3" onClick={handleRandom}>
            <Shuffle className="mr-2 h-5 w-5" />
            Pick random
          </Button>
        </div>

        {/* Display selected filters */}
        <div className="flex flex-wrap mt-4">
          
          <Badge className="mr-2 mt-2" variant="outline">
            Subject: {storedFilters?.subject || subject || "All"}
          </Badge>
          <Badge className="mr-2 mt-2" variant="outline">
            Topic: {storedFilters?.topicTitle || topicTitle || "All"}
          </Badge>
          <Badge className="mr-2 mt-2" variant="outline">
            Difficulty: {storedFilters?.difficulty || difficulty || "All"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Combobox for Topic Selector
const Combobox = ({ topics, onChange }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Select Topic..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search topic..." className="h-9" />
          <CommandList>
            <CommandEmpty>No topic found.</CommandEmpty>
            <CommandGroup>
              {topics.map((topic) => (
                <CommandItem
                  key={topic}
                  value={topic}
                  onSelect={() => {
                    setValue(topic);
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
};

export default RandomQuestion;
