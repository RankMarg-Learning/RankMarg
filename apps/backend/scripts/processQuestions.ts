import * as fs from "fs";
import * as path from "path";

interface QuestionData {
  id: string;
  slug: string;
  title: string;
  type: string;
  format: string;
  content: string;
  difficulty: number;
  subtopicId: string;
  topicId: string;
  subjectId: string;
  class?: string; // This will be removed
  pyqYear: string;
  book?: string;
  commonMistake?: string;
  isNumerical?: number;
  solution?: string;
  questionTime?: number;
  hint?: string;
  isPublished?: boolean;
  createdBy?: string;
}

interface ProcessedQuestionData {
  id: string;
  slug: string;
  title: string;
  type: string;
  format: string;
  content: string;
  difficulty: number;
  subtopicId: string;
  topicId: string;
  subjectId: string;
  pyqYear: string; // Updated format
  book?: string;
  commonMistake?: string;
  isNumerical?: number;
  solution?: string;
  questionTime?: number;
  hint?: string;
  isPublished?: boolean;
  createdBy?: string;
}

function updatePyqYear(pyqYear: string): string {
  // Extract year from "PYQ-2025" format
  const yearMatch = pyqYear.match(/PYQ-(\d{4})/);
  if (yearMatch) {
    const year = yearMatch[1];
    return `[NEET]-${year}`;
  }

  // If it doesn't match the expected format, return as is
  return pyqYear;
}

function processQuestions(questions: QuestionData[]): ProcessedQuestionData[] {
  return questions.map((question) => {
    const { class: classField, ...questionWithoutClass } = question;

    return {
      ...questionWithoutClass,
      pyqYear: updatePyqYear(question.pyqYear),
    };
  });
}

async function main() {
  const inputPath = path.join(__dirname, "Question - 14-8-25.json");
  const outputPath = path.join(__dirname, "Question - Processed.json");

  try {
    console.log("📖 Reading questions data...");
    const questionsData: QuestionData[] = JSON.parse(
      fs.readFileSync(inputPath, "utf-8")
    );

    console.log(`📊 Found ${questionsData.length} questions to process`);

    console.log("🔧 Processing questions...");
    const processedQuestions = processQuestions(questionsData);

    console.log("💾 Writing processed data...");
    fs.writeFileSync(
      outputPath,
      JSON.stringify(processedQuestions, null, 2),
      "utf-8"
    );

    console.log(
      `✅ Successfully processed ${processedQuestions.length} questions`
    );
    console.log(`📁 Output saved to: ${outputPath}`);

    // Show some sample transformations
    console.log("\n📋 Sample transformations:");
    const sampleQuestions = processedQuestions.slice(0, 3);
    sampleQuestions.forEach((question, index) => {
      console.log(`Question ${index + 1}:`);
      console.log(`  Original pyqYear: ${questionsData[index].pyqYear}`);
      console.log(`  Updated pyqYear: ${question.pyqYear}`);
      console.log(`  Class field removed: ✅`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error processing questions:", error);
    process.exit(1);
  }
}

main();
