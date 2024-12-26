"use client";
import React, {  useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import MarkdownRenderer from '@/lib/MarkdownRenderer'
import { Input } from './ui/input';
import Select from './Select';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { QuestionProps } from '@/types';
import Options from './Options';


interface attempDataProps {
  questionId: string;
  userId: string;
  isCorrect: boolean;
  selectedOptions: number[];
}

interface QuestionShowProps extends Omit<QuestionProps, "challenge" | "attempts" | "createdAt"> {}


interface QuestionUIProps {
  question: QuestionShowProps;
  handleAttempt: (attemptData: attempDataProps) => void;
}

const QuestionUI = ({ question, handleAttempt }: QuestionUIProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast()
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  
  const checkIfSelectedIsCorrect = () => {
    if (!question.options) {
      return false; 
    }
    if (selectedOptions.length >0) {

      return selectedOptions.every((index) => question.options[index].isCorrect);
    } else {
      if (selectedOption === null) {
        return false; // No selection
      }
      if(question.type === "TF"){

        return (question.isTrueFalse === !selectedOption);
      }

      if(question.type === "NUM"){
        return question.isnumerical === selectedOption;
      }
      
      return question.options[selectedOption].isCorrect;
    }
    
  };

  
  
  
  

  
 
  const handleOnSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(!session){
      router.push('/sign-in')
      return;
    }

    const isCorrect = checkIfSelectedIsCorrect();
    const attemptData = {
      questionId: question.id, // Replace with actual question ID
      userId: session?.user?.id, // Replace with actual user ID
      isCorrect: isCorrect,
      selectedOptions
      
    };
    if(isCorrect){
      toast({
        title: "Correct Answer",
        description: "Your answer was correct.",
        variant: "success",
        duration:1000
      }
      );
    }
    else{
      toast({
        title: "Incorrect Answer",
        description: "Try Next Time!",
        variant: "destructive",
        duration:1000
    });
  }

  handleAttempt(attemptData);
    
  setSelectedOption(null);
  setSelectedOptions([]);

  }
  const receiverEmail = 'support@rankmarg.in'; 
  const subject = `Report: ${question.slug}`;
  const body = `Hello,

I would like to report an issue with the following question:

- **Question Id**: ${question.id}

Please look into this issue at your earliest convenience. Here is some additional information (optional):

[Provide details about the issue, such as incorrect information, inappropriate content, etc.]

Thank you for your assistance.

Best regards,
[Your Name]
`;
  const handleReport = () => {
    const mailtoLink = `mailto:${receiverEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink; 
  };
  
  
  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col bg-gray-100" id="fullscreen">
      {/* Navbar */}
      
      <div className="flex flex-wrap md:flex-row flex-1 p-4 bg-white  rounded-lg overflow-hidden  ">
        {/* Left side: Question */}
        {/* <form action=""></form> */}
        <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r ">
          <h1 className="text-2xl font-bold mb-4 ">Question</h1>
          <div className=" flex flex-wrap space-x-2 items-center my-3 space-y-1 ">
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <ThumbsUp color="red" size={18} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Like</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <ThumbsDown size={18} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dislike</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}

            {/*!Change Difficulty type to enum <Badge variant={question.difficulty}>{question.difficulty}</Badge> */}
            <Badge variant={"Medium"}>{question.difficulty}</Badge>
            <Badge
              variant="secondary"
            > 
              <span>Subject:</span>
              {question.subject}
            </Badge>
            <Badge
              variant="secondary"
            > 
              <span>Class:</span>
              {question.class}
            </Badge>
            <Badge
                  variant="Hard" 
                  className="cursor-pointer"
                  onClick={handleReport}
                >
                  Report
            </Badge>
          </div>
          <div className='noselect'>
          <MarkdownRenderer content={question.content} />
          </div>

          
        </div>
        

        {/* Right side: Options */}
        <div className="w-full md:w-1/2 p-6 ">
          <Options type={question.type} options={question.options}
          selectedOption={selectedOption}
          selectedOptions={selectedOptions}
          setSelectedOption={setSelectedOption}
          setSelectedOptions={setSelectedOptions}
          />
          <form onSubmit={handleOnSubmit}>
            <Button type="submit" className="mt-4">Submit</Button>
          </form>
       



        </div>
        <div className="flex flex-wrap md:flex-1 justify-between">
          {/* <div className={tags ? `` : `hidden`}> */}
            {/* <div className={tags ? `flex flex-wrap space-x-2 mt-4` : `hidden`}> */}
            {/* <div className={`flex flex-wrap space-x-2 mt-4`}>
              {question.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="mb-2">
                  {tag}
                </Badge>
              ))}
            </div> */}
          {/* </div> */}
        </div>
      </div>
      
    </div>
  )
}



export default QuestionUI