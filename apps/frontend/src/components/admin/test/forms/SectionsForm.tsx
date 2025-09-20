"use client";

import React, { useState } from 'react';
import { PlusCircle, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTestBuilder, TestSection } from '../../../../context/TestBuilderContext';
import { 
  TextField, 
  NumberField, 
  SwitchField, 
  FormSection, 
  FormGrid 
} from '../components/FormField';
import OptimizedQuestionSelector from '../components/OptimizedQuestionSelector';
import { testQuestion } from '@/types/typeAdmin';

interface SectionCardProps {
  section: TestSection;
  index: number;
  onUpdate: (index: number, updates: Partial<TestSection>) => void;
  onRemove: (index: number) => void;
  onQuestionsChange: (sectionIndex: number, questions: testQuestion[]) => void;
  examCode: string;
  canRemove: boolean;
  isEditing: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  index,
  onUpdate,
  onRemove,
  onQuestionsChange,
  examCode,
  canRemove,
  isEditing,
}) => {
  const [maxQuestions, setMaxQuestions] = useState(section.testQuestion.length || 10);

  const handleFieldChange = (field: keyof TestSection, value: any) => {
    onUpdate(index, { [field]: value });
  };

  const handleMaxQuestionsChange = (value: number) => {
    setMaxQuestions(value);
    // Don't update the section here, this is just for the question limit
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Section {index + 1}</CardTitle>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <FormGrid cols={3} gap={3}>
          <div className="col-span-2">
            <TextField
              label="Section Name"
              value={section.name}
              onChange={(value) => handleFieldChange('name', value)}
              placeholder="Enter section name"
              required
              id={`section-${index}-name`}
            />
          </div>
          
          <NumberField
            label="Max Questions"
            value={maxQuestions}
            onChange={handleMaxQuestionsChange}
            placeholder="Count"
            min={1}
            required
            id={`section-${index}-maxQuestions`}
          />
        </FormGrid>

        <FormGrid cols={3} gap={3}>
          <NumberField
            label="Marks per Correct Answer"
            value={section.correctMarks}
            onChange={(value) => handleFieldChange('correctMarks', value)}
            placeholder="4"
            min={0}
            step={0.5}
            required
            id={`section-${index}-correctMarks`}
          />
          
          <NumberField
            label="Negative Marks"
            value={section.negativeMarks}
            onChange={(value) => handleFieldChange('negativeMarks', value)}
            placeholder="1"
            min={0}
            step={0.5}
            required
            id={`section-${index}-negativeMarks`}
          />
          
          <div className="space-y-2">
            <SwitchField
              label="Optional Section"
              checked={section.isOptional}
              onChange={(checked) => handleFieldChange('isOptional', checked)}
              description="Allow partial completion"
              id={`section-${index}-optional`}
            />
            
            {section.isOptional && (
              <NumberField
                label="Max Attempt"
                value={section.maxQuestions || 0}
                onChange={(value) => handleFieldChange('maxQuestions', value)}
                placeholder="Max questions to attempt"
                min={0}
                max={section.testQuestion.length}
                id={`section-${index}-maxAttempt`}
              />
            )}
          </div>
        </FormGrid>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Questions for this section</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {section.testQuestion.length} / {maxQuestions} selected
            </Badge>
          </div>

          <OptimizedQuestionSelector
            key={`${section.id}-${examCode}`}
            isEditing={isEditing}
            selectedQuestions={section.testQuestion}
            onQuestionsChange={(questions) => onQuestionsChange(index, questions)}
            maxQuestions={maxQuestions}
            examCode={examCode}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const SectionsForm: React.FC = () => {
  const { 
    state, 
    addSection, 
    updateSection, 
    removeSection, 
    setSectionQuestions,
    setErrors 
  } = useTestBuilder();

  const handleSectionUpdate = React.useCallback((index: number, updates: Partial<TestSection>) => {
    updateSection(index, updates);
  }, [updateSection]);

  const handleSectionRemove = React.useCallback((index: number) => {
    removeSection(index);
  }, [removeSection]);

  const handleSectionQuestionsChange = React.useCallback((sectionIndex: number, questions: testQuestion[]) => {
    setSectionQuestions(sectionIndex, questions);
  }, [setSectionQuestions]);

  const validateSections = React.useCallback(() => {
    const errors: Record<string, string> = {};
    
    if (state.testSections.length === 0) {
      errors.sections = 'At least one section is required';
    }
    
    state.testSections.forEach((section, index) => {
      if (!section.name.trim()) {
        errors[`section-${index}-name`] = 'Section name is required';
      }
      if (section.correctMarks <= 0) {
        errors[`section-${index}-correctMarks`] = 'Correct marks must be positive';
      }
      if (section.negativeMarks < 0) {
        errors[`section-${index}-negativeMarks`] = 'Negative marks cannot be negative';
      }
      if (section.testQuestion.length === 0) {
        errors[`section-${index}-questions`] = 'At least one question is required';
      }
    });

    return errors;
  }, [state.testSections]);

  // Validate sections and update errors when sections change
  React.useEffect(() => {
    const errors = validateSections();
    setErrors(errors);
  }, [validateSections, setErrors]);

  if (!state.examCode) {
    return (
      <FormSection 
        title="Test Sections"
        description="Please select an exam code in the basic information step first"
      >
        <div className="text-center py-8 text-muted-foreground">
          Select an exam code to continue with sections setup
        </div>
      </FormSection>
    );
  }

  return (
    <FormSection 
      title="Test Sections"
      description="Create sections and select questions for your test"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sections ({state.testSections.length})</span>
          {state.testSections.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Total: {state.testSections.reduce((sum, section) => sum + section.testQuestion.length, 0)} questions
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSection}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      {state.errors.sections && (
        <div className="text-red-500 text-sm">{state.errors.sections}</div>
      )}

      {state.testSections.length > 0 ? (
        <div className="space-y-4">
          {state.testSections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              onUpdate={handleSectionUpdate}
              onRemove={handleSectionRemove}
              onQuestionsChange={handleSectionQuestionsChange}
              examCode={state.examCode}
              canRemove={state.testSections.length > 1}
              isEditing={state.isEditing}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <div className="space-y-2">
            <p className="text-muted-foreground">No sections created yet</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addSection}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create your first section
            </Button>
          </div>
        </div>
      )}
    </FormSection>
  );
};

export default SectionsForm;
