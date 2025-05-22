


export type RecommendationType = "physics" | "chemistry" | "biology" | "mathematics" | "default";
export type RecommendationIcon = 'info' | 'warning' | 'check' | 'close';
export type RecommendationColor = 'red' | 'blue' | 'green' | 'purple' | 'teal' | 'gray' | 'indigo' | 'lime';

export interface Recommendation {
  icon: RecommendationIcon;
  color: RecommendationColor;
  type: RecommendationType;
  message: string;
}