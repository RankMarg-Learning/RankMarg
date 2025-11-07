// Export the main TestBuilder component
export { default as TestBuilder } from './TestBuilder';

// Export individual form components (if needed separately)
export { default as BasicInfoForm } from './forms/BasicInfoForm';
export { default as SectionsForm } from './forms/SectionsForm';
export { default as ReviewForm } from './forms/ReviewForm';

// Export context and hooks
export { TestBuilderProvider, useTestBuilder } from '../../../context/TestBuilderContext';
export type { TestBuilderState, TestSection } from '../../../context/TestBuilderContext';

// Export form field components (for reuse)
export {
  TextField,
  NumberField,
  TextareaField,
  SelectField,
  SwitchField,
  FormSection,
  FormGrid,
} from './components/FormField';

// Export navigation component
export { default as StepNavigation } from './components/StepNavigation';

// Export optimized question selector
export { default as OptimizedQuestionSelector } from './components/OptimizedQuestionSelector';

// Keep backward compatibility by exporting the old schema
export { testSchema } from './TestForm';

// For easy migration, export TestBuilder as TestForm as well
export { default as TestForm } from './TestBuilder';
