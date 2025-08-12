import { MetricType } from "@prisma/client";

type Metric = {
    metricType: MetricType
    currentValue: number;
    previousValue: number;
};

type FormattedMetric = {
    value: string;         
    delta: string;         
    suggestion: string;     
};

export function getMetricCardData(metrics: Metric[]): Record<string, FormattedMetric> {
    const results: Record<string, FormattedMetric> = {};

    for (const { metricType, currentValue, previousValue } of metrics) {
        const diff = currentValue - previousValue;
        const isImproved = diff > 0;
        const hasChanged = diff !== 0;


        let valueStr = '';
        let deltaStr = '';
        let suggestion = '';

        switch (metricType) {
            case "TOTAL_QUESTIONS":
                valueStr = `${currentValue}`;
                deltaStr = hasChanged ? `${isImproved ? '+' : ''}${((diff / (previousValue === 0 ? 1:previousValue)) * 100).toFixed(1)}%` : '0%';
                suggestion = isImproved
                    ? `${deltaStr} more than last week`
                    : `Try to solve more next week`;
                break;

            case "CORRECT_ATTEMPTS":
                valueStr = `${currentValue}`;
                deltaStr = hasChanged ? `${isImproved ? '+' : ''}${((diff / (previousValue === 0 ? 1:previousValue)) * 100).toFixed(1)}%` : '0%';
                suggestion = isImproved
                    ? "Great progress! Keep it up"
                    : "Accuracy dropped, revise weak topics";
                break;

            case "MASTERY_LEVEL":
                valueStr = `${currentValue}`;
                deltaStr = hasChanged ? `${((diff / (previousValue === 0 ? 1:previousValue)) * 100).toFixed(1)}%` : '0%';
                suggestion = isImproved
                    ? "Improving steadily across subjects"
                    : "Focus more on concept revision";
                break;

            case "TEST_SCORE":
                valueStr = `${currentValue}`;
                deltaStr = hasChanged ? `{((diff / (previousValue === 0 ? 1:previousValue)) * 100).toFixed(1)}%` : '0%';
                suggestion = isImproved
                    ? diff >= 10
                        ? "Big jump in score! Keep up the momentum"
                        : "Nice improvement! Aim even higher"
                    : diff < -10
                        ? "Significant drop, review your test strategy"
                        : "Slight drop, revise weak areas and try again";
                break;
        }

        results[metricType] = {
            value: valueStr,
            delta: deltaStr,
            suggestion,
        };
    }

    return results;
}
