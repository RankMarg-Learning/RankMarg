"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function InstructorDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>
      
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-purple-800">Instructor Portal</h3>
        <p className="text-sm text-purple-600">
          This content is visible to instructors and administrators.
        </p>
      </div>
    </div>
  );
}
