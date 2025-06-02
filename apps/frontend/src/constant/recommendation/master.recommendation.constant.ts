
import { Recommendation } from "@/types/recommendation.types";

export function generatePhysicsRecommendationByMastery(topic: string, masteryLevel: number): Recommendation {
  const trimmedTopic = topic.trim();
  if (masteryLevel < 50) {
    return {
      icon: "warning",
      color: "red",
      type: "physics",
      message: `Your understanding of **${trimmedTopic}** is below average. Focus on building core concepts and daily practice.`,
    };
  } else if (masteryLevel < 75) {
    return {
      icon: "info",
      color: "blue",
      type: "physics",
      message: `You have average grasp on **${trimmedTopic}**. Revisit key concepts and increase practice frequency.`,
    };
  } else {
    return {
      icon: "check",
      color: "green",
      type: "physics",
      message: `Great mastery of **${trimmedTopic}**. Work on refining weaker subtopics and solving advanced problems.`,
    };
  }
}

export function generateChemistryRecommendationByMastery(topic: string, masteryLevel: number): Recommendation {
  const trimmedTopic = topic.trim();
  if (masteryLevel < 50) {
    return {
      icon: "warning",
      color: "red",
      type: "chemistry",
      message: `Your understanding of **${trimmedTopic}** is weak. Focus on memorizing key reactions and formulas.`,
    };
  } else if (masteryLevel < 75) {
    return {
      icon: "info",
      color: "teal",
      type: "chemistry",
      message: `Your grasp of **${trimmedTopic}** is average. Revise mechanisms and practice related MCQs regularly.`,
    };
  } else {
    return {
      icon: "check",
      color: "purple",
      type: "chemistry",
      message: `Excellent mastery in **${trimmedTopic}**. Keep practicing to maintain your strong conceptual knowledge.`,
    };
  }
}

export function generateMathematicsRecommendationByMastery(topic: string, masteryLevel: number): Recommendation {
  const trimmedTopic = topic.trim();
  if (masteryLevel < 50) {
    return {
      icon: "warning",
      color: "red",
      type: "mathematics",
      message: `Your fundamentals in **${trimmedTopic}** need work. Focus on concept clarity and solving basic problems step-by-step.`,
    };
  } else if (masteryLevel < 75) {
    return {
      icon: "info",
      color: "indigo",
      type: "mathematics",
      message: `You have a decent grip on **${trimmedTopic}**. Practice more problems and work on time management.`,
    };
  } else {
    return {
      icon: "check",
      color: "green",
      type: "mathematics",
      message: `Strong understanding of **${trimmedTopic}**. Challenge yourself with higher-level questions and improve speed.`,
    };
  }
}

export function generateBiologyRecommendationByMastery(topic: string, masteryLevel: number): Recommendation {
  const trimmedTopic = topic.trim();
  if (masteryLevel < 50) {
    return {
      icon: "warning",
      color: "red",
      type: "biology",
      message: `You are struggling with **${trimmedTopic}**. Focus on understanding terminology, diagrams, and key processes.`,
    };
  } else if (masteryLevel < 75) {
    return {
      icon: "info",
      color: "lime",
      type: "biology",
      message: `Your grasp of **${trimmedTopic}** is moderate. Revise NCERT thoroughly and practice application-based questions.`,
    };
  } else {
    return {
      icon: "check",
      color: "green",
      type: "biology",
      message: `Excellent command over **${trimmedTopic}**. Keep revising and try teaching others to reinforce concepts.`,
    };
  }
}


