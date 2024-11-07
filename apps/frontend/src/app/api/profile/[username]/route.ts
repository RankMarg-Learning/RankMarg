import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import axios from "axios";

export async function GET(req: Request, { params }: { params: { username: string } }) {
  const { username } = params;

  const session = await getServerSession(authOptions);

  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        attempts: {
          orderBy: {
            solvedAt: "desc",
          },
        },
        player1: {
          orderBy: { createdAt: 'asc' },
          select: {
              challengeId: true,
              player1Score: true,
              createdAt: true,
              attemptByPlayer1: true,
          },
      },
      player2: {
          orderBy: { createdAt: 'asc' },
          select: {
              challengeId: true,
              player2Score: true,
              createdAt: true,
              attemptByPlayer2: true,
          },
      },
      },
    });

    const totalQuestions = await prisma.question.count();

    const totalAttempt = user?.attempts.filter((attempt) => attempt.isCorrect).length;

    const totalChallenge = user?.player1.length + user?.player2.length;

    const accuracy = totalAttempt / (user?.attempts.length || 1); // Avoid division by zero

    const subjectTotalQuestion = await prisma.question.groupBy({
      by: ["subject"],
      _count: {
        id: true, // Counting questions by their ID
      },
    });

    const subjectCounts = await prisma.attempt.findMany({
      where: {
        userId: user?.id, // Filter attempts by user
        isCorrect: true, // Filter correct attempts
      },
      select: {
        question: {
          select: {
            subject: true,
          },
        },
      },
      distinct: ["questionId"],
    });

    type GroupedCountsType = {
      Physics?: number;
      Chemistry?: number;
      Mathematics?: number;
    };

    const groupedCounts: GroupedCountsType = subjectCounts.reduce((acc, attempt) => {
      const subject = attempt.question.subject;
      acc[subject as keyof GroupedCountsType] = (acc[subject as keyof GroupedCountsType] || 0) + 1;
      return acc;
    }, {} as GroupedCountsType);

    const basicProfile = {
      name: user?.name,
      username: user?.username,
      avatar: user?.avatar,
      coins: user?.coins,
      createdAt: user?.createdAt,
      isSelf: user?.id === session?.user?.id,
    };

    const additionInfo = {
      totalAttempt,
      totalQuestions,
      totalChallenge,
      accuracy,
    };

    const subjects = {
      Physics: { AttemptCount: 0, TotalQuestion: 0 },
      Chemistry: { AttemptCount: 0, TotalQuestion: 0 },
      Mathematics: { AttemptCount: 0, TotalQuestion: 0 },
    };

    if (groupedCounts) {
      if (groupedCounts.Physics) subjects.Physics.AttemptCount = groupedCounts.Physics;
      if (groupedCounts.Chemistry) subjects.Chemistry.AttemptCount = groupedCounts.Chemistry;
      if (groupedCounts.Mathematics) subjects.Mathematics.AttemptCount = groupedCounts.Mathematics;
    }

    // Update TotalQuestion for each subject using subjectTotalQuestion
    if (subjectTotalQuestion) {
      subjectTotalQuestion.forEach((item) => {
        const subjectName = item.subject;
        const totalQuestions = item._count.id;

        // Match subjects, updating only if they exist in our initialized `subjects` object
        if (subjectName === "Physics" && subjects.Physics) {
          subjects.Physics.TotalQuestion = totalQuestions;
        } else if (subjectName === "Chemistry" && subjects.Chemistry) {
          subjects.Chemistry.TotalQuestion = totalQuestions;
        } else if (subjectName === "Mathematics" && subjects.Mathematics) {
          subjects.Mathematics.TotalQuestion = totalQuestions;
        }
      });
    }

    const recentChallenges = [
      ...user.player1.map((challenge) => ({
        challengeId: challenge.challengeId,
        userScore: challenge.player1Score, // User's score when they are player1
        createdAt: challenge.createdAt,
        attemptScore: challenge.attemptByPlayer1,
      })),
      ...user.player2.map((challenge) => ({
        challengeId: challenge.challengeId,
        userScore: challenge.player2Score, // User's score when they are player2
        createdAt: challenge.createdAt,
        attemptScore: challenge.attemptByPlayer2,
      })),
    ]
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)) // Sorting by oldest to newest
      .slice(0, 25); // Sort by creation date
    

    const challengeStats = {
      rank: user?.rank,
      recentChallenges
    };

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    return new Response(
      JSON.stringify({
        basicProfile,
        additionInfo,
        subjects,
        challengeStats,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log("[User-Dynamic] :", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
