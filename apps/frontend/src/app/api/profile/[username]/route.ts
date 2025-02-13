import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { UserProfileResponse, UserBasicProfile, UserAdditionalInfo,  SubjectStatsMap } from "@/types"; 

export async function GET(req: Request, { params }: { params: { username: string } }): Promise<Response> {
  const { username } = params;
  const session = await getServerSession(authOptions);

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        stream: true,
        rank: true,
        name: true,
        username: true,
        avatar: true,
        coins: true,
        createdAt: true,
        id: true,
        TestParticipated: {
          where: { status: "COMPLETED" },
          orderBy:{
            joinedAt:"desc"
          },
          select: {
            testId: true,
            score: true,
            joinedAt: true,
            test: {
              select: {
                title: true,
                totalMarks: true,
              },
            },
          }

        },
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

    const totalQuestions = await prisma.question.count({
      where: { stream: user.stream },
    });

    const correctQuestionIds = new Set();

    user.attempts.forEach((attempt) => {
      if (attempt.isCorrect) {
        correctQuestionIds.add(attempt.questionId);
      }
    });

    const totalAttempt = correctQuestionIds.size;

    const accuracy = totalAttempt / (user.attempts.length || 1);

    const totalChallenge = user.player1.length + user.player2.length;
    const subjectTotalQuestionMap = (await prisma.question.groupBy({
      by: ["subject"],
      _count: { id: true },
      where: { stream: user.stream },
    })).reduce((acc, { subject, _count }) => {
      acc[subject] = _count.id;
      return acc;
    }, {} as Record<string, number>);

    const subjectCounts = user.attempts
      .filter((attempt) => attempt.isCorrect)
      .reduce((acc, attempt) => {
        const subject = attempt.question.subject;
        const questionId = attempt.questionId;


        if (!acc[subject]) {
          acc[subject] = new Set<string>();
        }

        acc[subject].add(questionId);
        return acc;
      }, {} as Record<string, Set<string>>);

    const availableSubjects =
      user.stream === "JEE"
        ? ["Physics", "Chemistry", "Mathematics"]
        : ["Physics", "Chemistry", "Biology"];

    const subjects: SubjectStatsMap = availableSubjects.reduce((acc, subject) => {
      acc[subject] = {
        AttemptCount: subjectCounts[subject] ? subjectCounts[subject].size : 0,
        TotalQuestion: subjectTotalQuestionMap[subject] || 0,
      };
      return acc;
    }, {} as SubjectStatsMap);

    // const recentChallenges = [
    //   ...user.player1.map((challenge) => ({
    //     challengeId: challenge.challengeId,
    //     userScore: challenge.player1Score,
    //     createdAt: challenge.createdAt,
    //     attemptScore: challenge.attemptByPlayer1,
    //   })),
    //   ...user.player2.map((challenge) => ({
    //     challengeId: challenge.challengeId,
    //     userScore: challenge.player2Score,
    //     createdAt: challenge.createdAt,
    //     attemptScore: challenge.attemptByPlayer2,
    //   })),
    // ]
    //   .sort((a, b) => (a.createdAt.getTime() || 0) - (b.createdAt.getTime() || 0))
    //   .slice(0, 25);


    const recentTest = user.TestParticipated.slice(0, 10);

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
      totalTest: user.TestParticipated.length,
      totalQuestions,
      totalChallenge,
      accuracy,
    };

    // const challengeStats: UserChallengeStats = {
    //   rank: user.rank,
    //   recentChallenges,
    // };

    const solvedAtValues = user.attempts.map((attempt) => attempt.solvedAt);

    const responseBody: UserProfileResponse = {
      basicProfile,
      additionalInfo,
      subjects,
      // challengeStats,
      solvedAtValues,
      // attempts: user.attempts,
      recentTest,
    };

    return new Response(JSON.stringify(responseBody), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("[User-Dynamic] :", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
