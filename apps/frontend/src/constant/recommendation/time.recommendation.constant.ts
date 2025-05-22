import { Stream } from "@prisma/client";

type DifficultyTiming = {
    easy: number;
    medium: number;
    hard: number;
    veryHard: number;
};

export function getStreamTimingSuggestion(
    examType: Stream,
    avgTimingByDifficulty?: Partial<DifficultyTiming>
): string {
    const benchmark: Record<Stream, DifficultyTiming> = {
        NEET: { easy: 45, medium: 60, hard: 75, veryHard: 90 },
        JEE: { easy: 60, medium: 90, hard: 120, veryHard: 150 },
    };

    if (
        !avgTimingByDifficulty ||
        typeof avgTimingByDifficulty !== "object" ||
        Object.keys(benchmark[examType]).some(k => avgTimingByDifficulty?.[k as keyof DifficultyTiming] === undefined)
    ) {
        return "⚠️ Incomplete data. Please solve questions across all difficulty levels to receive personalized feedback.";
    }

    const slowAreas: string[] = [];
    const fastAreas: string[] = [];

    for (const level of ["easy", "medium", "hard", "veryHard"] as const) {
        const userTime = avgTimingByDifficulty[level] ?? 0;
        const standard = benchmark[examType][level];

        if (userTime > standard + 15) slowAreas.push(level);
        else if (userTime < standard - 15) fastAreas.push(level);
    }

    if (slowAreas.length === 4) {
        return examType === Stream.NEET
            ? "You're taking too long across all question types. NEET rewards speed — practice daily sprints to hit 60s/question."
            : "Time is slipping! JEE is a race of logic and time — aim to solve within 2 mins/question to climb ranks.";
    }

    if (slowAreas.length > 0) {
        return examType === Stream.NEET
            ? `You're overthinking ${slowAreas.join(", ")} questions. Use NCERT flash recall and timed drills to boost speed.`
            : `You're lagging on ${slowAreas.join(", ")} problems. Break them down and practice timed sessions to train your brain for speed.`;
    }

    if (fastAreas.length > 0) {
        return examType === Stream.NEET
            ? "Your speed is impressive! Now focus on boosting accuracy — precision wins NEET."
            : "You’re solving fast — great! Stay accurate and simulate exam pressure to rank higher in JEE.";
    }

    return examType === Stream.NEET
        ? "Your timing matches NEET's rhythm. Maintain consistency and focus now on accuracy and revision."
        : "Well-balanced timing across questions! Now improve accuracy to turn this into a top JEE score.";
}
