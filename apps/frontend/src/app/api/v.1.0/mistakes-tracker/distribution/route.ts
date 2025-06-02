export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { jsonResponse } from '@/utils/api-response';
import { getAuthSession } from '@/utils/session';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    // Validate request URL
    let searchParams: URLSearchParams;
    try {
      const url = new URL(req.url);
      searchParams = url.searchParams;
    } catch (urlError) {
      console.error('Invalid URL:', urlError);
      return jsonResponse(null, {
        status: 400,
        message: 'Invalid request URL',
        success: false
      });
    }

    let userId = searchParams.get('id');

    const session = await getAuthSession();
    if (session?.user?.id) {
      userId = session.user.id;
    }
    if (!userId || userId.trim() === '') {
      return jsonResponse(null, {
        status: 400,
        message: 'User ID is required',
        success: false
      });
    }

    // Validate range parameter
    const rangeParam = searchParams.get('range');
    let range: number;
    
    if (rangeParam) {
      range = parseInt(rangeParam);
      if (isNaN(range) || range <= 0 || range > 365) {
        return jsonResponse(null, {
          status: 400,
          message: 'Range must be a valid number between 1 and 365',
          success: false
        });
      }
    } else {
      range = 14; // default value
    }

    // Calculate date range safely
    const targetDate = new Date();
    if (isNaN(targetDate.getTime())) {
      return jsonResponse(null, {
        status: 500,
        message: 'Date calculation error',
        success: false
      });
    }
    
    targetDate.setDate(targetDate.getDate() - range);

    const whereClause: Prisma.AttemptWhereInput = {
      userId: userId.trim(),
      solvedAt: {
        gte: targetDate
      },
      mistake: {
        not: 'NONE'
      }
    };

    // Database operations with specific error handling
    let mistakeData: any[];
    let totalAttempts: number;

    try {
      // Execute both queries with Promise.all for better performance
      const [mistakeResult, totalResult] = await Promise.all([
        prisma.attempt.groupBy({
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
        }),
        prisma.attempt.count({
          where: whereClause
        })
      ]);

      mistakeData = mistakeResult;
      totalAttempts = totalResult;

    } catch (dbError) {
      console.error('Database query error:', dbError);
      
      // Handle specific Prisma errors
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        switch (dbError.code) {
          case 'P2002':
            return jsonResponse(null, {
              status: 409,
              message: 'Unique constraint violation',
              success: false
            });
          case 'P2025':
            return jsonResponse(null, {
              status: 404,
              message: 'Record not found',
              success: false
            });
          case 'P2021':
            return jsonResponse(null, {
              status: 400,
              message: 'Table does not exist',
              success: false
            });
          default:
            return jsonResponse(null, {
              status: 500,
              message: 'Database operation failed',
              success: false
            });
        }
      }
      
      if (dbError instanceof Prisma.PrismaClientUnknownRequestError) {
        return jsonResponse(null, {
          status: 500,
          message: 'Unknown database error',
          success: false
        });
      }
      
      if (dbError instanceof Prisma.PrismaClientValidationError) {
        return jsonResponse(null, {
          status: 400,
          message: 'Invalid query parameters',
          success: false
        });
      }

      // Generic database error
      return jsonResponse(null, {
        status: 500,
        message: 'Database connection failed',
        success: false
      });
    }

    // Validate database results
    if (!Array.isArray(mistakeData)) {
      console.error('Invalid mistake data format received from database');
      return jsonResponse(null, {
        status: 500,
        message: 'Invalid data format received',
        success: false
      });
    }

    if (typeof totalAttempts !== 'number' || totalAttempts < 0) {
      console.error('Invalid total attempts count:', totalAttempts);
      return jsonResponse(null, {
        status: 500,
        message: 'Invalid attempt count received',
        success: false
      });
    }

    // Process data with error handling
    let distribution: { type: string; percentage: number }[];
    
    try {
      distribution = mistakeData.map(item => {
        if (!item || typeof item !== 'object' || !item.mistake || !item._count) {
          throw new Error('Invalid mistake data structure');
        }

        const count = item._count.id;
        if (typeof count !== 'number' || count < 0) {
          throw new Error('Invalid count value');
        }

        const percentage = totalAttempts > 0 ? 
          parseFloat(((count / totalAttempts) * 100).toFixed(2)) : 0;

        if (isNaN(percentage)) {
          throw new Error('Percentage calculation failed');
        }

        return {
          type: item.mistake,
          percentage: percentage
        };
      });
    } catch (processingError) {
      console.error('Data processing error:', processingError);
      return jsonResponse(null, {
        status: 500,
        message: 'Failed to process mistake data',
        success: false
      });
    }

    // Define all mistake types
    const allMistakeTypes = ['CONCEPTUAL', 'CALCULATION', 'READING', 'OVERCONFIDENCE', 'OTHER'];

    // Create complete distribution with error handling
    let completeDistribution: { type: string; percentage: number }[];
    
    try {
      completeDistribution = allMistakeTypes.map(mistakeType => {
        const found = distribution.find(item => item.type === mistakeType);
        return {
          type: mistakeType,
          percentage: found ? found.percentage : 0
        };
      });
    } catch (mappingError) {
      console.error('Distribution mapping error:', mappingError);
      return jsonResponse(null, {
        status: 500,
        message: 'Failed to map distribution data',
        success: false
      });
    }

    // Generate conclusion with error handling
    let conclusionMessage: string;
    try {
      conclusionMessage = generateMistakeConclusion(completeDistribution);
    } catch (conclusionError) {
      console.error('Conclusion generation error:', conclusionError);
      // Provide fallback message instead of failing
      conclusionMessage = "Keep analyzing your mistakes to improve your performance.";
    }

    return jsonResponse({ 
      distribution: completeDistribution, 
      suggest: conclusionMessage 
    }, {
      status: 200,
      message: 'Success',
      success: true
    });

  } catch (error) {
    // Catch-all error handler
    console.error('Unexpected error in mistake distribution API:', error);
    
    // Log additional error details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return jsonResponse(null, {
      status: 500,
      message: 'An unexpected error occurred',
      success: false
    });
  }
}

