import MarkdownRenderer from '@/lib/MarkdownRenderer';
import React from 'react';

interface Option {
  content: string;
}

interface SelectProps {
  options: Option[];
  selectedOption: number | null; 
  selectedOptions: number[]; 
  handleOptionChange: (content: number) => void;
  isMultiple: boolean; 
  correctOptions?: number[];
}

const Select: React.FC<SelectProps> = ({ options, selectedOption, selectedOptions, handleOptionChange, isMultiple, correctOptions }) => {
  return (
    <div>
      {options.map((option, index) => {
        const isSelected = isMultiple
          ? selectedOptions.includes(index) 
          : selectedOption === index; 

        const isCorrect = correctOptions?.includes(index);

        return (
          <div
            key={index}
            className={`flex items-center m-2 p-3 rounded-md cursor-pointer
              ${isCorrect ? 'bg-green-500' : isSelected ? 'bg-yellow-500' : 'bg-muted hover:bg-yellow-100'}
            `}
            onClick={() => handleOptionChange(index)}
          >
            <div className="inline-flex items-center pr-2">
              <label className="flex items-center cursor-pointer relative">
                <input
                  type="checkbox"
                  className={`peer h-5 w-5 cursor-pointer transition-all appearance-none
                    ${isMultiple ? 'rounded-sm border-yellow-300 bg-yellow-50 border-2' 
                      : 'rounded-full border-yellow-300 bg-yellow-50 border-2'}
                    ${isSelected ? 'bg-white checked:border-yellow-800' : 'border-black'}
                    checked:bg-white
                  `}
                  name={option.content}
                  value={option.content}
                  checked={isSelected}
                  readOnly
                  id={`check-${index}`}
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
                    ></path>
                  </svg>
                </span>
              </label>
            </div>
            <h1 className="cursor-pointer">
              <MarkdownRenderer content={option.content} />
            </h1>
          </div>
        );
      })}
    </div>
  );
};

export default Select;
