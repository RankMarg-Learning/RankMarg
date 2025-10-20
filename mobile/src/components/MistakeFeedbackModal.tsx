import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import tw from '@/utils/tailwind';

export default function MistakeFeedbackModal({
  attemptId,
  isOpen,
  onClose,
}: {
  attemptId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={tw`flex-1 items-center justify-center bg-black/40`}>
        <View style={tw`bg-white rounded-lg p-4 w-80`}>
          <Text style={tw`text-base font-semibold mb-2`}>Report a mistake</Text>
          <Text style={tw`text-gray-600 mb-4`}>Attempt ID: {attemptId}</Text>
          <TouchableOpacity onPress={onClose} style={tw`bg-primary-600 rounded px-4 py-2`}>
            <Text style={tw`text-white text-center`}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


