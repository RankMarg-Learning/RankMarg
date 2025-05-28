import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

const getDateRanges = () => {
  const now = new Date();
  const currentWeekStart = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  const previousWeekStart = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
  const previousWeekEnd = currentWeekStart;

  return {
    currentWeekStart,
    currentWeekEnd: now,
    previousWeekStart,
    previousWeekEnd
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');
  try {
    const dateRanges = getDateRanges();

    const currentWeekAttempts = await prisma.attempt.findMany({
      where: {
        userId,
        status: 'INCORRECT',
        mistake: { not: 'NONE' },
        solvedAt: {
          gte: dateRanges.currentWeekStart,
          lte: dateRanges.currentWeekEnd
        }
      },
      include: {
        question: {
          include: {
            topic: true,
            subject: true,
            subTopic: true
          }
        }
      }
    });

    const previousWeekAttempts = await prisma.attempt.findMany({
      where: {
        userId,
        status: 'INCORRECT',
        mistake: { not: 'NONE' },
        solvedAt: {
          gte: dateRanges.previousWeekStart,
          lte: dateRanges.previousWeekEnd
        }
      },
      include: {
        question: {
          include: {
            topic: true,
            subject: true,
            subTopic: true
          }
        }
      }
    });
    const currentCount = currentWeekAttempts.length;
    const previousCount = previousWeekAttempts.length;
    const change = currentCount - previousCount;
    const mistakeAnalytics = {
      cnt: {
        current: currentCount,
        previous: previousCount,
        change,
        reducePct: previousCount > 0
          ? parseFloat(((previousCount - currentCount) / previousCount * 100).toFixed(2))
          : currentCount === 0 ? 100.0 : 0.0
      },
      mostMistakeType: getMostMistakeType(currentWeekAttempts),
      trend: getMistakeTrend(currentWeekAttempts, previousWeekAttempts),
      mistakesBySubject: getMistakesBySubject(currentWeekAttempts, previousWeekAttempts),
    };
    return jsonResponse(mistakeAnalytics, {
      status: 200,
      message: "Mistake trends fetched successfully",
      success: true
    })
  } catch (error) {
    console.error("[Mistake Tracker] Error in fetching mistake tracker data", error);
    return jsonResponse(null, {
      status: 500,
      message: "Internal server error",
      success: false
    })
  }
}



function getMostMistakeType(currentAttempts) {
  const currentMistakeTypes = {};

  currentAttempts.forEach(attempt => {
    const mistakeType = attempt.mistake || 'NONE';
    currentMistakeTypes[mistakeType] = (currentMistakeTypes[mistakeType] || 0) + 1;
  });

  const currentMostCommon = Object.entries(currentMistakeTypes)
    .sort(([, a], [, b]) => Number(b) - Number(a))[0];

  return {
    type: currentMostCommon ? currentMostCommon[0] : 'NONE',
    count: currentMostCommon ? currentMostCommon[1] : 0
  };
}



function getMistakesBySubject(currentAttempts, previousAttempts) {
  const currentSubjectMistakes = {};
  const previousSubjectMistakes = {};

  currentAttempts.forEach(attempt => {
    const subjectName = attempt.question?.subject?.name || 'Unknown';
    currentSubjectMistakes[subjectName] = (currentSubjectMistakes[subjectName] || 0) + 1;
  });

  previousAttempts.forEach(attempt => {
    const subjectName = attempt.question?.subject?.name || 'Unknown';
    previousSubjectMistakes[subjectName] = (previousSubjectMistakes[subjectName] || 0) + 1;
  });

  const allSubjects = new Set([
    ...Object.keys(currentSubjectMistakes),
    ...Object.keys(previousSubjectMistakes)
  ]);

  const subjectAnalysis = Array.from(allSubjects).map(subject => ({
    subject,
    current: currentSubjectMistakes[subject] || 0,
    previous: previousSubjectMistakes[subject] || 0,
    change: (currentSubjectMistakes[subject] || 0) - (previousSubjectMistakes[subject] || 0)
  })).sort((a, b) => b.current - a.current);

  return subjectAnalysis;
}

function getMistakeTrend(currentAttempts, previousAttempts) {
  const trend = {
    improving: currentAttempts.length < previousAttempts.length,
    status: '',
    recommendation: ''
  };

  if (currentAttempts.length < previousAttempts.length) {
    trend.status = 'IMPROVING';
    trend.recommendation = 'Great progress! Keep up the good work.';
  } else if (currentAttempts.length > previousAttempts.length) {
    trend.status = 'NEEDS_ATTENTION';
    trend.recommendation = 'Mistakes have increased. Focus on weak topics and review concepts.';
  } else {
    trend.status = 'STABLE';
    trend.recommendation = 'Mistakes are consistent. Work on identifying patterns to improve.';
  }

  return trend;
}
