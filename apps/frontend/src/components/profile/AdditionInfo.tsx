import { Separator } from "@repo/common-ui";
import React from "react";

interface AdditionInfoProps {
  additionInfo: {
    totalAttempt: number;
    totalQuestions: number;
    totalChallenge: number;
    accuracy: number;
  };
}



const AdditionInfo:React.FC<AdditionInfoProps> = ({additionInfo}) => {
  const { totalAttempt, totalQuestions, totalChallenge, accuracy } = additionInfo;
  return (
    <>
      <div className="flex flex-row w-full bg-white justify-center md:space-x-8 space-x-3 ">
        <div className="m-2 text-center">
          <h3 className="md:text-4xl text-3xl font-bold ">
            {totalAttempt}
            <span className="text-xs ">/ {totalQuestions
              }</span>
          </h3>
          <p className="text-gray-600 text-base font-thin leading-6  ">
            Solved Problems
          </p>
        </div>
        <Separator orientation="vertical" className="h-auto" />
        <div className="m-2 text-center">
        <h3 className="md:text-4xl text-3xl font-bold ">
           {totalChallenge}
          </h3>
          <p className="text-gray-600 text-base font-thin  leading-6">
            Challenges
          </p>
          {/* <h3 className="md:text-4xl text-3xl font-bold flex justify-center items-center text-red-500">
            10 <Flame color="red" fill="red" />
          </h3>
          <p className="text-gray-600 text-base font-thin leading-6">Streak</p> */}
        </div>
        <Separator orientation="vertical" className="h-auto" />
        <div className="m-2 text-center">
          <h3 className="md:text-4xl text-3xl font-bold ">
            {parseFloat(accuracy.toFixed(2))}
            <span className="text-base ">%</span>
          </h3>
          <p className="text-gray-600 text-base font-thin  leading-6">
            Accurcy
          </p>
        </div>
      </div>
    </>
  );
};

export default AdditionInfo;
