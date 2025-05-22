import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const count = searchParams.get("sessionCount") || 12;

    try {
        if (!userId) {
            return jsonResponse(null, { success: false, message: "User ID is required", status: 400 });
        }

        // Optimize by selecting only necessary fields and limiting joins
        const sessions = await prisma.practiceSession.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                userId: true,
                subjectId: true,
                questionsSolved: true,
                correctAnswers: true,
                isCompleted: true,
                createdAt: true,
                attempts: {
                    select: {
                        timing: true,
                        status: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: Number(count),
        });

        if (!sessions || sessions.length === 0) {
            return jsonResponse([], { success: true, message: "No practice sessions found", status: 200 });
        }

        // Get all relevant subject IDs in a single array
        const subjectIds = sessions
            .filter(session => session.subjectId)
            .map(session => session.subjectId);

        // Fetch subjects in a single query if there are any subject IDs
        const subjects = subjectIds.length > 0 ?
            await prisma.subject.findMany({
                where: {
                    id: {
                        in: subjectIds as string[]
                    }
                },
                select: {
                    id: true,
                    name: true
                }
            }) : [];

        // Create a fast lookup map for subjects
        const subjectMap = new Map();
        subjects.forEach(subject => {
            subjectMap.set(subject.id, subject.name);
        });

        // Process sessions in parallel for better performance with large datasets
        const formattedSessions = await Promise.all(sessions.map(async session => {
            // Calculate total time efficiently
            const totalTimeSeconds = session.attempts.reduce((total, attempt) =>
                total + (attempt.timing || 0), 0);

            const minutes = Math.floor(totalTimeSeconds / 60);
            const seconds = Math.floor(totalTimeSeconds % 60);

            // Optimize date formatting
            const date = new Date(session.createdAt);
            const formattedDate = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;

            // Calculate metrics
            const accuracy = session.questionsSolved > 0
                ? Math.round((session.correctAnswers / session.questionsSolved) * 100)
                : 0;

            // Generate personalized suggestion based on performance
            let suggestion;
            if (accuracy >= 90) {
                suggestion = "Mastered";
            } else if (accuracy >= 75) {
                suggestion = "Strong";
            } else if (accuracy >= 60) {
                suggestion = "Review";
            } else if (accuracy >= 40) {
                suggestion = "Practice";
            } else {
                suggestion = "Study";
            }

            return {
                id: session.id,
                subject: subjectMap.get(session.subjectId) || "Unknown Subject",
                date: formattedDate,
                score: `${session.correctAnswers}/${session.questionsSolved}`,
                accuracy: accuracy,
                time: `${minutes}m ${seconds}s`,
                suggestion: suggestion,
                userId: session.userId,
            };
        }));

        return jsonResponse(formattedSessions, { success: true, message: "Ok", status: 200 });
    } catch (error) {
        console.error("Error fetching practice sessions:", error);
        return jsonResponse([], { success: false, message: "Internal Server Error", status: 500 });
    }
}