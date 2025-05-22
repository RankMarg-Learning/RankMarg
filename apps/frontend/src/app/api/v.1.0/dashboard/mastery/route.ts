import { jsonResponse } from "@/utils/api-response";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/utils/session";

function estimateTopPercentile(studentScore: number): number {
    if (studentScore >= 95) return 1;
    if (studentScore >= 90) return 5;
    if (studentScore >= 80) return 10;
    if (studentScore >= 70) return 25;
    if (studentScore >= 60) return 50;
    if (studentScore >= 40) return 75;
    return 90; 
}
export async function GET(request: Request) {
    const url = new URL(request.url);
    let userId = url.searchParams.get('userId');
    try {
        const session = await getAuthSession();

        userId = session?.user.id || userId;

        if (!userId && !session) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 });
        }
        if (!userId) {
            return jsonResponse(null, { success: false, message: "User ID is required", status: 400 });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subjectMastery: {
                    include: { subject: true }
                },
                userPerformance: true,
            }
        });
        const subjectMasteries = user.subjectMastery;
        let overallMastery = 0;

        if (subjectMasteries.length > 0) {
            const totalMasteryLevel = subjectMasteries.reduce((sum, subject) => sum + subject.masteryLevel, 0);
            overallMastery = Math.round((totalMasteryLevel / (subjectMasteries.length))); 
        }
        let masteryLabel = "Needs Improvement";
        if (overallMastery >= 80) masteryLabel = "Excellent";
        else if (overallMastery >= 70) masteryLabel = "Good";
        else if (overallMastery >= 60) masteryLabel = "Satisfactory";

        const topicMasteries = await prisma.topicMastery.findMany({
            where: { userId: user.id, masteryLevel: { gte: 80 } },
            include: { topic: true }
        });
        const totalTopics = await prisma.topic.count({
            where: {
                subject: {
                    stream: user.stream
                }
            }
        });
        const streak = await prisma.userPerformance.findUnique({
            where: { userId: user.id },
            select: { streak: true }
        })

        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);

        const lastMonthMastery = await prisma.masteryHistory.findFirst({
            where: {
                userId: user.id,
                recordedAt: {
                    lt: previousMonth
                }
            },
            select: { masteryLevel: true },
            orderBy: {
                recordedAt: 'desc'
            }
        });

        let improvementPercentage = 0;
        if (lastMonthMastery) {

            improvementPercentage = Math.round(overallMastery - lastMonthMastery.masteryLevel);
        }



        return jsonResponse({
            overallMastery: {
                percentage: overallMastery,
                label: masteryLabel,
                improvement: improvementPercentage,
                topPercentage: estimateTopPercentile(overallMastery)
            },
            conceptsMastered: {
                mastered: topicMasteries.length,
                total: totalTopics,
            },
            studyStreak: {
                days: streak.streak,
                message: streak.streak >= 7 ? "Keep it up! 🔥" : "Keep learning daily!"
            }
        }, { success: true, message: "Ok", status: 200 })


    } catch (error) {
        console.log("[Update Mastery] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });

    }
}