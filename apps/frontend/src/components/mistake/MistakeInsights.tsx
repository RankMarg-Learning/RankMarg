import React from 'react';

interface Insight {
  type: 'WEAKNESS' | 'MISTAKE_PATTERN' | 'IMPROVEMENT';
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  mistakeType?: string;
  frequency?: number;
}

interface MistakeInsightsProps {
  insights?: Insight[];
}

interface InsightStyles {
  bg: string;
  border: string;
  iconColor: string;
  titleColor: string;
  textColor: string;
  icon: React.ReactElement;
}

const MistakeInsights: React.FC<MistakeInsightsProps> = ({ insights = [] }) => {
  const getInsightStyles = (type: Insight['type'], severity: Insight['severity']): InsightStyles => {
    if (type === 'WEAKNESS') {
      switch (severity) {
        case 'HIGH':
          return {
            bg: 'bg-red-50',
            border: 'border-red-100',
            iconColor: 'text-red-500',
            titleColor: 'text-red-700',
            textColor: 'text-red-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            )
          };
        case 'MEDIUM':
          return {
            bg: 'bg-yellow-50',
            border: 'border-yellow-100',
            iconColor: 'text-yellow-500',
            titleColor: 'text-yellow-700',
            textColor: 'text-yellow-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )
          };
        default:
          return {
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            iconColor: 'text-orange-500',
            titleColor: 'text-orange-700',
            textColor: 'text-orange-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )
          };
      }
    } else if (type === 'MISTAKE_PATTERN') {
      switch (severity) {
        case 'HIGH':
          return {
            bg: 'bg-red-50',
            border: 'border-red-100',
            iconColor: 'text-red-500',
            titleColor: 'text-red-700',
            textColor: 'text-red-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            )
          };
        case 'MEDIUM':
          return {
            bg: 'bg-yellow-50',
            border: 'border-yellow-100',
            iconColor: 'text-yellow-500',
            titleColor: 'text-yellow-700',
            textColor: 'text-yellow-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )
          };
        default:
          return {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            iconColor: 'text-blue-500',
            titleColor: 'text-blue-700',
            textColor: 'text-blue-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )
          };
      }
    } else if (type === 'IMPROVEMENT') {
      return {
        bg: 'bg-green-50',
        border: 'border-green-100',
        iconColor: 'text-green-500',
        titleColor: 'text-green-700',
        textColor: 'text-green-600',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        )
      };
    }
    
    // Default fallback
    return {
      bg: 'bg-gray-50',
      border: 'border-gray-100',
      iconColor: 'text-gray-500',
      titleColor: 'text-gray-700',
      textColor: 'text-gray-600',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      )
    };
  };

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/30 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Personalized Insights</h3>
        <p className="text-gray-500 text-sm">No insights available yet. Keep practicing to see your progress!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200/30 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Personalized Insights</h3>
      <div className="space-y-4">
        {insights.map((insight: Insight, index: number) => {
          const styles: InsightStyles = getInsightStyles(insight.type, insight.severity);
          
          return (
            <div key={index} className={`p-3 ${styles.bg} rounded-lg border ${styles.border}`}>
              <div className="flex items-center mb-2 text-sm">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 ${styles.iconColor} mr-2`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {styles.icon}
                </svg>
                <div className={`font-medium ${styles.titleColor}`}>
                  {insight.title}
                </div>
              </div>
              <p className={`text-sm ${styles.textColor}`}>
                {insight.description}
                {insight.frequency && ` (${insight.frequency} occurrences)`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MistakeInsights;