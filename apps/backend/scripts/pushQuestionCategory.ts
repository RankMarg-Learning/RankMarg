import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const jsonDir = path.join(__dirname, "json");
  const questionCategoriesFilePath = path.join(
    jsonDir,
    "NEET-Questions",
    "QuestionCategory.json"
  );
  const questionCategories = JSON.parse(
    fs.readFileSync(questionCategoriesFilePath, "utf8")
  );
  console.log("Total question categories:", questionCategories.length);

  console.log("Inserting question categories...");
  let questionCategoryCount = 0;
  for (const questionCategory of questionCategories) {
    try {
      await prisma.questionCategory.create({
        data: questionCategory,
      });
      if (questionCategoryCount % 10 === 0) {
        console.log(`- Processed ${questionCategoryCount} question categories`);
      }
      questionCategoryCount++;
    } catch (error) {
      console.error(
        `❌ Error inserting question category ${questionCategory.id}:`,
        error
      );
    }
  }
  console.log("✅ Question categories inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(() => prisma.$disconnect());
