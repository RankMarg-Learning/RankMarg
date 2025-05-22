import { NextResponse } from 'next/server';
import { getAuthSession } from '@/utils/session';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getAuthSession()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get all test participations for the user, ordered by date
        const testParticipations = await prisma.testParticipation.findMany({
            where: {
                userId: user.id,
                status: 'COMPLETED',
            },
            include: {
                test: true,
            },
            orderBy: {
                endTime: 'asc',
            },
        });

        const monthlyPerformances = testParticipations.reduce((acc, participation) => {
            const month = new Date(participation.endTime).toLocaleString('default', { month: 'short' });

            if (!acc[month]) {
                acc[month] = [];
            }

            acc[month].push(participation.score || 0);
            return acc;
        }, {} as Record<string, number[]>);

        const performanceData = Object.entries(monthlyPerformances).map(([month, scores]) => {
            const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            return {
                month,
                score: Math.round(avgScore),
            };
        });

        const allScores = testParticipations.map(p => p.score || 0);
        const highestScore = Math.max(...allScores, 0);
        const lowestScore = Math.min(...allScores.filter(s => s > 0), highestScore);

        return NextResponse.json({
            performanceData,
            highestScore,
            lowestScore,
            recentRecommendation: "Unit Circle Interactive Practice",
            recommendationReason: "High effectiveness time slot",
        });
    } catch (error) {
        console.error('Test Performance API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}