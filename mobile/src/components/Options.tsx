import React, { useMemo } from 'react';
import { View, TextInput, Text } from 'react-native';
import tw from '@/utils/tailwind';
import Select from '@/src/components/Select';

type QuestionType = 'MULTIPLE_CHOICE' | 'INTEGER';

interface Option {
  content: string;
  isCorrect?: boolean;
}

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
  correctNumericalValue,
}) => {
  const isMultiple = useMemo(() => {
    if (!options?.length) return false;
    return options.filter((o) => o.isCorrect).length > 1;
  }, [options]);

  const handleOptionChange = (index: number) => {
    if (isMultiple) {
      onSelectionChange(
        selectedValues.includes(index)
          ? selectedValues.filter((val) => val !== index)
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

  if (!options?.length && type === 'MULTIPLE_CHOICE') return null;

  return (
    <>
      {type === 'MULTIPLE_CHOICE' && (
        <>
          <Text style={tw`text-lg font-bold`}>Options</Text>
          <View>
            <Select
              options={options}
              selectedValues={selectedValues}
              onChange={handleOptionChange}
              isMultiple={isMultiple}
              correctOptions={correctOptions}
              isDisabled={isAnswered}
            />
          </View>
        </>
      )}

      {type === 'INTEGER' && (
        <>
          <Text style={tw`text-lg font-bold mb-2`}>Numerical</Text>
          <View>
            <TextInput
              keyboardType="numeric"
              editable={!isAnswered}
              placeholder="Enter your answer"
              style={tw`border rounded px-3 py-2 m-2`}
              value={numericalValue === null ? '' : String(numericalValue)}
              onChangeText={(t) => onNumericalChange(parseFloat(t) || null)}
            />
            {isAnswered && correctNumericalValue !== undefined && (
              <Text style={tw`text-sm text-gray-600 ml-2 mt-1`}>
                Correct answer: {correctNumericalValue}
              </Text>
            )}
          </View>
        </>
      )}
    </>
  );
};

export default React.memo(Options);


