import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import tw from '@/utils/tailwind';

export function Accordion({ children }: { children: React.ReactNode }) {
  return <View>{children}</View>;
}

export function AccordionItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <View>{children}</View>;
}

export function AccordionTrigger({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={tw`py-2`}>
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </TouchableOpacity>
  );
}

export function AccordionContent({ children }: { children: React.ReactNode }) {
  return <View style={tw`mt-2`}>{children}</View>;
}


