export type RecentTestScoresProps = {
  date: string;
  score: number;
  timing: number;
  accuracy: number;
};

export function generateWeeklyTestSuggestion(
  testScores: RecentTestScoresProps[]
): string {
  if (testScores.length === 0) {
    return "No tests taken this week. Try to stay consistent by taking at least one test weekly.";
  }

  const total = testScores.length;
  const avgAccuracy =
    testScores.reduce((sum, test) => sum + test.accuracy, 0) / total;
  const avgScore =
    testScores.reduce((sum, test) => sum + test.score, 0) / total;
  const avgTiming =
    testScores.reduce((sum, test) => sum + test.timing, 0) / total;

  const accuracyTrend =
    total > 1 &&
    testScores[testScores.length - 1].accuracy > testScores[0].accuracy + 5;

  const timingTrend =
    total > 1 &&
    testScores[testScores.length - 1].timing < testScores[0].timing - 5;

  if (avgAccuracy < 70) {
    return "Your accuracy needs improvement. Focus on revising your mistakes and understanding core concepts.";
  }

  if (avgTiming > 30 && avgScore < 25) {
    return "You're spending a lot of time with limited outcome. Practice solving questions with smart techniques under time limits.";
  }

  if (accuracyTrend && !timingTrend) {
    return "Your accuracy is improving, which is a great sign. Now work on improving your solving speed without losing precision.";
  }

  if (avgAccuracy > 85 && avgScore > 35) {
    return "Great job this week! You're showing strong performance. Start practicing advanced-level questions to boost your edge.";
  }

  return "You're progressing steadily. Keep practicing regularly and balance your speed with accuracy.";
}
