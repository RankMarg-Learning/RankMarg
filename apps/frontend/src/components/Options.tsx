"use client"
import React, { useEffect, useState } from 'react'
import Select from './Select'
import { Option } from '@prisma/client';
import { Input } from './ui/input';

interface OptionsProps {
  type: string;
  options: Option[];
  selectedOption: number | null;
  correctOptions?: number[];
  selectedOptions: number[];
  setSelectedOption: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<number[] | []>>;
}

const TF = [
  {
    content: "True",
  },
  {
    content: "False",
  },
];

const Options = ({ type, options, selectedOption, selectedOptions,correctOptions ,setSelectedOption, setSelectedOptions }: OptionsProps) => {
  const [isMultiple, setIsMultiple] = useState(false);
  useEffect(() => {
    if (!options) return;
    const correctOptionsCount = options.filter(option => option.isCorrect).length;
    setIsMultiple(correctOptionsCount > 1);
  }, [options]);


  const handleOptionChange = (content: number) => {
    if (isMultiple) {
      if (selectedOptions.includes(content)) {
        setSelectedOptions(selectedOptions.filter(option => option !== content));
      } else {
        setSelectedOptions([...selectedOptions, content]);
      }
    } else {
      setSelectedOption(content);
    }
  };
  return (
    <>
      {/* MCQ */}
      {type === "MCQ" && (
        <>
          <h1 className="md:text-2xl font-bold ">Options</h1>
          <div className="flex flex-col noselect">
            <Select
              options={options}
              selectedOption={selectedOption}
              selectedOptions={selectedOptions}
              handleOptionChange={handleOptionChange}
              isMultiple={isMultiple}
              correctOptions={correctOptions}
            />
          </div>
        </>)
      }
      {
        type === "NUM" && (
          <>
            <h1 className="md:text-2xl font-bold mb-4">Numerical </h1>
            <Input
              type="number"
              step={0.01}
              placeholder="Enter your answer"
              className="p-3 m-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={selectedOption ?? ""}
              onChange={(e) => setSelectedOption(parseFloat(e.target.value) || null)}
            />
          </>
        )
      }
      {
        type === "TF" && (
          <>
            <h1 className="md:text-2xl font-bold mb-4">True/False </h1>
            <div className="flex flex-col space-y-2">
              <Select
                options={TF}
                selectedOption={selectedOption}
                selectedOptions={selectedOptions}
                handleOptionChange={handleOptionChange}
                isMultiple={isMultiple}
                correctOptions={correctOptions}
              />
            </div>
          </>
        )
      }
    </>
  )
}

export default Options