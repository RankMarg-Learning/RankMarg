import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { UserProfileResponse, UserBasicProfile, UserAdditionalInfo, UserChallengeStats, SubjectStatsMap } from "@/types";

export async function GET(req: Request, { params }: { params: { username: string } }): Promise<Response> {
  const { username } = params;
  const session = await getServerSession(authOptions);

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        rank: true,
        name: true,
        username: true,
        avatar: true,
        coins: true,
        createdAt: true,
        id: true,
        attempts: {
          select: {
            isCorrect: true,
            solvedAt: true,
            questionId: true,
            question: { select: { subject: true } },
          },
          orderBy: { solvedAt: "desc" },
        },
        player1: {
          select: {
            challengeId: true,
            player1Score: true,
            createdAt: true,
            attemptByPlayer1: true,
          },
        },
        player2: {
          select: {
            challengeId: true,
            player2Score: true,
            createdAt: true,
            attemptByPlayer2: true,
          },
        },
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const totalQuestions = await prisma.question.count();

    const correctQuestionIds = new Set();

    user.attempts.forEach((attempt) => {
      if (attempt.isCorrect) {
        correctQuestionIds.add(attempt.questionId);
      }
    });

    const totalAttempt = correctQuestionIds.size;

    // const totalAttempt = user.attempts.filter((attempt) => attempt.isCorrect).length;
    const accuracy = totalAttempt / (user.attempts.length || 1);

    const totalChallenge = user.player1.length + user.player2.length;

    const subjectTotalQuestionMap = (await prisma.question.groupBy({
      by: ["subject"],
      _count: { id: true },
    })).reduce((acc, { subject, _count }) => {
      acc[subject] = _count.id;
      return acc;
    }, {} as Record<string, number>);

    const subjectCounts = user.attempts
  .filter((attempt) => attempt.isCorrect)
  .reduce((acc, attempt) => {
    const subject = attempt.question.subject;  // Subject is a string
    const questionId = attempt.questionId;  // Ensure questionId is a string

    // Initialize a Set for each subject if not already initialized
    if (!acc[subject]) {
      acc[subject] = new Set<string>();  // Initialize as a Set of strings
    }

    acc[subject].add(questionId);  // Add the questionId (string) to the Set for the subject
    return acc;
  }, {} as Record<string, Set<string>>);

    const subjects: SubjectStatsMap = ["Physics", "Chemistry", "Mathematics"].reduce((acc, subject) => {
      acc[subject] = {
        AttemptCount: subjectCounts[subject] ? subjectCounts[subject].size : 0,
        TotalQuestion: subjectTotalQuestionMap[subject] || 0,
      };
      return acc;
    }, {} as SubjectStatsMap);

    const recentChallenges = [
      ...user.player1.map((challenge) => ({
        challengeId: challenge.challengeId,
        userScore: challenge.player1Score,
        createdAt: challenge.createdAt,
        attemptScore: challenge.attemptByPlayer1,
      })),
      ...user.player2.map((challenge) => ({
        challengeId: challenge.challengeId,
        userScore: challenge.player2Score,
        createdAt: challenge.createdAt,
        attemptScore: challenge.attemptByPlayer2,
      })),
    ]
      .sort((a, b) => (a.createdAt.getTime() || 0) - (b.createdAt.getTime() || 0))
      .slice(0, 25);

    const basicProfile: UserBasicProfile = {
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      coins: user.coins,
      createdAt: user.createdAt,
      isSelf: user.id === session?.user?.id,
    };

    const additionalInfo: UserAdditionalInfo = {
      totalAttempt,
      totalQuestions,
      totalChallenge,
      accuracy,
    };

    const challengeStats: UserChallengeStats = {
      rank: user.rank,
      recentChallenges,
    };

    const solvedAtValues = user.attempts.map((attempt) => attempt.solvedAt);

    const responseBody: UserProfileResponse = {
      basicProfile,
      additionalInfo,
      subjects,
      challengeStats,
      solvedAtValues,
      attempts: user.attempts,
    };

    return new Response(JSON.stringify(responseBody), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("[User-Dynamic] :", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
