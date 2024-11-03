"use client";

import ChallengeOver from "@/components/challenge/challengeOver";
import Loading from "@/components/Loading";
import QuestionUI from "@/components/QuestionUI";
import { useSocket } from "@/hooks/useSocket";
import { QuestionProps } from "@/types";
import { Question } from "@prisma/client";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {  use, useEffect, useState } from "react";
import { set } from "react-hook-form";

interface attempDataProps {
  questionId: string;
  userId: string;
  selectedOptions: number[];
  isCorrect: boolean;
}

const questionType = "MCQ" as "MCQ" | "NUM" | "TF";
const questions = [
  {
    "id": "fb085ef3-842b-46c3-a5a2-533d5f7f372c",
    "slug": "physics-gravity-mcq-1",
    "type": questionType,
    "content": "What is the acceleration due to gravity on Earth?",
    "difficulty": "medium",
    "topic": "Gravity",
    "subject": "Physics",
    "class": "10",
    "tag": "science",
    "options": [
      { "id": "opt1", "content": "9.8 m/s²", "isCorrect": true },
      { "id": "opt2", "content": "8.8 m/s²", "isCorrect": false },
      { "id": "opt3", "content": "10 m/s²", "isCorrect": false },
      { "id": "opt4", "content": "9.0 m/s²", "isCorrect": false }
    ],
    "isnumerical": null,
    "isTrueFalse": false,
    "accuracy": 0.75

  },
  {
    "id": "fb085ef3-842b-46c3-a5a2-533d5f7f372c",
    "slug": "math-pythagoras-mcq-1",
    "type": questionType,
    "content": "In a right triangle, if a=3 and b=4, what is the length of the hypotenuse?",
    "difficulty": "easy",
    "topic": "Pythagoras Theorem",
    "subject": "Math",
    "class": "9",
    "tag": "geometry",
    "options": [
      { "id": "opt1", "content": "5", "isCorrect": true },
      { "id": "opt2", "content": "6", "isCorrect": false },
      { "id": "opt3", "content": "7", "isCorrect": false },
      { "id": "opt4", "content": "8", "isCorrect": false }
    ],
    "isnumerical": null,
    "isTrueFalse": false,
    "accuracy": 0.85
  },
  {
    "id": "q3",
    "slug": "chemistry-water-mcq-1",
    "type": questionType,
    "content": "What is the chemical formula of water?",
    "difficulty": "easy",
    "topic": "Water",
    "subject": "Chemistry",
    "class": "8",
    "tag": "chemistry",
    "options": [
      { "id": "opt1", "content": "H2O", "isCorrect": true },
      { "id": "opt2", "content": "CO2", "isCorrect": false },
      { "id": "opt3", "content": "O2", "isCorrect": false },
      { "id": "opt4", "content": "CH4", "isCorrect": false }
    ],
    "isnumerical": null,
    "isTrueFalse": false,
    "accuracy": 0.90
  },
  {
    "id": "q4",
    "slug": "biology-photosynthesis-mcq-1",
    "type": questionType,
    "content": "Which of the following is necessary for photosynthesis?",
    "difficulty": "medium",
    "topic": "Photosynthesis",
    "subject": "Biology",
    "class": "9",
    "tag": "plant-biology",
    "options": [
      { "id": "opt1", "content": "Oxygen", "isCorrect": false },
      { "id": "opt2", "content": "Carbon dioxide", "isCorrect": true },
      { "id": "opt3", "content": "Nitrogen", "isCorrect": false },
      { "id": "opt4", "content": "Hydrogen", "isCorrect": false }
    ],
    "isnumerical": null,
    "isTrueFalse": false,
    "accuracy": 0.80
  },
  {
    "id": "q5",
    "slug": "history-independence-mcq-1",
    "type": questionType,
    "content": "In which year did India gain independence?",
    "difficulty": "easy",
    "topic": "Independence",
    "subject": "History",
    "class": "8",
    "tag": "independence",
    "options": [
      { "id": "opt1", "content": "1947", "isCorrect": true },
      { "id": "opt2", "content": "1950", "isCorrect": false },
      { "id": "opt3", "content": "1939", "isCorrect": false },
      { "id": "opt4", "content": "1965", "isCorrect": false }
    ],
    "isnumerical": null,
    "isTrueFalse": false,
    "accuracy": 0.95
  }
]

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


  
const getButtonColor = (index) => {
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