import { RuleBook } from "../types";

export const ruleBook: RuleBook = {
  SESSION_ANALYSIS: {
    category: "SessionAnalysis",
    rules: [
      {
        priority: 20,
        condition: { type: "questions_solved", operator: "lt", value: 10 },
        suggestion:
          "Consider solving at least 10 questions per practice session to maximize your progress.",
        type: "GUIDANCE",
        duration: 1,
      },
      {
        priority: 22,
        condition: {
          type: "correct_answers_ratio",
          operator: "lt",
          value: 0.5,
        },
        suggestion:
          "Your accuracy is below 50%. Review related chapters and practice more questions.",
        type: "WARNING",
        duration: 2,
        metadata: {
          actionName: "Revision",
          actionUrl: "/practice-revision",
        },
      },
      {
        priority: 24,
        condition: { type: "questions_solved", operator: "gte", value: 30 },
        suggestion:
          "Excellent! You solved 30+ questions in this practice. Keep up the momentum!",
        type: "CELEBRATION",
        duration: 2,
        badgeId: "practice-champion",
      },
      {
        priority: 26,
        condition: { type: "isCompleted", operator: "eq", value: false },
        suggestion: "Consider completing your practice to track your progress.",
        type: "REMINDER",
        duration: 1,
        metadata: {
          actionName: "Resume Practice",
          actionUrl: "/practice/{sessionId}",
        },
      },
      {
        priority: 28,
        condition: { type: "duration", operator: "lt", value: 15 },
        suggestion:
          "Consider extending your practice to at least 15 minutes for maximum retention.",
        type: "GUIDANCE",
        duration: 1,
      },
      {
        priority: 30,
        condition: { type: "always" },
        suggestion:
          "Analyze your performance and aim to improve in your subsequent sessions.",
        type: "MOTIVATION",
        duration: 1,
        category: "General",
      },
    ],
  },
  POST_EXAM: {
    category: "Test",
    rules: [
      {
        priority: 10,
        condition: { type: "test_score", operator: "lt", value: 60 },
        suggestion:
          "Your {subject} test score was below 60%. Practice weak topics like {topic} to improve.",
        type: "GUIDANCE",
        duration: 3,
        metadata: {
          actionName: "Try {Subject}",
          actionUrl: "/practice/{subject}/{topic}",
        },
      },
      {
        priority: 12,
        condition: { type: "test_score", operator: "gte", value: 80 },
        suggestion:
          "Great job! Your {subject} test score was above 80%. Earn the 'Test Ace' badge!",
        type: "CELEBRATION",
        duration: 2,
        badgeId: "test-ace",
      },
    ],
  },
  DAILY_ANALYSIS: {
    category: "Mastery",
    rules: [
      {
        priority: 20,
        condition: { type: "accuracy", operator: "lt", value: 50 },
        suggestion:
          "Your {subject} accuracy was below 50% today. Try our {topic} practice set.",
        type: "WARNING",
        duration: 2,
        metadata: {
          actionName: "Try {Subject}",
          actionUrl: "/practice/{subject}/{topic}",
        },
      },
      {
        priority: 22,
        condition: { type: "study_time", operator: "lt", value: 1 },
        suggestion:
          "Studied less than 1 hour today? Aim for 2 hours tomorrow to stay on track.",
        type: "REMINDER",
        duration: 1,
        category: "General",
      },
      {
        priority: 24,
        condition: { type: "questions_solved", operator: "gte", value: 20 },
        suggestion:
          "Wow, you solved 20+ questions today! Keep it up to earn the 'Practice Pro' badge.",
        type: "CELEBRATION",
        duration: 2,
        badgeId: "practice-pro",
      },
      {
        priority: 26,
        condition: { type: "always" },
        suggestion:
          "You're making progress! Stay consistent to crush your JEE/NEET goals.",
        type: "MOTIVATION",
        duration: 1,
        category: "Motivation",
      },
    ],
  },
  STREAK_MILESTONE: {
    category: "Streak",
    rules: [
      {
        priority: 30,
        condition: { type: "streak", operator: "gte", value: 5 },
        suggestion: "5-day streak! You've earned the 'Streak Star' badge!",
        type: "CELEBRATION",
        duration: 2,
        badgeId: "streak-star",
      },
      {
        priority: 32,
        condition: { type: "streak", operator: "eq", value: 0 },
        suggestion:
          "Your streak broke! Solve 5 questions today to start a new one.",
        type: "REMINDER",
        duration: 1,
      },
    ],
  },
  INACTIVITY: {
    category: "Wellness",
    rules: [
      {
        priority: 40,
        condition: { type: "inactivity", operator: "gte", value: 3 },
        suggestion:
          "Haven't studied in 3 days? Start with 10 easy questions to get back on track.",
        type: "REMINDER",
        duration: 2,
      },
      {
        priority: 42,
        condition: { type: "inactivity", operator: "gte", value: 7 },
        suggestion:
          "It's been a week! Try a 5-minute mindfulness exercise and solve a few questions to ease back in.",
        type: "WELLNESS",
        duration: 2,
        metadata: { resourceLink: "/wellness/mindfulness" },
      },
      {
        priority: 44,
        condition: { type: "inactivity", operator: "gte", value: 5 },
        suggestion:
          "Missed a few days? You're still in the game—set a small goal for today!",
        type: "MOTIVATION",
        duration: 2,
        category: "Motivation",
      },
    ],
  },
  EXAM_PROXIMITY: {
    category: "Test",
    rules: [
      {
        priority: 5,
        condition: { type: "exam_proximity", operator: "eq", value: 3 },
        suggestion:
          "Your {subject} exam is in 3 days! Focus on high-weightage topics and take a mock test.",
        type: "REMINDER",
        duration: 1,
      },
      {
        priority: 7,
        condition: { type: "exam_proximity", operator: "eq", value: 1 },
        suggestion:
          "Exam tomorrow! Review key {subject} notes and stay calm. You've got this!",
        type: "ENCOURAGEMENT",
        duration: 1,
        category: "Motivation",
      },
    ],
  },
};
