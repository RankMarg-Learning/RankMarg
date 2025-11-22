"use client";

import { useQueryClient } from "@tanstack/react-query";

import { toast } from "./use-toast";

export const useQueryError = () => {
  const queryClient = useQueryClient();

  const handleError = (error: any, context?: string) => {
    console.error(`Query error${context ? ` in ${context}` : ""}:`, error);

    let errorMessage = "Something went wrong. Please try again.";

    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
      duration: 5000,
    });
  };

  const handleMutationError = (error: any, context?: string) => {
    console.error(`Mutation error${context ? ` in ${context}` : ""}:`, error);

    let errorMessage = "Failed to save changes. Please try again.";

    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
      duration: 5000,
    });
  };

  const retryQuery = async (queryKey: any[], context?: string) => {
    try {
      await queryClient.refetchQueries({ queryKey });
      toast({
        title: "Success",
        description: "Data refreshed successfully.",
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      handleError(error, context);
    }
  };

  const invalidateAndRefetch = async (queryKey: any[], context?: string) => {
    try {
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.refetchQueries({ queryKey });
    } catch (error) {
      handleError(error, context);
    }
  };

  return {
    handleError,
    handleMutationError,
    retryQuery,
    invalidateAndRefetch,
  };
};
