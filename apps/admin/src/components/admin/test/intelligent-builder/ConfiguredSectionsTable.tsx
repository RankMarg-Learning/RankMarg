"use client";

import { memo, useMemo } from "react";
import { Button } from "@repo/common-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/common-ui";
import { Label } from "@repo/common-ui";
import type { Subject } from "@/types/typeAdmin";
import { SectionFilter } from "./types";

interface ConfiguredSectionsTableProps {
  sections: SectionFilter[];
  subjects: Subject[];
  onRemoveSection: (index: number) => void;
}

export const ConfiguredSectionsTable = memo(function ConfiguredSectionsTable({
  sections,
  subjects,
  onRemoveSection,
}: ConfiguredSectionsTableProps) {
  const subjectMap = useMemo(() => {
    return subjects.reduce<Record<string, string>>((acc, subject) => {
      acc[subject.id] = subject.name;
      return acc;
    }, {});
  }, [subjects]);

  if (!sections.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Label>Configured Sections ({sections.length})</Label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Section</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Topics</TableHead>
            <TableHead>Marks</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section, index) => (
            <TableRow key={`${section.name}-${index}`}>
              <TableCell className="font-medium">{section.name}</TableCell>
              <TableCell>{section.questionCount}</TableCell>
              <TableCell>{subjectMap[section.subjectId] || "N/A"}</TableCell>
              <TableCell>{section.topicIds.length} topics</TableCell>
              <TableCell>
                +{section.correctMarks} / -{section.negativeMarks}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveSection(index)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
