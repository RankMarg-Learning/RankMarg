"use client";

import ChallengeOver from "@/components/challenge/challengeOver";
import Loading from "@/components/Loading";
import QuestionUI from "@/components/QuestionUI";
import { useSocket } from "@/hooks/useSocket";
import { QuestionProps } from "@/types";
import axios from "axios";
import {  useEffect, useState } from "react";

interface attempDataProps {
  questionId: string;
  userId: string;
  selectedOptions: number[];
  isCorrect: boolean;
}



interface QuestionShowProps extends Omit<QuestionProps, "challenge" | "attempts" | "createdAt"> {}


const ChallengePage = ({params}:{params:{challengeId:string}}) => {
  const { challengeId } = params;
  const socket = useSocket();
  const [start, setStart] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const [overDetails, setOverDetails] = useState({}); 
  const [questions, setQuestions] = useState<QuestionShowProps[]>([]);
  

  useEffect(() => {
    if (!socket) return;
    socket.send(
      JSON.stringify({
        type: "CHALLENGE_JOIN",
        payload: { challengeId }
      })
    );


    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "CHALLENGE_START":
          socket.send(
            JSON.stringify({
              type: "CHALLENGE_JOIN",
              payload: { challengeId }
            })
          );
          break;
        case "CHALLENGE_JOIN":
          setStart(true);
          setQuestions(message.payload.questions);
          break;
        case "QUESTION_ANSWERED":
          break;
        case "CHALLENGE_OVER":
          setStart(false);
          setIsOver(true);
          setOverDetails(message.payload);
          break;
      }
    };
  }, [socket]);


//  console.log("All Question",questions);

 
  
 
 

  
  
 const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
 const [attempts, setAttempts] = useState([]);
 const question = questions[currentQuestionIndex];

 const handleAttempt = async(attemptData:attempDataProps) => {
  try {
     await axios.post('/api/attempts', attemptData);
     
     setAttempts((prev) => [
      ...prev,
      { questionId: attemptData.questionId, isCorrect: attemptData.isCorrect }
    ]);
    socket.send(
      JSON.stringify({
        type: "CHALLENGE_UPDATE",
        payload: {
          challengeId,
          questionId: attemptData.questionId,
          isCorrect: attemptData.isCorrect
        }
      })
    );

    // Move to the next question after submission
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  } catch (error) {
    console.error(error);
  }
}


  
const getButtonColor = (index:number) => {
  const attempt = attempts.find(
    (attempt) => attempt.questionId === questions[index].id
  );
  if (attempt) {
    return attempt.isCorrect ? 'bg-green-500' : 'bg-red-500';
  }
  return index === currentQuestionIndex ? 'bg-yellow-500' : 'bg-gray-300';
};




  return (
    <div>

      {
        !isOver ? (
      question && start ? (
        <>
          <QuestionUI question={question} handleAttempt={handleAttempt} />
          <div className="sticky bottom-0 bg-white p-4 flex justify-center space-x-4">
            {/* Map question numbers */}
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`text-white font-semibold py-2 px-4 rounded ${getButtonColor(index)}`}
                disabled={index !== currentQuestionIndex}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      ) : (
        <Loading />
      )
        ):(
          <ChallengeOver details={overDetails} />
        )
    }
    </div>
  )
}

export default ChallengePage