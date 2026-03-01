export { default as TestBuilder } from "./TestBuilder";

export { default as BasicInfoForm } from "./forms/BasicInfoForm";
export { default as SectionsForm } from "./forms/SectionsForm";
export { default as ReviewForm } from "./forms/ReviewForm";

export { IntelligentSectionBuilder } from "./intelligent-builder/IntelligentSectionBuilder";
export { QuestionPreviewList } from "./QuestionPreviewList";

export {
  TestBuilderProvider,
  useTestBuilder,
} from "../../../context/TestBuilderContext";
export type {
  TestBuilderState,
  TestSection,
} from "../../../context/TestBuilderContext";

export {
  TextField,
  NumberField,
  TextareaField,
  SelectField,
  SwitchField,
  FormSection,
  FormGrid,
} from "./components/FormField";

export { default as StepNavigation } from "./components/StepNavigation";

export { default as OptimizedQuestionSelector } from "./components/OptimizedQuestionSelector";

export { testSchema } from "./TestForm";

export { default as TestForm } from "./TestBuilder";
