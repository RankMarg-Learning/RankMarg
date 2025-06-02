import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import React from 'react'
import { AnalysisSectionD } from '@/types/typeTest'

const difficultyConfig = {
  easy: { label: 'Easy', color: 'green', bg: 'bg-green-50', text: 'text-green-600', indicator: 'bg-green-500' },
  medium: { label: 'Medium', color: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-600', indicator: 'bg-yellow-500' },
  hard: { label: 'Hard', color: 'red', bg: 'bg-red-50', text: 'text-red-600', indicator: 'bg-red-500' },
  very_hard: { label: 'Very Hard', color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600', indicator: 'bg-purple-500' },
} as const;

const SectionD = ({ analysis }: { analysis: AnalysisSectionD }) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Difficulty Level Analysis</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Overall Difficulty Distribution</h3>
          <div className="grid gap-4">
            {Object.entries(difficultyConfig).map(([key, config]) => {
              const data = analysis.difficultyWiseAnalysis[key as keyof typeof difficultyConfig];
              const successRate = data.total > 0 ? (data.correct / data.total) * 100 : 0;

              return (
                <div key={key} className={`p-4 rounded-lg ${config.bg}`}>
                  <div className="flex justify-between mb-2">
                    <span>{config.label} ({data.total} Questions)</span>
                    <span className={config.text}>{successRate.toFixed(2)}% Success</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Correct: {data.correct}</span>
                    <span>Incorrect: {data.incorrect}</span>
                  </div>
                  <Progress
                    value={successRate}
                    className="h-2 mt-2 bg-gray-100"
                    indicatorColor={config.indicator}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectionD;
