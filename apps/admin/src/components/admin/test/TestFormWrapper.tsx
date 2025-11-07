"use client";

import React from 'react';
import { test } from '@/types/typeAdmin';
import TestBuilder from './TestBuilder';

/**
 * Backward compatibility wrapper for the old TestForm component
 * This allows existing code to continue working while using the new optimized system
 */
interface TestFormProps {
  initialTest?: test;
  onSave: (test: Partial<test>) => void;
  onCancel: () => void;
  loading: boolean;
}

const TestFormWrapper: React.FC<TestFormProps> = (props) => {
  return <TestBuilder {...props} />;
};

export default TestFormWrapper;
