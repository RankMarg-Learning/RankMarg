"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpenIcon, Clock, Target } from 'lucide-react';
import { useTestBuilder } from '../../../../context/TestBuilderContext';
import { 
  SelectField, 
  FormSection, 
  FormGrid 
} from '../components/FormField';
import { DateTimePicker } from '@/utils/test/date-time-picker';
import { Label } from '@/components/ui/label';
import { Visibility, TestStatus } from '@repo/db/enums';
import { TextFormator } from '@/utils/textFormator';

const ReviewForm: React.FC = () => {
  const { state, setReviewInfo, totalQuestions, totalMarks } = useTestBuilder();

  const visibilityOptions = Object.entries(Visibility).map(([key, value]) => ({
    value: key,
    label: TextFormator(value),
  }));

  const testStatusOptions = Object.entries(TestStatus).map(([key, value]) => ({
    value: key,
    label: TextFormator(value),
  }));

  const handleFieldChange = (field: string, value: any) => {
    setReviewInfo({ [field]: value });
  };

  return (
    <FormSection 
      title="Review & Finalize"
      description="Review your test details and set publication settings"
    >
      {/* Test Summary */}
      <div className="bg-secondary/10 p-6 rounded-lg space-y-4">
        <h3 className="font-semibold text-lg">Test Summary</h3>
        
        <FormGrid cols={2} gap={4}>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Test Title</p>
            <p className="font-medium">{state.title}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Exam Code</p>
            <Badge variant="outline">{state.examCode}</Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Duration</p>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{state.duration} minutes</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Difficulty</p>
            <Badge variant="outline">{TextFormator(state.difficulty)}</Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Exam Type</p>
            <Badge variant="outline">{TextFormator(state.examType)}</Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Statistics</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <BookOpenIcon className="h-3 w-3" />
                {totalQuestions} Questions
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {totalMarks} Marks
              </Badge>
            </div>
          </div>
        </FormGrid>

        {state.description && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{state.description}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Sections Summary */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">
          Test Sections ({state.testSections.length})
        </h3>
        
        <div className="space-y-3">
          {state.testSections.map((section, index) => (
            <div key={section.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">
                  Section {index + 1}: {section.name}
                </h4>
                {section.isOptional && (
                  <Badge variant="outline" className="text-xs">
                    Optional
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Questions: </span>
                  <span className="font-medium">{section.testQuestion.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Marks/Q: </span>
                  <span className="font-medium">{section.correctMarks}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Negative: </span>
                  <span className="font-medium">{section.negativeMarks}</span>
                </div>
                {section.isOptional && section.maxQuestions && (
                  <div>
                    <span className="text-muted-foreground">Max Attempt: </span>
                    <span className="font-medium">{section.maxQuestions}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Publication Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Publication Settings</h3>
        
        <FormGrid cols={2} gap={4}>
          <div className="space-y-2">
            <Label>Start Date & Time</Label>
            <DateTimePicker
              date={state.startTime ?? undefined}
              setDate={(date) => handleFieldChange('startTime', date ?? null)}
            />
          </div>

          <div className="space-y-2">
            <Label>End Date & Time</Label>
            <DateTimePicker
              date={state.endTime ?? undefined}
              setDate={(date) => handleFieldChange('endTime', date ?? null)}
            />
            {!state.endTime && (
              <p className="text-gray-500 text-sm">∞ (No end time set)</p>
            )}
          </div>
        </FormGrid>

        <SelectField
          label="Visibility"
          value={state.visibility}
          onChange={(value) => handleFieldChange('visibility', value)}
          placeholder="Select visibility"
          options={visibilityOptions}
          required
          id="visibility"
        />

        <SelectField
          label="Test Status"
          value={state.status}
          onChange={(value) => handleFieldChange('status', value)}
          placeholder="Select test status"
          options={testStatusOptions}
          required
          id="status"
        />
      </div>

      {/* Final Stats */}
      <div className="bg-primary/5 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5 text-primary" />
              <span className="font-medium">{totalQuestions} Total Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-medium">{totalMarks} Total Marks</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">{state.duration} Minutes</span>
            </div>
          </div>
          <Badge variant="default" >
            Ready to Save
          </Badge>
        </div>
      </div>
    </FormSection>
  );
};

export default ReviewForm;
