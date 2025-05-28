import prisma from '@/lib/prisma';
import { jsonResponse } from '@/utils/api-response';
import { Prisma } from '@prisma/client';


export async function GET(req:Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    const range = parseInt(searchParams.get('range') || '14');
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - range);

    const whereClause: Prisma.AttemptWhereInput = {
      userId,
      solvedAt: {
        gte: fourteenDaysAgo
      },
      mistake: {
        not: 'NONE'
      }
    };

    const mistakeData = await prisma.attempt.groupBy({
      by: ['mistake'],
      where: whereClause,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    const totalAttempts = await prisma.attempt.count({
      where: whereClause
    });

    const distribution = mistakeData.map(item => ({
      type: item.mistake,
      percentage: totalAttempts > 0 ? parseFloat(((item._count.id / totalAttempts) * 100).toFixed(2)) : 0
    }));

    const allMistakeTypes = ['CONCEPTUAL', 'CALCULATION', 'READING', 'OVERCONFIDENCE', 'OTHER'];
    const completeDistribution = allMistakeTypes.map(mistakeType => {
      const found = distribution.find(item => item.type === mistakeType);
      return {
        type: mistakeType,
        percentage: found ? found.percentage : 0
      };
    });
    const conclusionMessage = generateMistakeConclusion(completeDistribution);

    return jsonResponse({ distribution: completeDistribution, suggest:conclusionMessage }, {
      status: 200,
      message: 'Ok',
      success: true
    })

  } catch (error) {
    console.error('Error in mistake distribution API:', error);

    return jsonResponse(null, {
      status: 500,
      message: 'Internal server error',
      success: false
    })
  }
}


function generateMistakeConclusion(distribution: { type: string, percentage: number }[]) {
  const topMistake = distribution.reduce((prev, curr) => 
    curr.percentage > prev.percentage ? curr : prev, 
    { type: 'NONE', percentage: 0 }
  );

  if (topMistake.percentage === 0) {
    return " Great job! You haven't made any significant mistakes recently. Keep up the consistency!";
  }

  const suggestions: Record<string, string> = {
    CONCEPTUAL: "Focus more on strengthening your core concepts. Revisit the theory and understand the *why* behind each topic.",
    CALCULATION: "Looks like calculation mistakes are frequent. Double-check your math and try not to rush through problems.",
    READING: "Pay closer attention to the question. Misreading could be costing you. Practice active reading strategies.",
    OVERCONFIDENCE: " Be mindful of overconfidence. It's okay to double-check even the seemingly easy questions.",
    OTHER: " You're making miscellaneous mistakes. Try reviewing your attempted questions to spot any patterns or habits."
  };

  return `${suggestions[topMistake.type] || "💡 Analyze your recent mistakes for improvement."} (${topMistake.percentage}% of your mistakes fall under this category.)`;
}

