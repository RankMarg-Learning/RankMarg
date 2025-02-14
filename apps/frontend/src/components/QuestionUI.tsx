"use client";
import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import MarkdownRenderer from '@/lib/MarkdownRenderer'
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

interface QuestionShowProps extends Omit<QuestionProps, "challenge" | "attempts" | "createdAt"> { }


interface QuestionUIProps {
  question: QuestionShowProps;
  isSolutionShow?: string;
  handleAttempt: (attemptData: attempDataProps) => void;
}

const QuestionUI = ({ question, handleAttempt,isSolutionShow }: QuestionUIProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast()
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ActiveCooldown, setActiveCooldown] = useState<number>(isSolutionShow ? 0 : question?.ActiveCooldown);


  const checkIfSelectedIsCorrect = () => {
    if (!question.options) {
      return false;
    }
    if (selectedOptions.length > 0) {

      return selectedOptions.every((index) => question.options[index].isCorrect);
    } else {
      if (selectedOption === null) {
        return false; // No selection
      }
     

      if (question.type === "NUM") {
        return question.isnumerical === selectedOption;
      }

      return question.options[selectedOption].isCorrect;
    }

  };


  useEffect(() => {
    if (ActiveCooldown > 0) {
      const timer = setTimeout(() => {
        setActiveCooldown(ActiveCooldown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [ActiveCooldown]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };



  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session) {
      router.push('/sign-in')
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setSelectedOption(null)
      setSelectedOptions([])
      setIsSubmitting(false)
      setActiveCooldown(86400)
    }, 2000);

    const isCorrect = checkIfSelectedIsCorrect();
    const attemptData = {
      questionId: question.id, 
      userId: session?.user?.id,
      isCorrect: isCorrect,
      selectedOptions

    };
    if (isCorrect) {
      toast({
        title: "Correct Answer",
        description: "Your answer was correct.",
        variant: "success",
        duration: 1000
      }
      );
    }
    else {
      toast({
        title: "Incorrect Answer",
        description: "Try Next Time!",
        variant: "destructive",
        duration: 1000
      });
    }

    handleAttempt(attemptData);

    // setSelectedOption(null);
    // setSelectedOptions([]);

  }
  const receiverEmail = 'support@rankmarg.in';
  const subject = `Report: ${question?.slug}`;
  const body = `Hello,

I would like to report an issue with the following question:

- **Question Id**: ${question?.id}

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
    <div className="min-h-[calc(100vh-120px)] flex flex-col bg-white" id="fullscreen">
      {/* Navbar */}

      <div className="flex flex-wrap md:flex-row flex-1 p-4   rounded-lg overflow-hidden  ">
        {/* Left side: Question */}
        {/* <form action=""></form> */}
        <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r ">
          <h1 className="text-2xl font-bold mb-4 ">Question</h1>
          <div className=" flex flex-wrap space-x-2 items-center my-3 space-y-1 ">
           
            <Badge variant={"Medium"}>{question?.difficulty}</Badge>
            <Badge
              variant="secondary"
            >
              <span>Subject:</span>
              {question?.subject}
            </Badge>
            <Badge
              variant="secondary"
            >
              <span>Class:</span>
              {question?.class}
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
            <MarkdownRenderer content={question?.content} />
          </div>


        </div>


        {/* Right side: Options */}
        <div className="w-full md:w-1/2 p-6 relative noselect">
          {ActiveCooldown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-yellow-600  bg-opacity-80  font-bold z-10">
              <div className='flex flex-col justify-center items-center'>
                Cooldown: {formatTime(ActiveCooldown)}

                <div className="text-red-400 text-center text-sm">
                  ⚠️ You must wait until the cooldown ends before answering again.
                </div>
              </div>
            </div>
          )}

          <div className={ActiveCooldown > 0 ? "blur-sm  pointer-events-none" : ""}>
            <Options
              type={question?.type}
              options={question?.options}
              selectedOption={selectedOption}
              selectedOptions={selectedOptions}
              setSelectedOption={setSelectedOption}
              setSelectedOptions={setSelectedOptions}
              correctOptions={isSolutionShow ? (question?.options
                ?.map((option, index) => ({ ...option, index })) // Add index to each option
                .filter((option) => option.isCorrect) // Filter correct options
                .map((option) => option.index)) : (isSubmitting ? (question?.options
                ?.map((option, index) => ({ ...option, index })) // Add index to each option
                .filter((option) => option.isCorrect) // Filter correct options
                .map((option) => option.index)) : [])}
            />

            {question?.type === "NUM" && (isSubmitting || isSolutionShow)  && (
              <div className={`flex flex-wrap space-x-2 mt-4 ${selectedOption === question?.isnumerical ? 'text-green-500' : 'text-red-500'}`}>
                Correct Answer: {question?.isnumerical}
              </div>
            )}

            <form onSubmit={handleOnSubmit} className={`${isSolutionShow ? `hidden` : `block`} mt-4`}>
              <Button type="submit" className="mt-4">Submit</Button>
            </form>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-1 justify-between">
          
        </div>
        {isSolutionShow && (question?.solution ? (
           <div className="w-full p-6 border-t mt-4">
           <h2 className="text-xl font-bold mb-2">Solution</h2>
           <MarkdownRenderer content={question?.solution} />
         </div>
          
        ): (
          <div className="w-full p-6 border-t mt-4">
            <span>Solution is not available</span>
          </div>
        ))}
      </div>

    </div>
  )
}



export default QuestionUI