import { Prisma } from '@prisma/client'

// Define the type using Prisma's type generator
export type TestWithIncludes = Prisma.TestParticipationGetPayload<{
    include: {
        test: {
            include: {
                testSections: {
                    include: {
                        testQuestions: {
                            include: {
                                question: {
                                    select: {
                                        id: true
                                        slug: true
                                        subject: true
                                        difficulty: true
                                        topic: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        attempts: {
            include: {
                question: {
                    select: {
                        id: true
                        slug: true
                        subject: true
                        difficulty: true
                        topic: true
                    }
                }
            }
        }
    }
}>



export interface SectionAPerformance {
  sectionName: string;
  participantScore: number;
  totalMarks: number;
}

export interface AnalysisSectionA {
  testTitle: string;
    accuracy: number;
  examType: string | null;
  stream: string | null;
  participantScore: number;
  totalMarks: number | null;
  timeTaken: number | null;
  testDuration: number;
  sectionPerformance: SectionAPerformance[];
}

export interface SectionBDifficulty {
    Easy:{
        total:number
        correct:number
    }
    Medium:{
        total:number
        correct:number
    }
    Hard:{
        total:number
        correct:number
    }
}

export interface AnalysisSectionB {
    difficultyAnalysis:SectionBDifficulty
    feedback:string
    statistics:{
        totalQuestions:number
        correct:number
        incorrect:number
        unattempted:number
        accuracy:string
    }
}


export interface SectionCTiming {
    name: string;
    totalTime: number;
    maxTime: number;
  }
  
 export interface SectioncQuestionTiming {
    question: string;
    mathematics?: number;
    physics: number;
    chemistry: number;
    biology?: number;
  }
  
  export interface AnalysisSectionC {
    sectionTimings: SectionCTiming[];
    questionTimings: SectioncQuestionTiming[];
  }
 
  interface SectionDDifficulty {
    easy:{
        total:number
        correct:number
        incorrect:number
    }
    medium:{
        total:number
        correct:number
        incorrect:number
    }
    hard:{
        total:number
        correct:number
        incorrect:number
    }
    very_hard:{
        total:number
        correct:number
        incorrect:number
    }
  }
  
  export interface AnalysisSectionD {
    difficultyWiseAnalysis:SectionDDifficulty
    totalQuestions:number
  }

  

  export interface AnalysisSectionE {
    slug:string
    subject:string
    topic:string
    difficulty:number
    status:'correct' | 'incorrect' | 'unattempted'
    timeTaken:number
  }
