import mongoose from "mongoose";

const SubtopicSchema = new mongoose.Schema({
  name: String,
  incorrect_count: Number,
  avg_timing: Number,
  avg_hints_used: Number,
  study_materials: [String],
  tips: [String],
});

const AIAgentResponseSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    subtopics: [SubtopicSchema],
    overall_strategies: [String],
    metadata: {
      model: { type: String, default: "gpt-4o" },
      promptTokens: Number,
      completionTokens: Number,
      latencyMs: Number,
      generatedAt: { type: Date, default: Date.now },
      version: { type: String, default: "v1" },
    },
  },
  {
    timestamps: true,
  }
);

export const AgentResponse =
  mongoose.models.AIAgentResponse ||
  mongoose.model("AIAgentResponse", AIAgentResponseSchema);
