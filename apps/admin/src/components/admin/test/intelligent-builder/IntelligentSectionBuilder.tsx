"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/common-ui";
import { useSubjects } from "@/hooks/useSubject";
import { SectionForm } from "./SectionForm";
import { ConfiguredSectionsTable } from "./ConfiguredSectionsTable";
import { SectionFilter } from "./types";

interface IntelligentSectionBuilderProps {
  examCode: string;
  sections: SectionFilter[];
  onAddSection: (section: SectionFilter) => void;
  onRemoveSection: (index: number) => void;
  isSavingSection?: boolean;
}

export function IntelligentSectionBuilder({
  examCode,
  sections,
  onAddSection,
  onRemoveSection,
  isSavingSection = false,
}: IntelligentSectionBuilderProps) {
  const normalizedExamCode =
    examCode && examCode !== "Default" ? examCode : undefined;
  const { subjects, isLoading: isLoadingSubjects } = useSubjects(normalizedExamCode);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Configuration</CardTitle>
        <CardDescription>
          Configure sections with intelligent filters for question selection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionForm
          examCode={examCode}
          subjects={subjects}
          isLoadingSubjects={isLoadingSubjects}
          onSubmit={onAddSection}
          isSavingSection={isSavingSection}
        />

        <ConfiguredSectionsTable
          sections={sections}
          subjects={subjects}
          onRemoveSection={onRemoveSection}
        />
      </CardContent>
    </Card>
  );
}
