import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  AlertTriangle, 
  Target, 
  Lightbulb, 
  AlertCircle,
  CheckCircle,
  Info,
  BarChart3
} from 'lucide-react';

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
  badgeVariant: 'destructive' | 'secondary' | 'default' | 'outline';
  badgeClass: string;
  icon: React.ReactElement;
}

const MistakeInsights: React.FC<MistakeInsightsProps> = ({ insights = [] }) => {
  
  const getInsightStyles = (type: Insight['type'], severity: Insight['severity']): InsightStyles => {
    if (type === 'WEAKNESS') {
      switch (severity) {
        case 'HIGH':
          return {
            bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
            border: 'border-red-200/60',
            iconColor: 'text-red-600',
            titleColor: 'text-red-800',
            textColor: 'text-red-700',
            badgeVariant: 'destructive',
            badgeClass: 'bg-red-100 text-red-800 border-red-200',
            icon: <AlertTriangle className="h-5 w-5" />
          };
        case 'MEDIUM':
          return {
            bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
            border: 'border-amber-200/60',
            iconColor: 'text-amber-600',
            titleColor: 'text-amber-800',
            textColor: 'text-amber-700',
            badgeVariant: 'secondary',
            badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
            icon: <AlertCircle className="h-5 w-5" />
          };
        default:
          return {
            bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
            border: 'border-orange-200/60',
            iconColor: 'text-orange-600',
            titleColor: 'text-orange-800',
            textColor: 'text-orange-700',
            badgeVariant: 'outline',
            badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
            icon: <Info className="h-5 w-5" />
          };
      }
    } else if (type === 'MISTAKE_PATTERN') {
      switch (severity) {
        case 'HIGH':
          return {
            bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
            border: 'border-red-200/60',
            iconColor: 'text-red-600',
            titleColor: 'text-red-800',
            textColor: 'text-red-700',
            badgeVariant: 'destructive',
            badgeClass: 'bg-red-100 text-red-800 border-red-200',
            icon: <BarChart3 className="h-5 w-5" />
          };
        case 'MEDIUM':
          return {
            bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
            border: 'border-amber-200/60',
            iconColor: 'text-amber-600',
            titleColor: 'text-amber-800',
            textColor: 'text-amber-700',
            badgeVariant: 'secondary',
            badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
            icon: <BarChart3 className="h-5 w-5" />
          };
        default:
          return {
            bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
            border: 'border-blue-200/60',
            iconColor: 'text-blue-600',
            titleColor: 'text-blue-800',
            textColor: 'text-blue-700',
            badgeVariant: 'outline',
            badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: <BarChart3 className="h-5 w-5" />
          };
      }
    } else if (type === 'IMPROVEMENT') {
      return {
        bg: 'bg-gradient-to-br from-green-50 to-green-100/50',
        border: 'border-green-200/60',
        iconColor: 'text-green-600',
        titleColor: 'text-green-800',
        textColor: 'text-green-700',
        badgeVariant: 'default',
        badgeClass: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-5 w-5" />
      };
    }
    
    // Default fallback
    return {
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100/50',
      border: 'border-gray-200/60',
      iconColor: 'text-gray-600',
      titleColor: 'text-gray-800',
      textColor: 'text-gray-700',
      badgeVariant: 'outline',
      badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <Lightbulb className="h-5 w-5" />
    };
  };

  const getSeverityBadge = (severity: Insight['severity']) => {
    switch (severity) {
      case 'HIGH':
        return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case 'MEDIUM':
        return <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Medium</Badge>;
      case 'LOW':
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  if (!insights || insights.length === 0) {
    return (
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-primary-100 rounded-lg">
              <Lightbulb className="h-4 w-4 text-primary-600" />
            </div>
            <h3 className="text-base font-semibold text-primary-900">Personalized Insights</h3>
          </div>
          
          <div className="text-center py-4">
            <div className="p-3 bg-white/60 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary-400" />
            </div>
            <h4 className="text-primary-800 font-medium mb-1 text-sm">No insights available yet</h4>
            <p className="text-primary-600 text-xs max-w-xs mx-auto leading-relaxed">
              Keep practicing to unlock personalized insights!
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 p-4 border-b border-primary-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-100 rounded-lg">
              <Lightbulb className="h-4 w-4 text-primary-600" />
            </div>
            <h3 className="text-base font-semibold text-primary-900">Personalized Insights</h3>
          </div>
          <Badge variant="outline" className="bg-primary-100 text-primary-800 border-primary-200 text-xs">
            {insights.length} {insights.length === 1 ? 'Insight' : 'Insights'}
          </Badge>
        </div>
      </div>
      
      <div className="p-3">
        <div className="space-y-2">
          {insights?.map((insight: Insight, index: number) => {
            const styles: InsightStyles = getInsightStyles(insight.type, insight.severity);
            
            return (
              <Card 
                key={index} 
                className={`${styles.bg} border ${styles.border} shadow-sm hover:shadow-md transition-all duration-200`}
              >
                <div className="p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${styles.iconColor.replace('text-', 'bg-').replace('-600', '-100')} flex-shrink-0`}>
                      {styles.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold ${styles.titleColor} text-sm mb-1`}>
                        {insight.title}
                      </h4>
                      <div className="flex items-center gap-1 flex-wrap">
                        {getSeverityBadge(insight.severity)}
                        {insight.frequency && (
                          <Badge variant="outline" className="text-xs">
                            {insight.frequency} times
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className={`text-xs ${styles.textColor} leading-relaxed mb-2`}>
                    {insight.description}
                  </p>
                  
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default MistakeInsights;