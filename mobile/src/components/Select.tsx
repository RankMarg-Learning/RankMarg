import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '@/utils/tailwind';

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
  onPress,
}: {
  index: number;
  option: Option;
  isSelected: boolean;
  isCorrect?: boolean;
  isDisabled?: boolean;
  isMultiple: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    disabled={isDisabled}
    onPress={onPress}
    style={tw`${isCorrect ? 'bg-green-200 border-green-500' : isSelected ? 'bg-primary-100 border-primary-500' : 'bg-gray-50'} flex-row items-center m-2 p-2 md:p-3 rounded-md border`}
  >
    <View style={tw`pr-2`}>
      <View
        style={tw`${isSelected ? 'bg-white border-yellow-800' : 'border-black'} ${isMultiple ? 'rounded-sm' : 'rounded-full'} h-5 w-5 border-2 bg-yellow-50`}
      />
    </View>
    <View>
      <Text style={tw`text-gray-900`}>{option.content}</Text>
    </View>
  </TouchableOpacity>
));

SelectOption.displayName = 'SelectOption';

const Select: React.FC<SelectProps> = ({
  options,
  selectedValues,
  onChange,
  isMultiple,
  correctOptions,
  isDisabled = false,
}) => {
  return (
    <View>
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
            onPress={() => onChange(index)}
          />
        );
      })}
    </View>
  );
};

export default memo(Select);


