const fs = require("fs");

console.log("Loading data...");
const options = JSON.parse(
  fs.readFileSync("scripts/json/7-9-25/Option.json", "utf-8")
);
const questions = JSON.parse(
  fs.readFileSync("scripts/json/7-9-25/Question.json", "utf-8")
);

console.log(`Options: ${options.length}, Questions: ${questions.length}`);

const questionIds = new Set(questions.map((q) => q.id));
const missing = new Set();

for (const opt of options) {
  if (!questionIds.has(opt.questionId)) {
    missing.add(opt.questionId);
  }
}

console.log(`Missing questionIds in options: ${missing.size}`);
if (missing.size < 10) {
  console.log([...missing]);
} else {
  console.log("First 10 missing:", [...missing].slice(0, 10));
}
