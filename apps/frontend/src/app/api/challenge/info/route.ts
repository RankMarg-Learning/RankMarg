import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

import { headers } from 'next/headers';

type recentChallenges = {
    challengeId: string;
    opponentUsername: string;
    result : string | null;
    userScore: number[] | null;
    opponentScore: number[] | null;
    createdAt: Date;
};

type UserStats = {
    name: string | null;
    username: string;
    rank: number;
};

type ResponseData = {
    userStats: UserStats;
    recentChallenges: recentChallenges[];
};

export async function GET() {
    const headers = new Headers();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                username: true,
                rank: true,
                player1: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        challengeId: true,
                        player2Id: true,
                        result: true,
                        player1Score: true,
                        attemptByPlayer1: true,
                        attemptByPlayer2: true,
                        createdAt: true,
                        player2: { select: { username: true } }, 
                    },
                },
                player2: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        challengeId: true,
                        player1Id: true,
                        result: true,
                        player2Score: true,
                        attemptByPlayer1: true,
                        attemptByPlayer2: true,
                        createdAt: true,
                        player1: { select: { username: true } }, 
                    },
                },
            },
        });

        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        const recentChallenges: recentChallenges[] = [
            ...user.player1.map((challenge) => ({
                challengeId: challenge.challengeId,
                opponentUsername: challenge.player2?.username || "Unknown", 
                result: challenge.result,
                userScore: challenge.attemptByPlayer1, 
                opponentScore: challenge.attemptByPlayer2,
                createdAt: challenge.createdAt,
            })),
            ...user.player2.map((challenge) => ({
                challengeId: challenge.challengeId,
                opponentUsername: challenge.player1?.username || "Unknown", 
                result: challenge.result,
                userScore: challenge.attemptByPlayer2, 
                opponentScore: challenge.attemptByPlayer1,
                createdAt: challenge.createdAt,
            })),
        ].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, 25); 

        const userStats: UserStats = {
            name: user?.name,
            username: user.username,
            rank: user.rank,
        };

        const responseData: ResponseData = {
            userStats,
            recentChallenges,
        };

        return new Response(JSON.stringify(responseData), { status: 200 });
    } catch (error) {
        console.error("[Challenge-Info-Dynamic] Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
