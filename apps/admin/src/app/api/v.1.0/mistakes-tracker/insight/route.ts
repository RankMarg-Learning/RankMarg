// Shifted to Backend
export const dynamic = 'force-dynamic';

import prisma from "@/lib/prisma"
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";
import { TextFormator } from "@/utils/textFormator";

interface DetailedMistakePattern {
  mistakeType: string;
  count: number;
  totalAttempts: number;
  accuracy: number;
  recentOccurrences: Array<{
    questionId: string;
    solvedAt: Date;
    difficulty: number;
  }>;
}

interface SpecificInsight {
  type: 'MISTAKE_PATTERN' | 'IMPROVEMENT' | 'WEAKNESS';
  title: string;
  description: string;
  mistakeType?: string;
  frequency?: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let userId = searchParams.get('userId')
    const days = parseInt(searchParams.get('days') || '30')
    
    const session = await getAuthSession()
    if (session?.user?.id) {
      userId = session.user.id
    }
    if (!userId) {
      return jsonResponse(null, {
        status: 400,
        message: 'User ID is required',
        success: false
        })
    }

    const insights = await generateDetailedMistakeInsights(userId, days)
    return jsonResponse(insights, {
        status: 200,
        message: 'Mistake insights generated successfully',
        success: true
    })
    
  } catch (error) {
    console.error('Error generating mistake insights:', error)
    return jsonResponse(null, {
      status: 500,
        message: 'Failed to generate mistake insights',
        success: false
    });
  }
}

async function generateDetailedMistakeInsights(userId: string, days: number = 30) {
  const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  const allAttempts = await prisma.attempt.findMany({
    where: {
      userId,
      solvedAt: { gte: dateFrom }
    },
    include: {
      question: {
        include: {
          subject: true,
          topic: true,
          subTopic: true
        }
      }
    },
    orderBy: { solvedAt: 'desc' }
  })

  const mistakeAttempts = allAttempts.filter(attempt => 
    attempt.status === 'INCORRECT' && attempt.mistake && attempt.mistake !== 'NONE'
  )

  const detailedPatterns = analyzeDetailedMistakePatterns(mistakeAttempts)
  
  const specificInsights = generateSpecificInsights(detailedPatterns, allAttempts)

  return specificInsights
}

function analyzeDetailedMistakePatterns(attempts: any[]): DetailedMistakePattern[] {
  const patterns: Record<string, DetailedMistakePattern> = {}

  attempts.forEach(attempt => {
    const mistakeType = attempt.mistake
    const key = mistakeType

    if (!patterns[key]) {
      patterns[key] = {
        mistakeType,
        count: 0,
        totalAttempts: 0,
        accuracy: 0,
        recentOccurrences: []
      }
    }

    patterns[key].count++
    
    if (patterns[key].recentOccurrences.length < 3) {
      patterns[key].recentOccurrences.push({
        questionId: attempt.questionId,
        solvedAt: attempt.solvedAt,
        difficulty: attempt.question.difficulty
      })
    }
  })

  return Object.values(patterns)
    .filter(pattern => pattern.count >= 2)
    .sort((a, b) => b.count - a.count)
}

function generateSpecificInsights(
  patterns: DetailedMistakePattern[], 
  allAttempts: any[]
): SpecificInsight[] {
  const insights: SpecificInsight[] = []

  patterns.slice(0, 5).forEach(pattern => {
    const insight = createMistakeInsight(pattern)
    if (insight) insights.push(insight)
  })

  const weaknessInsights = identifyWeaknesses(allAttempts)
  insights.push(...weaknessInsights.slice(0, 2))

  return insights.sort((a, b) => {
    const severityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

function createMistakeInsight(pattern: DetailedMistakePattern): SpecificInsight | null {
  const mistakeDescriptions = {
    'CONCEPTUAL': 'Concept not clear',
    'CALCULATION': 'Calculation errors',
    'READING': 'Question misinterpretation',
    'OVERCONFIDENCE': 'Rushed answers'
  }

  const severity = pattern.count >= 5 ? 'HIGH' : pattern.count >= 3 ? 'MEDIUM' : 'LOW'
  const description = mistakeDescriptions[pattern.mistakeType] || 'Common errors'

  return {
    type: 'MISTAKE_PATTERN',
    title: `${pattern.mistakeType.charAt(0) + pattern.mistakeType.slice(1).toLowerCase()} Errors`,
    description: `You consistently make "${description}" errors in your practice.`,
    mistakeType: pattern.mistakeType,
    frequency: pattern.count,
    severity
  }
}

function identifyWeaknesses(allAttempts: any[]): SpecificInsight[] {
  const mistakeTypePerformance: Record<string, { correct: number; total: number }> = {}

  allAttempts.forEach(attempt => {
    const mistakeType = attempt.mistake || 'NONE'
    
    if (!mistakeTypePerformance[mistakeType]) {
      mistakeTypePerformance[mistakeType] = { correct: 0, total: 0 }
    }

    mistakeTypePerformance[mistakeType].total++
    if (attempt.status === 'CORRECT') {
      mistakeTypePerformance[mistakeType].correct++
    }
  })

  const weaknesses: SpecificInsight[] = []

  Object.entries(mistakeTypePerformance).forEach(([mistakeType, performance]) => {
    if (performance.total >= 5 && mistakeType !== 'NONE') {
      const accuracy = (performance.correct / performance.total) * 100
      
      if (accuracy < 50) {
        weaknesses.push({
          type: 'WEAKNESS',
          title: `Persistent ${TextFormator(mistakeType)} Issues`,
          description: `Your accuracy for ${mistakeType.toLowerCase()} related questions is ${accuracy.toFixed(1)}% across ${performance.total} attempts.`,
          severity: accuracy < 30 ? 'HIGH' : 'MEDIUM'
        })
      }
    }
  })

  return weaknesses.sort((a, b) => {
    const severityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}