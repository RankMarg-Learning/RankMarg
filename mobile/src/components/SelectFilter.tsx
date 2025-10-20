import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '@/utils/tailwind';

type FilterSelectProps = {
  label?: string;
  width?: string; // unused in RN, kept for API parity
  placeholder: string;
  selectName: string[];
  isMultiple?: boolean;
  onChange: (values: string[]) => void;
};

export default function FilterSelect({
  label,
  placeholder,
  selectName,
  isMultiple = false,
  onChange,
}: FilterSelectProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const toggleValue = (value: string) => {
    let newSelectedValues: string[];
    if (isMultiple) {
      newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
    } else {
      newSelectedValues = [value];
    }
    setSelectedValues(newSelectedValues);
    onChange(newSelectedValues);
  };

  const removeValue = (value: string) => {
    const updated = selectedValues.filter((v) => v !== value);
    setSelectedValues(updated);
    onChange(updated);
  };

  return (
    <View>
      {!!label && (
        <Text style={tw`text-xs font-bold text-gray-700 mb-2`}>{label}</Text>
      )}

      <View style={tw`border rounded p-3 bg-white`}>
        <Text style={tw`text-gray-500 mb-2`}>{placeholder}</Text>
        <View style={tw`flex-row flex-wrap -m-1`}>
          {selectName.map((name) => {
            const active = selectedValues.includes(name);
            return (
              <TouchableOpacity
                key={name}
                onPress={() => toggleValue(name)}
                style={tw`${active ? 'bg-primary-100 border-primary-500' : 'bg-gray-50 border-gray-200'} m-1 px-3 py-1.5 rounded border`}
              >
                <Text style={tw`${active ? 'text-primary-800' : 'text-gray-700'}`}>{name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isMultiple && selectedValues.length > 0 && (
        <View style={tw`flex-row flex-wrap mt-2`}>
          {selectedValues.map((val) => (
            <View key={val} style={tw`border rounded px-2 py-1 m-1 flex-row items-center`}> 
              <Text style={tw`text-gray-800`}>{val}</Text>
              <TouchableOpacity onPress={() => removeValue(val)} style={tw`ml-2`}>
                <Text style={tw`text-red-500`}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}


