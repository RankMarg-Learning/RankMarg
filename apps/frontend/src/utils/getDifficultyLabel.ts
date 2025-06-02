export const getDifficultyLabel = (difficulty: number): string => {
    const difficultyMap: Record<number, string> = {
      1: "Easy",
      2: "Medium",
      3: "Hard",
      4: "Very Hard"
    };
  
    return difficultyMap[difficulty] || "Unknown";
  };