import { MistakeType } from "@prisma/client";


  
  export interface MistakeTrend {
    improving: boolean
    status: 'NEEDS_ATTENTION' | 'IMPROVING' | 'STABLE'
    recommendation: string
  }
  
  export interface MistakeBySubject {
    subject: string
    current: number
    previous: number
    change: number
  }
  
  export interface MostMistakeType {
    type: MistakeType
    count: number
  }
  
  export interface TotalMistakeCount {
    current: number
    previous: number
    change: number
    reducePct:  number
  }
  
  export interface MistakeAnalyticsOverview {
      trend: MistakeTrend
      mistakesBySubject: MistakeBySubject[]
      mostMistakeType: MostMistakeType
      cnt: TotalMistakeCount
    
  }

export interface MistakeCategoryPercentage {
    type: MistakeType;
    percentage: number; 
  }
  
export interface AnalyticsDashboardProps {
    distribution: MistakeCategoryPercentage[],
    suggest?: string,
  }