function generateMistakeConclusion(distribution: { type: string; percentage: number }[]): string {
  try {
    // Validate input
    if (!Array.isArray(distribution) || distribution.length === 0) {
      throw new Error('Invalid distribution data provided');
    }

    // Validate each distribution item
    for (const item of distribution) {
      if (!item || typeof item !== 'object' || 
          typeof item.type !== 'string' || 
          typeof item.percentage !== 'number' || 
          isNaN(item.percentage) || 
          item.percentage < 0) {
        throw new Error('Invalid distribution item structure');
      }
    }

    const topMistake = distribution.reduce((prev, curr) => {
      if (curr.percentage > prev.percentage) {
        return curr;
      }
      return prev;
    }, { type: 'NONE', percentage: 0 });

    if (topMistake.percentage === 0) {
      return "Great job! You haven't made any significant mistakes recently. Keep up the consistency!";
    }

    const suggestions: Record<string, string> = {
      CONCEPTUAL: "Focus more on strengthening your core concepts. Revisit the theory and understand the *why* behind each topic.",
      CALCULATION: "Looks like calculation mistakes are frequent. Double-check your math and try not to rush through problems.",
      READING: "Pay closer attention to the question. Misreading could be costing you. Practice active reading strategies.",
      OVERCONFIDENCE: "Be mindful of overconfidence. It's okay to double-check even the seemingly easy questions.",
      OTHER: "You're making miscellaneous mistakes. Try reviewing your attempted questions to spot any patterns or habits."
    };

    const suggestion = suggestions[topMistake.type];
    if (!suggestion) {
      return `Analyze your recent mistakes for improvement. (${topMistake.percentage}% of your mistakes fall under ${topMistake.type} category.)`;
    }

    return `${suggestion} (${topMistake.percentage}% of your mistakes fall under this category.)`;

  } catch (error) {
    console.error('Error generating mistake conclusion:', error);
    // Return a safe fallback message
    return "Continue analyzing your mistakes to identify areas for improvement.";
  }
}