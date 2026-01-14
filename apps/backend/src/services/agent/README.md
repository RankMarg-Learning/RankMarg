# RankMarg Coach Agent

A strategic, periodic, AI-powered mentor for NEET/JEE exam preparation.

## Overview

The Coach Agent transforms student performance data into actionable guidance that improves exam rank. It follows a deterministic analytics-first approach, using LLM only for reasoning and communication.

## Architecture

```
Practice Engine → Telemetry → Analytics Engine → Coach Orchestrator → LLM → Coach Report → UI
```

## Core Principles

1. **Analytics First, LLM Last** - All metrics computed deterministically before LLM call
2. **Time-Boxed Reasoning** - Strict 14-day performance windows
3. **Frozen Mastery Snapshots** - Immutable snapshots for comparison
4. **Deterministic Study Phase** - Phase calculated from exam date
5. **Actionability > Motivation** - Specific, measurable recommendations

## Components

### Analytics Engine
- **PerformanceAnalyzer** - 14-day window analytics
- **MasteryDeltaCalculator** - Mastery change detection (+0.05 improvement, -0.05 regression)
- **RiskDetector** - Identifies avoidance, burnout, false confidence, knowledge decay

### LLM Integration
- **CoachLLMService** - GPT-4o integration with structured prompts
- Validates actionability (rejects generic advice)
- JSON response format enforcement

### Roadmap Generation
- **RoadmapGenerator** - Phase-based 14-day study planning
- Max 2 subjects per day
- No new topics in revision phase
- Smart topic prioritization based on risks and performance

### Orchestration
- **CoachOrchestrator** - Main coordination service
- **SnapshotManager** - Frozen mastery snapshot management
- Redis-based storage (no database schema changes)

## Usage

```typescript
import { CoachOrchestrator } from "@/services/agent";

const coach = new CoachOrchestrator();

// Generate report
const report = await coach.generateCoachReport(
  "user-123",
  "NEET",
  ReportType.PERIODIC
);

// Access components
console.log(report.insights.strengths);
console.log(report.recommendations.immediate);
console.log(report.roadmap.dailySessions);
console.log(report.riskFlags);
```

## Environment Variables

```bash
OPENAI_API_KEY=sk-...
```

## Data Storage

All data stored in Redis with appropriate TTLs:
- Snapshots: 90 days
- Reports: 30 days
- Risk Flags: 60 days

**Key Patterns:**
```
coach:snapshot:{userId}:{timestamp}
coach:report:{userId}:{reportId}
coach:risks:{userId}
```

## API Integration

See [coach.controller.example.ts](./examples/coach.controller.example.ts) for API endpoint implementation.

**Endpoints:**
- `POST /api/coach/report/:userId` - Generate report
- `GET /api/coach/report/:userId/latest` - Get latest report
- `GET /api/coach/risks/:userId` - Get risk flags
- `GET /api/coach/roadmap/:userId` - Get roadmap
- `GET /api/coach/insights/:userId` - Get insights

## Report Structure

```typescript
{
  id: string;
  userId: string;
  examCode: string;
  studyPhase: StudyPhase;
  daysToExam: number;
  
  // Analytics
  performanceWindow: PerformanceWindow;
  masteryComparison: MasteryComparison;
  riskFlags: RiskFlag[];
  
  // LLM-generated
  insights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    keyObservations: string[];
  };
  
  recommendations: {
    immediate: string[];      // Next 3 days
    shortTerm: string[];      // Next 7 days
    longTerm: string[];       // Next 14 days
    studyHabits: string[];
    examStrategy: string[];
  };
  
  // Roadmap
  roadmap: {
    dailySessions: DailySession[];
    constraints: {...};
    summary: {...};
  };
}
```

## Risk Types

1. **Avoidance** - Student avoiding difficult topics
2. **Burnout** - Excessive study hours with declining performance
3. **False Confidence** - High accuracy only on easy questions
4. **Knowledge Decay** - Mastery declining over time

## Study Phases

- **Foundation** (>6 months to exam) - Building fundamentals
- **Building** (3-6 months) - Strengthening concepts
- **Revision** (1-3 months) - Consolidating knowledge
- **Exam-Ready** (<1 month) - Test simulations

## FAANG-Grade Engineering

✅ Layered architecture  
✅ Domain-first design  
✅ Explicit over clever  
✅ Deterministic behavior  
✅ Observability  
✅ Error handling  
✅ Type safety  

## Next Steps

1. Integrate with API routes
2. Set up background job for periodic reports
3. Build frontend dashboard
4. Add notification system for risk flags

## Documentation

- [Implementation Plan](../../../../../.gemini/antigravity/brain/6f809dc2-44d1-4b60-871b-2415c4a2ebab/implementation_plan.md)
- [Walkthrough](../../../../../.gemini/antigravity/brain/6f809dc2-44d1-4b60-871b-2415c4a2ebab/walkthrough.md)
- [Blueprint](../../../../../RankMarg_Coach_Agent_Blueprint.md)
