"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SelectFilter from "@/components/SelectFilter";
import { Button } from "@/components/ui/button";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { CirclePlus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { filterData } from "@/constant/topics";
import { generateSlug } from "@/lib/generateSlug";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PYQ_Year } from "@/constant/pyqYear";
import MarkdownRenderer from "@/lib/MarkdownRenderer";
import { Checkbox } from "../ui/checkbox";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";

const QuestionFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  topicTitle: z.string().min(1, { message: "Topic title is required" }),
  std: z.string().min(1, { message: "Standard is required" }),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  subject: z.string().min(1, { message: "Subject is required" }),
  examCode: z.string().min(1, { message: "Stream is required" }),
  hint: z.string().optional(),
  tag: z.string().optional(),
  content: z.string().min(1, { message: "Content is required" }),
  category: z.number().min(1, { message: "Category is required" }),
  options: z.array(
    z.object({
      content: z.string().min(1, { message: "Option content is required" }),
      isCorrect: z.boolean(),
    })
  ).optional(),
  numericalAnswer: z.number().optional(),
  solution: z.string().optional(),
  subTopic: z.string().min(1, { message: "Sub Topic is required" }),
});

const Contribute = () => {
  const { data: session, status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "USER") {
      router.replace("/"); // Redirect to home page
    }
  }, [session, status, router]);

  const [title, setTitle] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState<
    { content: string; isCorrect: boolean }[

    ]
  >([{ content: "", isCorrect: false },
  { content: "", isCorrect: false },
  { content: "", isCorrect: false },
  { content: "", isCorrect: false },]);
  const [difficulty, setDifficulty] = useState("");
  const [subject, setSubject] = useState("");
  const [std, setStd] = useState("");
  const [tag, setTag] = useState("");
  const [stream, setStream] = useState("");
  const [hint, setHint] = useState("");
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [numericalAnswer, setNumericalAnswer] = useState<number | undefined>(
    undefined
  );
  const [category, setCategory] = useState("");
  const [questionType, setQuestionType] = useState("MCQ");
  const [solution, setSolution] = useState("");
  const [subTopic, setSubTopic] = useState("");
  const [msg, setMsg] = useState("");
  const [showSolution, setShowSolution] = useState(false);

  const handleOptionChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { content: "", isCorrect: false }]);
  };

  const slug = generateSlug(title);

  useEffect(() => {
    if (subject) {
      setFilteredTopics(filterData[stream]?.[subject] || []);
    } else {
      setFilteredTopics([]);
    }
    setTopicTitle("");
  }, [subject, stream]);

  const ContributeForm = {
    slug,
    title,
    topicTitle,
    questionType,
    std,
    difficulty,
    subject,
    stream,
    hint,
    tag,
    content,
    category,
    options,
    numericalAnswer,
    solution,
    subTopic
  };

  if (questionType === "NUM") {
    delete ContributeForm.options;
  }

  if (questionType === "MCQ") {
    delete ContributeForm.numericalAnswer;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = QuestionFormSchema.safeParse(ContributeForm);
    if (!result.success) {
      setMsg(result.error.errors.map((err) => err.message).join(", "));
      return;
    }

    try {
      const respones = await axios.post("/api/question", ContributeForm);
      setMsg(respones.data.message);
    } catch (error) {
      console.log(error);
      throw new Error("Failed to submit the form");
    }
    finally {
      setTitle("");
      setTopicTitle("");
      setContent("");
      setOptions([]);
      setDifficulty("");
      setSubject("");
      setStd("");
      setTag("");
      setStream("");
      setHint("");
      setNumericalAnswer(undefined);
      setCategory("");
      setQuestionType("mcq");
      setSolution("");
      setSubTopic("")
    }
  };

  return (
    <div className="mx-auto flex">
      <form
        className="md:col-span-8 p-4  "
        onSubmit={handleSubmit}
      >
        <div className="flex flex-wrap mx-3 mb-6   ">
          <div className="w-full  px-3 mb-6 md:mb-0">
            <label
              className="block  tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="grid-last-name"
            >
              Question Title*
            </label>
            <Input
              required
              type="text"
              className="mb-2"
              placeholder="Title"
              value={title}
              name="title"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap  mb-3 w-full">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <SelectFilter
                label="Stream*"
                width={"full"}
                placeholder="Stream"
                selectName={Object.keys(filterData)}
                onChange={(value: string[]) => setStream(value[0])}
              />

            </div>
            <div className="w-full md:w-1/2 px-3">
              <SelectFilter
                label="Class*"
                width={"full"}
                placeholder="Class"
                selectName={["Foundation", "11th", "12th"]}
                onChange={(value: string[]) => setStd(value[0])}
              />
            </div>
          </div>
          <div className="flex flex-wrap  mb-3 w-full">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <SelectFilter
                label="Subjects*"
                width={"full"}
                placeholder="Subjects"
                selectName={Object.keys(filterData[stream] || {})}
                onChange={(value: string[]) => setSubject(value[0])}
              />

            </div>
            <div className="w-full md:w-1/2 px-3">
              <label
                className="block  tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-last-name"
              >
                Topics Title*
              </label>
              <Combobox
                topics={filteredTopics}
                onchange={(newTopic: string) => {
                  setTopicTitle(newTopic);
                }}
              />

            </div>
          </div>
          <div className="flex flex-wrap  mb-3 w-full">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label
                className="block  tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-last-name"
              >
                Sub Topic*
              </label>
              <Input
                required
                type="text"
                className="mb-2"
                placeholder="Sub Topic"
                value={subTopic}
                name="Sub Topic"
                onChange={(e) => setSubTopic(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/2 px-3">

              <SelectFilter
                label="Category*"
                width={"full"}
                placeholder="Category"
                selectName={["Physics", "Chemistry", "Mathematics", "Biology"]}
                onChange={(value: string[]) => setCategory(value[0])}
              />
            </div>
          </div>
          <div className="flex flex-wrap  mb-3 w-full">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <SelectFilter
                label="Difficulty*"
                width={"full"}
                placeholder="Difficulty"
                selectName={["Easy", "Medium", "Hard"]}
                onChange={(value: string[]) => setDifficulty(value[0])}
              />

            </div>
            <div className="w-full md:w-1/2 px-3">
              <SelectFilter
                label="Tags"
                width={"full"}
                placeholder="Tags"
                selectName={PYQ_Year}
                onChange={(value: string[]) => setTag(value[0])}
              />
            </div>
          </div>

          <div className="w-full m-2">
            <Label className="block  tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="grid-last-name">Hints</Label>
            <Textarea
              className="min-h-[50px]"
              id="grid-desc"
              name="question hints"
              placeholder="Question Hinits"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
            />
          </div>
          <div className="w-full flex  ">
            <div className="flex flex-wrap  px-3 w-full md:w-1/2">
              <Label className="block  tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-last-name">Question*</Label>
              <Textarea
                className="min-h-[260px]"
                id="grid-desc"
                name="questioncontent"
                value={content}
                placeholder="Question Content"
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap  px-3 w-full md:w-1/2">
              <div className="w-full m-2 border-2 border-gray-300 p-4 rounded-md">
                <Label className="block  tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="grid-last-name">Question Preview</Label>
                <div className="w-full m-2">
                  {
                    <MarkdownRenderer content={content} />
                  }

                </div>
              </div>
            </div>
          </div>

          <div className="w-full m-2 flex">
            <div className="flex flex-wrap  px-3 w-full md:w-1/2">
              <div className="w-full m-2">
                <Label className="block  tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="grid-last-name">Question Type*</Label>
                <Tabs
                  defaultValue="MCQ"
                  onValueChange={setQuestionType}
                  value={questionType}
                >
                  <TabsList>
                    <TabsTrigger value="MCQ"

                    >MCQ</TabsTrigger>
                    <TabsTrigger value="NUM"> Numerical </TabsTrigger>
                  </TabsList>

                  <TabsContent value="MCQ">
                    {/* MCQ */}
                    <div className="flex flex-col gap-2">
                      {options.map((option, index) => (
                        <div className="flex items-center justify-center" key={index}>
                          <label>
                            <Input
                              className="h-5 w-5"
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={(e) =>
                                handleOptionChange(index, "isCorrect", e.target.checked)
                              }
                            />
                          </label>

                          <Input
                            type="text"
                            value={option.content}
                            placeholder={`Option ${index + 1}`}
                            name={`options.text[${index}]`}
                            onChange={(e) =>
                              handleOptionChange(index, "content", e.target.value)
                            }
                          />
                        </div>
                      ))}

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1"
                          onClick={addOption}
                        >
                          <CirclePlus className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Option
                          </span>
                        </Button>
                      </div>
                    </div>

                  </TabsContent>
                  <TabsContent value="NUM">
                    {/* NUM */}
                    <Input
                      type="text"
                      className="mb-2"
                      placeholder="Enter Answer"
                      name="numerical"
                      value={numericalAnswer}
                      onChange={(e) =>
                        setNumericalAnswer(parseFloat(e.target.value))
                      }
                    />
                  </TabsContent>

                </Tabs>
              </div>
            </div>
            <div className={`flex flex-wrap  px-3 w-full md:w-1/2 ${options.length > 0 ? "block" : "hidden"}`}>
              <div className="w-full m-2 border-2 border-gray-300 p-4 rounded-md">
                <Label className="block  tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="grid-last-name">Options Preview</Label>
                <div className="w-full m-2 space-y-1">
                  {options.map(
                    (option, index) =>
                      option.content && ( // Check if the content is not empty
                        <div key={index}>
                          <div className="p-2 w-full rounded-md bg-gray-100 flex items-center gap-2">
                            <Checkbox checked={option.isCorrect} />
                            <MarkdownRenderer content={option.content} />
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex">
            <div className="flex flex-wrap  px-3 w-full md:w-1/2">
              <Label className="block  tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-last-name">Add Solution</Label>
              <Switch
                checked={showSolution}
                onCheckedChange={setShowSolution}
              />
            </div>
          </div>

          {showSolution && (
            <div className="w-full flex">
              <div className="flex flex-wrap  px-3 w-full md:w-1/2">
                <Label className="block  tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="grid-last-name">Solution</Label>
                <Textarea
                  className="min-h-[260px]"
                  id="grid-desc"
                  name="questionsolution"
                  value={solution}
                  placeholder="Question Solution"
                  onChange={(e) => setSolution(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap  px-3 w-full md:w-1/2">
                <div className="w-full m-2 border-2 border-gray-300 p-4 rounded-md">
                  <Label className="block  tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="grid-last-name">Solution Preview</Label>
                  <div className="w-full m-2">
                    {
                      <MarkdownRenderer content={solution} />
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {msg && <p className="text-red-500 text-sm ml-4">{msg}</p>}
          <div className="w-full m-2 flex justify-end">
            <Button className="px-4">Submit</Button>
          </div>
        </div>
      </form>

    </div>
  );

};

export default Contribute;

interface ComboboxProps {
  topics: string[];
  onchange: (value: string) => void;
}

function Combobox({ topics, onchange }: ComboboxProps) {
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