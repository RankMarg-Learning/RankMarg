// utils/generateSlug.ts
import { Stream } from "@prisma/client";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

/**
 * Generates a slug based on the title, type, and difficulty
 * @param title - The title of the question
 * @param stream - The type of the question (e.g., MCQ, TRUE_FALSE)
 * @returns A unique slug for the question
 */
export function generateSlug(title: string, stream: string) {
  const baseSlug = `${slugify(stream, {
    lower: true,
    strict: true,
  })}-${slugify(title, { lower: true, strict: true })}`;

  const uniqueId = uuidv4().slice(0, 8);
  return `${baseSlug}-${uniqueId}`;
}