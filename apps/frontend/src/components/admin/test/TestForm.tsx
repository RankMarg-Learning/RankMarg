"use client";

import React from 'react';
import { test, ExamType, TestStatus, Visibility } from '@/types/typeAdmin';
import TestBuilder from './TestBuilder';
import { z } from "zod";

// Keep the original schema for backward compatibility
export const testSchema = z.object({
  title: z.string().nonempty("Title is required"),
  description: z
    .string()
    .optional(),
  examCode: z.string().nonempty("Exam Code is required"),
  duration: z
    .number({ invalid_type_error: "Duration must be a number" })
    .min(1, "Duration must be at least 1 minute"),
  examType: z.nativeEnum(ExamType),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  status: z.nativeEnum(TestStatus),
  visibility: z.nativeEnum(Visibility),
  startTime: z
    .union([z.string(), z.date()]) 
    .transform((val) => (typeof val === "string" ? new Date(val) : val)) ,
  endTime: z
    .union([z.date(), z.null()])
    .refine((date) => !date || date > new Date(), {
      message: "End time must be in the future",
    }),
    testSection: z.array(z.object({
    name: z.string().nonempty("Section name is required"),
    isOptional: z.boolean(),
    maxQuestions: z.number().int().optional(),
    correctMarks: z.number().positive("Marks per correct answer must be a positive number"),
    negativeMarks: z.number().positive("Negative marks must be a positive number"),
    testQuestion: z.array(z.object({
      id: z.string().nonempty(),
      title: z.string().optional(),
    })),
  })).min(1, "At least one section is required"),
});

/**
 * TestForm - Updated to use the new optimized TestBuilder system
 * Maintains backward compatibility with the original interface
 */
interface TestFormProps {
  initialTest?: test;
  onSave: (test: Partial<test>) => void;
  onCancel: () => void;
  loading: boolean;
}

const TestForm: React.FC<TestFormProps> = (props) => {
  return <TestBuilder {...props} />;
};

export default TestForm;
