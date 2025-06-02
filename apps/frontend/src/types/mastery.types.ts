export interface ConceptsMastered {
    mastered: number;
    total: number;
}

export interface OverallMastery {
    percentage: number;
    label: string;
    improvement: number;
    topPercentage: number;
}

export interface StudyStreak {
    days: number;
    message: string;
}

export interface MasteryOverviewProps {
    conceptsMastered: ConceptsMastered;
    overallMastery: OverallMastery;
    studyStreak: StudyStreak;
}


export interface TopicMastery {
    name: string;
    masteryLevel: number; 
}

export interface SubjectRecommendation {
    icon: string;         
    color: string;      
    type: string;         
    message: string;    
}

export interface SubjectConcepts {
    mastered: number;
    total: number;
}

export interface SubjectMasteryProps {
    id: string;                                    
    name: string;                                   
    masteryPercentage: number;                     
    improvementFromLastMonth: number;               
    concepts: SubjectConcepts;                     
    improvementAreas: TopicMastery[];               
    topPerformingTopics: TopicMastery[];           
    recommendations: SubjectRecommendation[];       
}
