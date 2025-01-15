// utils/generateSlug.ts
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

/**
 * Generates a slug based on the title, type, and difficulty
 * @param title - The title of the question
 * @param subjects - The type of the question (e.g., MCQ, TRUE_FALSE)
 * @returns A unique slug for the question
 */
export function generateSlug(title: string, subjects: string) {
  const baseSlug = `${slugify(subjects, {
    lower: true,
    strict: true,
  })}-${slugify(title, { lower: true, strict: true })}`;

  const uniqueId = uuidv4().slice(0, 8);
  return `${baseSlug}-${uniqueId}`;
}