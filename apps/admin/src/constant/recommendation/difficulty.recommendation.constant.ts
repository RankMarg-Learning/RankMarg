type DifficultyStats = {
    easy: number;
    medium: number;
    hard: number;
    veryHard: number;
};

export function getDifficultySuggestion(questionsByDifficulty: DifficultyStats): string {
    const { easy, medium, hard, veryHard } = questionsByDifficulty;
    const total = easy + medium + hard + veryHard;

    if (total === 0) {
        return "You haven’t attempted any questions yet. Start with easy or medium-level questions to build momentum.";
    }

    if (medium > 0 && easy === 0 && hard === 0 && veryHard === 0) {
        return "Good progress! Start pushing towards hard questions to build confidence for real exam difficulty.";
    }

    if (easy > 0 && medium === 0 && hard === 0 && veryHard === 0) {
        return "Great start! Now gradually attempt medium-level questions to strengthen your concepts further.";
    }

    if ((hard > 0 || veryHard > 0) && easy === 0 && medium === 0) {
        return "You’re focusing on tougher problems. Make sure your fundamentals are strong by revisiting easier ones.";
    }

    if (easy > 0 && medium > 0 && hard === 0 && veryHard === 0) {
        return "You’ve mastered the basics. It’s time to challenge yourself with harder questions to level up.";
    }

    if (easy > 3 && medium < 2 && hard === 0) {
        return "You’re practicing well, but don’t get too comfortable with easy ones. Add more medium/hard questions.";
    }

    if (medium >= 4 && hard > 0 && veryHard === 0) {
        return "You’re progressing steadily. Include 1–2 very hard questions in your daily practice for deeper learning.";
    }

    if (easy > 0 && medium > 0 && hard > 0 && veryHard > 0) {
        return "Great consistency! Maintain the balance but focus more on difficult topics to optimize rank potential.";
    }

    return "Keep practicing regularly and try to maintain a healthy balance across difficulty levels to improve faster.";
}
