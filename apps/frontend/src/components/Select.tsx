import MarkdownRenderer from '@/lib/MarkdownRenderer';
import React, { memo } from 'react';

interface Option {
  content: string;
  isCorrect?: boolean;
}

interface SelectProps {
  options: Option[];
  selectedValues: number[]; 
  onChange: (index: number) => void;
  isMultiple: boolean; 
  correctOptions?: number[];
  isDisabled?: boolean;
}

const SelectOption = memo(({ 
  index, 
  option, 
  isSelected, 
  isCorrect, 
  isDisabled,
  isMultiple,
  onClick 
}: { 
  index: number;
  option: Option;
  isSelected: boolean;
  isCorrect?: boolean;
  isDisabled?: boolean;
  isMultiple: boolean;
  onClick: () => void;
}) => (
  <div
    className={`flex items-center m-2 p-3 rounded-md cursor-pointer border
      ${isCorrect ? 'bg-green-200 border-green-500' : 
        isSelected ? 'bg-primary-100 border-primary-500' : 
        'bg-gray-50 hover:bg-yellow-50'}
    `}
    onClick={isDisabled ? undefined : onClick}
  >
    <div className="inline-flex items-center pr-2">
      <label className="flex items-center cursor-pointer relative">
        <input
          type="checkbox"
          className={`peer h-5 w-5 cursor-pointer transition-all appearance-none
            ${isSelected ? 'bg-white checked:border-yellow-800' : 'border-black'}
            ${isMultiple ? 'rounded-sm' : 'rounded-full'} 
            border-yellow-300 bg-yellow-50 border-2
            checked:bg-white
          `}
          checked={isSelected}
          readOnly
          disabled={isDisabled}
        />
        <span className="absolute text-yellow opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </label>
    </div>
    <div className="cursor-pointer">
      <MarkdownRenderer content={option.content} className="text-base" />
    </div>
  </div>
));

SelectOption.displayName = 'SelectOption';

const Select: React.FC<SelectProps> = ({ 
  options, 
  selectedValues, 
  onChange, 
  isMultiple, 
  correctOptions,
  isDisabled = false
}) => {
  return (
    <div>
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(index);
        const isCorrect = correctOptions?.includes(index);
        
        return (
          <SelectOption
            key={index}
            index={index}
            option={option}
            isSelected={isSelected}
            isCorrect={isCorrect}
            isDisabled={isDisabled || Boolean(correctOptions?.length)}
            isMultiple={isMultiple}
            onClick={() => onChange(index)}
          />
        );
      })}
    </div>
  );
};

export default memo(Select);