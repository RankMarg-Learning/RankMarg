import { View, Text } from "react-native";
import React from "react";
import tw from "@/utils/tailwind";

const ForgotPassword = () => {
  return (
    <View style={tw`flex-1 items-center justify-center`}>
      <Text style={tw`text-2xl font-bold`}>ForgotPassword</Text>
    </View>
  );
};

export default ForgotPassword;
