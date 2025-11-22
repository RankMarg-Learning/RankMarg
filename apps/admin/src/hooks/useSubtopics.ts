import { createUseSubtopics } from "@repo/common-ui";

import { addSubtopic, deleteSubtopic, getSubtopics, updateSubtopic } from "@/services/subtopic.service";
import { useQueryError } from "@/hooks/useQueryError";

export const useSubtopics = createUseSubtopics({
  getSubtopics,
  addSubtopic,
  updateSubtopic,
  deleteSubtopic,
  useQueryError,
});
