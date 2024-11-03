import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
    try {
        // Fetch session and validate
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;

        // Fetch user and related challenges
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
                rank: true,
                player1: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        challengeId: true,
                        player2Id: true,
                        result: true,
                        player1Score: true,
                        createdAt: true,
                        player2: { select: { username: true } }, // Opponent (player2) username for player1 challenges
                    },
                },
                player2: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        challengeId: true,
                        player1Id: true,
                        result: true,
                        player2Score: true,
                        createdAt: true,
                        player1: { select: { username: true } }, // Opponent (player1) username for player2 challenges
                    },
                },
            },
        });

        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        // Combine and map player1 and player2 challenges
        const recentChallenges = [
            ...user.player1.map((challenge) => ({
                challengeId: challenge.challengeId,
                opponentUsername: challenge.player2?.username || "Unknown", // Get opponent's username for player1 challenges
                result: challenge.result,
                userScore: challenge.player1Score, // User's score when they are player1
                createdAt: challenge.createdAt,
            })),
            ...user.player2.map((challenge) => ({
                challengeId: challenge.challengeId,
                opponentUsername: challenge.player1?.username || "Unknown", // Get opponent's username for player2 challenges
                result: challenge.result,
                userScore: challenge.player2Score, // User's score when they are player2
                createdAt: challenge.createdAt,
            })),
        ].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0,25); // Sort by creation date

        return new Response(JSON.stringify({ user, recentChallenges }), { status: 200 });
    } catch (error) {
        console.error("[Challenge-Info-Dynamic] Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
