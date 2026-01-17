/**
 * RankMarg Coach Agent - Main Export
 * 
 * A strategic, periodic, AI-powered mentor for NEET/JEE students
 * 
 * Architecture:
 * Practice Engine → Telemetry → Analytics Engine → Coach Orchestrator → LLM → Coach Report → UI
 * 
 * Core Principles:
 * 1. Analytics First, LLM Last
 * 2. Time-Boxed Reasoning (14-day windows)
 * 3. Frozen Mastery Snapshots
 * 4. Deterministic Study Phase
 * 5. Actionability > Motivation
 */

// Main orchestrator
export { CoachOrchestrator } from "./CoachOrchestrator";

// Bulk processing
export { BulkCoachGenerator } from "./BulkCoachGenerator";

// Analytics services
export { PerformanceAnalyzer } from "./analytics/PerformanceAnalyzer";
export { MasteryDeltaCalculator } from "./analytics/MasteryDeltaCalculator";
export { RiskDetector } from "./analytics/RiskDetector";

// LLM service
export { CoachLLMService } from "./llm/CoachLLMService";

// Roadmap generation
export { RoadmapGenerator } from "./roadmap/RoadmapGenerator";

// Snapshot management
export { SnapshotManager } from "./snapshot/SnapshotManager";

// Configuration and utilities
export {
    coachConfig,
    determineStudyPhase,
    calculateDaysToExam,
    CoachRedisKeys,
    CoachError,
    InsufficientDataError,
    LLMError,
    ValidationError,
} from "./coach.config";

// Types
export * from "../../types/coach.types";
