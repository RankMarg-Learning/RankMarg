export function getDifficultyLabel(difficulty?: string | null): string {
  if (!difficulty) return 'Unknown';
  const map: Record<string, string> = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
  };
  return map[difficulty] || difficulty;
}


