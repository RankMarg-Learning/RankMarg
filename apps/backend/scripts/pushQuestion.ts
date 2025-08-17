import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function importData() {
  const jsonDir = path.join(__dirname, "json");
  //   const jeeQuestionsPath = path.join(jsonDir, "JEE-Questions");
  const neetQuestionsPath = path.join(jsonDir, "NEET-Questions");

  // Import JEE Questions
  //   await importQuestionsAndOptions(jeeQuestionsPath);

  // Import NEET Questions
  await importQuestionsAndOptions(neetQuestionsPath);
}

async function importQuestionsAndOptions(directory: string) {
  console.log(`📁 Processing directory: ${directory}`);

  const questionsFilePath = path.join(directory, "Question.json");
  const optionsFilePath = path.join(directory, "Option.json");
  const subjectsFilePath = path.join(directory, "Subject.json");
  const subTopicsFilePath = path.join(directory, "SubTopic.json");
  const topicsFilePath = path.join(directory, "Topic.json");
  const questionCategoriesFilePath = path.join(
    directory,
    "QuestionCategory.json"
  );

  // Check if files exist
  console.log("🔍 Checking if files exist...");
  console.log(`Questions file exists: ${fs.existsSync(questionsFilePath)}`);
  console.log(`Options file exists: ${fs.existsSync(optionsFilePath)}`);
  console.log(`Subjects file exists: ${fs.existsSync(subjectsFilePath)}`);
  console.log(`SubTopics file exists: ${fs.existsSync(subTopicsFilePath)}`);
  console.log(`Topics file exists: ${fs.existsSync(topicsFilePath)}`);
  console.log(
    `QuestionCategories file exists: ${fs.existsSync(questionCategoriesFilePath)}`
  );

  if (
    fs.existsSync(questionsFilePath) &&
    fs.existsSync(optionsFilePath) &&
    fs.existsSync(subjectsFilePath) &&
    fs.existsSync(subTopicsFilePath) &&
    fs.existsSync(topicsFilePath) &&
    fs.existsSync(questionCategoriesFilePath)
  ) {
    console.log("✅ All files found, starting import process...");

    try {
      const questions = JSON.parse(fs.readFileSync(questionsFilePath, "utf-8"));
      const options = JSON.parse(fs.readFileSync(optionsFilePath, "utf-8"));
      const subjects = JSON.parse(fs.readFileSync(subjectsFilePath, "utf-8"));
      const subTopics = JSON.parse(fs.readFileSync(subTopicsFilePath, "utf-8"));
      const topics = JSON.parse(fs.readFileSync(topicsFilePath, "utf-8"));
      const questionCategories = JSON.parse(
        fs.readFileSync(questionCategoriesFilePath, "utf-8")
      );

      console.log(`📊 Data loaded:`);
      console.log(`  - Questions: ${questions.length}`);
      console.log(`  - Options: ${options.length}`);
      console.log(`  - Subjects: ${subjects.length}`);
      console.log(`  - Topics: ${topics.length}`);
      console.log(`  - SubTopics: ${subTopics.length}`);
      console.log(`  - QuestionCategories: ${questionCategories.length}`);

      // Insert Subjects
      console.log("📝 Inserting Subjects...");
      for (const subject of subjects) {
        try {
          await prisma.subject.upsert({
            where: { id: subject.id },
            update: {},
            create: subject,
          });
        } catch (error) {
          console.error(`❌ Error inserting subject ${subject.id}:`, error);
        }
      }
      console.log("✅ Subjects inserted");

      // Insert Topics
      console.log("📝 Inserting Topics...");
      for (const topic of topics) {
        try {
          await prisma.topic.upsert({
            where: { id: topic.id },
            update: {},
            create: topic,
          });
        } catch (error) {
          console.error(`❌ Error inserting topic ${topic.id}:`, error);
        }
      }
      console.log("✅ Topics inserted");

      // Insert SubTopics
      console.log("📝 Inserting SubTopics...");
      for (const subTopic of subTopics) {
        try {
          await prisma.subTopic.upsert({
            where: { id: subTopic.id },
            update: {},
            create: subTopic,
          });
        } catch (error) {
          console.error(`❌ Error inserting subtopic ${subTopic.id}:`, error);
        }
      }
      console.log("✅ SubTopics inserted");

      const optionsByQuestionId = options.reduce(
        (acc: Record<string, any[]>, option: any) => {
          if (!acc[option.questionId]) {
            acc[option.questionId] = [];
          }
          acc[option.questionId].push(option);
          return acc;
        },
        {} as Record<string, any[]>
      );

      console.log("📝 Inserting Questions with Options...");
      let questionCount = 0;
      for (const question of questions) {
        try {
          const relatedOptions = optionsByQuestionId[question.id] || [];

          await prisma.question.upsert({
            where: { id: question.id },
            update: {},
            create: {
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
                create: relatedOptions.map(
                  (opt: {
                    id: string;
                    content: string;
                    isCorrect: boolean;
                  }) => ({
                    id: opt.id,
                    content: opt.content,
                    isCorrect: opt.isCorrect,
                  })
                ),
              },
            },
          });
          questionCount++;
          if (questionCount % 50 === 0) {
            console.log(`  - Processed ${questionCount} questions`);
          }
        } catch (error) {
          console.error(`❌ Error inserting question ${question.id}:`, error);
        }
      }
      console.log(`✅ All ${questionCount} questions inserted successfully`);

      // Insert QuestionCategories AFTER Questions are inserted
      console.log("📝 Inserting QuestionCategories...");
      let questionCategoryCount = 0;
      for (const category of questionCategories) {
        try {
          await prisma.questionCategory.create({
            data: category,
          });
          if (questionCategoryCount % 50 === 0) {
            console.log(
              `  - Processed ${questionCategoryCount} question categories`
            );
          }
          questionCategoryCount++;
        } catch (error) {
          console.error(`❌ Error inserting category:`, error);
        }
      }
      console.log("✅ QuestionCategories inserted");
    } catch (error) {
      console.error("❌ Error during import process:", error);
    }
  } else {
    console.error("❌ Some required files are missing!");
  }
}

importData()
  .catch((e) => {
    console.error(e);
  })
  .finally(() => prisma.$disconnect());
