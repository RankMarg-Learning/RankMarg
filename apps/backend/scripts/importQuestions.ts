import { PrismaClient } from "@prisma/client";
import { QuestionType, QuestionFormat } from "@repo/db/enums";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface OptionData {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
}

interface QuestionData {
  id: string;
  slug: string;
  title: string;
  type: QuestionType;
  format: QuestionFormat;
  content: string;
  difficulty: number;
  pyqYear: string;
  questionTime: number;
  hint: string;
  isPublished: boolean;
  createdBy: string;
  subtopicId: string;
  topicId: string;
  subjectId: string;
  book?: string;
  commonMistake?: string;
  isNumerical?: number;
  solution?: string;
}

async function main() {
  const questionsPath = path.join(__dirname, "questions.json");
  const optionsPath = path.join(__dirname, "options.json");

  // Load questions and options JSON
  const questions: QuestionData[] = JSON.parse(
    fs.readFileSync(questionsPath, "utf-8")
  );
  const options: OptionData[] = JSON.parse(
    fs.readFileSync(optionsPath, "utf-8")
  );

  const optionsByQuestionId = options.reduce<Record<string, OptionData[]>>(
    (acc, option) => {
      if (!acc[option.questionId]) {
        acc[option.questionId] = [];
      }
      acc[option.questionId].push(option);
      return acc;
    },
    {}
  );

  for (const question of questions) {
    const relatedOptions = optionsByQuestionId[question.id] || [];

    await prisma.question.create({
      data: {
        id: question.id,
        slug: question.slug,
        title: question.title,
        type: question.type,
        format: question.format,
        content: question.content,
        difficulty: question.difficulty,
        pyqYear: question.pyqYear,
        questionTime: question.questionTime,
        hint: question.hint,
        isPublished: question.isPublished,
        createdBy: question.createdBy,
        subTopic: {
          connect: { id: question.subtopicId },
        },
        topic: {
          connect: { id: question.topicId },
        },
        subject: {
          connect: { id: question.subjectId },
        },
        book: question.book ?? null,
        commonMistake: question.commonMistake ?? null,
        isNumerical: question.isNumerical ?? null,
        solution: question.solution ?? null,

        options: {
          create: relatedOptions.map((opt) => ({
            id: opt.id,
            content: String(opt.content),
            isCorrect: opt.isCorrect,
          })),
        },
      },
    });
  }

  console.log("✅ Questions and related options imported successfully.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(() => prisma.$disconnect());
