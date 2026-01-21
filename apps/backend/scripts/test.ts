// test.ts

import { EnhancedAnalyzer } from "@/services/suggest-engine/analyzer/EnhancedAnalyzer";
import { SuggestionFormatter } from "@/services/suggest-engine/formatter/SuggestionFormatter";

const analyzer = new EnhancedAnalyzer();

const formatter = new SuggestionFormatter();
analyzer.analyze("61e6aebc-00e9-4e4d-a379-03b5138c93e6").then((analysis) => {
    console.log(analysis);
    if (!analysis) return;
    const message = formatter.formatDailySummary(
        analysis,
        "encouraging"
    );
    console.log(message);
});

//RUN CMD
//npx ts-node -r tsconfig-paths/register --transpile-only scripts/test.ts
