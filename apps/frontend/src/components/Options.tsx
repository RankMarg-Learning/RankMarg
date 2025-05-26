"use client"
import React, { useMemo } from 'react';
import Select from './Select';
import { Input } from './ui/input';
import { Option, QuestionType } from '@prisma/client';
import { cn } from '../lib/utils'; 

interface OptionsProps {
  isAnswered?: boolean;
  type: QuestionType;
  options: Option[];
  selectedValues: number[];
  onSelectionChange: (values: number[]) => void;
  numericalValue: number | null;
  onNumericalChange: (value: number | null) => void;
  correctOptions?: number[];
  correctNumericalValue?: number | null; 
}

const Options: React.FC<OptionsProps> = ({
  isAnswered = false,
  type,
  options,
  selectedValues,
  onSelectionChange,
  numericalValue,
  onNumericalChange,
  correctOptions,
  correctNumericalValue
}) => {

  const isMultiple = useMemo(() => {
    if (!options?.length) return false;
    return options.filter(option => option.isCorrect).length > 1;
  }, [options]);

  const handleOptionChange = (index: number): void => {
    if (isMultiple) {
      onSelectionChange(
        selectedValues.includes(index)
          ? selectedValues.filter(val => val !== index)
          : [...selectedValues, index]
      );
    } else {
      onSelectionChange([index]);
    }
  };

  const getInputStatus = () => {
    if (!isAnswered || correctNumericalValue === undefined || numericalValue === null) {
      return 'default';
    }
    return numericalValue === correctNumericalValue ? 'correct' : 'incorrect';
  };

  const inputStatus = getInputStatus();

  if (!options?.length && type === "MULTIPLE_CHOICE") return null;

  return (
    <>
      {type === "MULTIPLE_CHOICE" && (
        <>
          <h1 className="md:text-lg font-bold">Options</h1>
          <div className="flex flex-col noselect">
            <Select
              options={options}
              selectedValues={selectedValues}
              onChange={handleOptionChange}
              isMultiple={isMultiple}
              correctOptions={correctOptions}
              isDisabled={isAnswered}
            />
          </div>
        </>
      )}
      
      {type === "INTEGER" && (
        <>
          <h1 className="md:text-lg font-bold mb-2">Numerical</h1>
          <div className="relative">
            <Input
              type="number"
              disabled={isAnswered}
              step="any"
              placeholder="Enter your answer"
              className={cn(
                "p-3 m-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                isAnswered && inputStatus === 'correct' && "border-green-500 ring-green-500",
                isAnswered && inputStatus === 'incorrect' && "border-red-500 ring-red-500"
              )}
              value={numericalValue ?? ""}
              onChange={(e) => onNumericalChange(parseFloat(e.target.value) || null)}
            />
            
            {isAnswered  && correctNumericalValue !== undefined && (
              <div className="text-sm text-gray-600 ml-2 mt-1">
                Correct answer: {correctNumericalValue}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default React.memo(Options);