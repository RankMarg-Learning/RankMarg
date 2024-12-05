import { topics } from "@/constant/topics";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import SelectFilter from "@/components/SelectFilter";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { CheckIcon, Shuffle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { set } from "react-hook-form";



const RandomQuestion = ({ setLoading }) => {
  
  const router = useRouter();
  const [topicTitle, setTopicTitle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [subject, setSubject] = useState("");
  const [storedFilters, setStoredFilters] = useState(null); 

  useEffect(() => {
    const filters = localStorage.getItem("questionFilters");
    if (filters) {
      setStoredFilters(JSON.parse(filters));
    }
  }, []);

  const handleRandom = async () => {
    localStorage.setItem(
      "questionFilters",
      JSON.stringify({ topicTitle, difficulty, subject })
    );

    setLoading(true);

    try {
      const response = await axios.post(`/api/pickRandom`, {
        topic: topicTitle,
        difficulty: difficulty,
        subject: subject,
      });

      if (response.data) {
        router.push(`/questions/${response.data.slug}`);
      }
    } catch (error) {
      console.error("Error fetching random question:", error);
    } finally {
      setLoading(false);
    }
  };
 
  
  
  return (
        <Card className="w-full rounded-md">
            <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
                    Pick Random Question
                </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <Combobox
                    onchange={(newTopic: string) => {
                      if(newTopic === 'Default'){
                        setTopicTitle("");
                      }
                      else{
                        setTopicTitle(newTopic);
                      }
                  }}
                />
                <SelectFilter
                    width={"full"}
                    placeholder="Difficulty"
                    selectName={["Default","Easy", "Medium", "Hard"]}
                    onChange={
                      (value:string[])=>{
                        if(value[0]==="Default"){
                          setDifficulty("");
                      }
                      else{
                        setDifficulty(value[0]);
                      }
                    }
                  }
                />
                <SelectFilter
                    width={"full"}
                    placeholder="Subject"
                    selectName={["Default","Physics", "Chemistry", "Mathematics"]}
                    onChange={
                      (value:string[])=>{
                        if(value[0]==="Default"){
                          setSubject("");
                      }
                      else{
                        setSubject(value[0]);
                      }
                    }
                  }
                />
                <Button className="w-full md:w-1/3 "
                onClick={handleRandom}
                >
                    <Shuffle className="mr-2 h-5 w-5" />
                    Pick random
                </Button>
            </div>
            <div className="flex flex-wrap">
                <Badge className="mr-2 mt-2" variant="outline">Topic: {storedFilters?.topicTitle || "All"}</Badge>
                <Badge className="mr-2 mt-2" variant="outline">Difficulty: {storedFilters?.difficulty || "All"}</Badge>
                <Badge className="mr-2 mt-2" variant="outline">Subject: {storedFilters?.subject || "All"}</Badge>
            </div>
           
            </CardContent>
        </Card> 
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


export default RandomQuestion;