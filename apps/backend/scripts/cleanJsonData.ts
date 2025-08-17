import * as fs from "fs";
import * as path from "path";

interface Subject {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
  weightage: number;
}

interface SubTopic {
  id: string;
  name: string;
  topicId: string;
  orderIndex?: number;
  estimatedMinutes?: number;
}

interface Question {
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
  pyqYear?: string;
  book?: string;
  commonMistake?: string;
  isNumerical?: number;
  solution?: string;
  questionTime?: number;
  hint?: string;
  isPublished?: boolean;
  createdBy?: string;
}

interface Option {
  id: string;
  content: string;
  isCorrect: boolean;
  questionId: string;
}

function readJsonFile<T>(filePath: string): T[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

function writeJsonFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Successfully wrote to ${filePath}`);
  } catch (error) {
    console.error(`❌ Error writing to ${filePath}:`, error);
  }
}

async function cleanData() {
  const baseDir = path.join(__dirname, "json", "NEET-Questions");

  // Read all data files
  console.log("📖 Reading data files...");
  const subjects = readJsonFile<Subject>(path.join(baseDir, "Subject.json"));
  const topics = readJsonFile<Topic>(path.join(baseDir, "Topic.json"));
  const subTopics = readJsonFile<SubTopic>(path.join(baseDir, "SubTopic.json"));
  const questions = readJsonFile<Question>(path.join(baseDir, "Question.json"));
  const options = readJsonFile<Option>(path.join(baseDir, "Option.json"));

  console.log("\n📊 Initial counts:");
  console.log(`Subjects: ${subjects.length}`);
  console.log(`Topics: ${topics.length}`);
  console.log(`SubTopics: ${subTopics.length}`);
  console.log(`Questions: ${questions.length}`);
  console.log(`Options: ${options.length}`);

  // Create sets of valid IDs
  const subjectIds = new Set(subjects.map((s) => s.id));

  // Filter topics with valid subject IDs
  const validTopics = topics.filter((topic) => subjectIds.has(topic.subjectId));
  const topicIds = new Set(validTopics.map((t) => t.id));

  // Filter subtopics with valid topic IDs
  const validSubTopics = subTopics.filter((subTopic) =>
    topicIds.has(subTopic.topicId)
  );
  const subTopicIds = new Set(validSubTopics.map((st) => st.id));

  // Filter questions with valid subject, topic, and subtopic IDs
  const validQuestions = questions.filter(
    (question) =>
      subjectIds.has(question.subjectId) &&
      topicIds.has(question.topicId) &&
      subTopicIds.has(question.subtopicId)
  );
  const questionIds = new Set(validQuestions.map((q) => q.id));

  // Filter options with valid question IDs
  const validOptions = options.filter((option) =>
    questionIds.has(option.questionId)
  );

  console.log("\n🔍 Removed items:");
  console.log(`Topics removed: ${topics.length - validTopics.length}`);
  console.log(`SubTopics removed: ${subTopics.length - validSubTopics.length}`);
  console.log(`Questions removed: ${questions.length - validQuestions.length}`);
  console.log(`Options removed: ${options.length - validOptions.length}`);

  // Write cleaned data back to files
  console.log("\n💾 Writing cleaned data...");
  writeJsonFile(path.join(baseDir, "Topic.json"), validTopics);
  writeJsonFile(path.join(baseDir, "SubTopic.json"), validSubTopics);
  writeJsonFile(path.join(baseDir, "Question.json"), validQuestions);
  writeJsonFile(path.join(baseDir, "Option.json"), validOptions);

  console.log("\n✅ Data cleaning completed!");
}

cleanData().catch((e) => {
  console.error("❌ Error during data cleaning:", e);
});
