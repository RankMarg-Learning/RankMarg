# Mastery Algorithm Improvements

## Overview

This document outlines the comprehensive improvements made to the mastery calculation algorithm in the RankMarg application. The new system addresses critical issues in the original implementation and provides a more sophisticated, adaptive learning-based mastery calculation.

## Issues Identified and Fixed

### 1. **Data Inconsistency Issues**

- **Problem**: The original algorithm only processed questions by subtopic, ignoring questions that might have topicId or subjectId directly
- **Solution**: Enhanced `AttemptsProcessor` to handle questions at all hierarchy levels (subtopic, topic, subject)
- **Impact**: Better coverage of all question types and improved data processing

### 2. **Missing User Context**

- **Problem**: Algorithm didn't consider user's study patterns, target year, or stream-specific requirements
- **Solution**: Added comprehensive user profile analysis including:
  - Study hours per day
  - Target year
  - User grade and activity status
  - Stream-specific configurations
- **Impact**: Personalized mastery calculation based on individual learning patterns

### 3. **Weak Aggregation Logic**

- **Problem**: Topic and subject mastery calculations were too simplistic
- **Solution**: Implemented weighted aggregation considering:
  - Topic weightage
  - Number of attempts
  - Difficulty distribution
  - Mastery thresholds
- **Impact**: More accurate hierarchical mastery representation

### 4. **No Time Decay Implementation**

- **Problem**: Algorithm didn't account for forgetting curves
- **Solution**: Implemented exponential decay model with:
  - Configurable decay rates
  - User-specific adjustment factors
  - Review boost mechanisms
- **Impact**: Realistic mastery decay over time

### 5. **Missing Difficulty Weighting**

- **Problem**: All questions were treated equally regardless of difficulty
- **Solution**: Added difficulty-based weighting:
  - Easy questions: 0.8x weight
  - Medium questions: 1.0x weight
  - Hard questions: 1.3x weight
- **Impact**: Better assessment of true mastery levels

### 6. **No Adaptive Learning**

- **Problem**: Algorithm didn't adapt to user's learning pace
- **Solution**: Implemented adaptive learning factors:
  - Performance trend analysis
  - Improvement rate calculation
  - Consistency scoring
  - Adaptive weighting for existing vs new mastery
- **Impact**: Personalized learning assessment

### 7. **Incomplete Data Processing**

- **Problem**: Missing consideration of question categories, mistake types, and performance patterns
- **Solution**: Enhanced data processing including:
  - Mistake type analysis (conceptual, calculation, reading, overconfidence)
  - Question category consideration
  - Time distribution analysis
  - Spaced repetition effectiveness
- **Impact**: More comprehensive mastery assessment

## New Architecture

### Enhanced Configuration (`MasteryConfig.ts`)

```typescript
// New parameters for sophisticated mastery calculation
adaptiveLearningFactor: number;
difficultyWeighting: { easy: number; medium: number; hard: number; };
userProfileWeighting: { studyHoursWeight: number; targetYearWeight: number; gradeWeight: number; };
forgettingCurveParams: { initialRetention: number; decayRate: number; reviewBoost: number; };
performanceMetrics: { accuracyWeight: number; speedWeight: number; consistencyWeight: number; improvementWeight: number; };
streamSpecificConfig: { [key in Stream]: { idealTimePerQuestion: number; difficultyMultiplier: number; masteryThresholdAdjustment: number; } };
```

### Enhanced Data Types (`mastery.api.types.ts`)

```typescript
// New interfaces for comprehensive data handling
interface UserProfileData {
  /* User profile information */
}
interface PerformanceTrend {
  /* Performance analysis over time */
}
interface EnhancedMasteryData {
  /* Comprehensive mastery metrics */
}
interface MasteryCalculationContext {
  /* Calculation context */
}
interface HierarchicalMasteryData {
  /* Hierarchical mastery structure */
}
```

### Improved Attempts Processing (`AttemptsProcessor.ts`)

- **User Profile Analysis**: Extracts user study patterns and preferences
- **Performance Trend Analysis**: Calculates improvement rates and consistency
- **Hierarchical Organization**: Handles questions at all hierarchy levels
- **Question Hierarchy Mapping**: Resolves question relationships

### Enhanced Mastery Calculator (`MasteryCalculator.ts`)

The new calculator implements a sophisticated scoring system:

#### Mastery Score Components (100 points total):

1. **Base Accuracy Score** (30%): Basic correctness ratio
2. **Adaptive Streak Bonus** (15%): Streak with user-specific adjustments
3. **Time-based Performance** (10%): Speed vs accuracy balance
4. **Difficulty Mastery** (15%): Weighted by question difficulty
5. **Consistency & Improvement** (10%): Performance trends
6. **Spaced Repetition Effectiveness** (10%): Learning retention
7. **Forgetting Curve Factor** (5%): Time-based decay
8. **User Profile Adaptation** (5%): Personalization factors

#### Strength Index Components (100 points total):

1. **Base Consistency Score** (40%): Overall accuracy
2. **Adaptive Streak Bonus** (15%): User-adjusted streaks
3. **Time Consistency** (15%): Speed consistency
4. **Performance Trend Bonus** (10%): Improvement indicators
5. **User Engagement Factor** (10%): Activity level
6. **Adaptive Decay Penalty** (10%): Time-based forgetting

### Enhanced Mastery Processor (`MasteryProcessor.ts`)

- **Comprehensive Processing**: Handles all hierarchy levels
- **Confidence Calculation**: Determines mastery confidence levels
- **Hierarchical Aggregation**: Proper topic and subject mastery calculation
- **History Tracking**: Maintains mastery evolution over time
- **Error Handling**: Robust error handling and logging

### Improved Mastery Service (`mastery.service.ts`)

- **User Filtering**: Only processes active users with defined streams
- **Concurrency Control**: Parallel processing with limits
- **Performance Optimization**: Reduced batch sizes and better error handling
- **Comprehensive Metrics**: Enhanced metric calculation
- **Detailed Logging**: Better monitoring and debugging

## Key Features

### 1. **Adaptive Learning**

- Adjusts to user's study patterns
- Considers learning pace and consistency
- Personalizes mastery thresholds

### 2. **Forgetting Curve Integration**

- Exponential decay model
- User-specific decay rates
- Review boost mechanisms

### 3. **Difficulty-Aware Scoring**

- Weighted by question difficulty
- Considers difficulty distribution
- Rewards handling harder questions

### 4. **Performance Trend Analysis**

- Tracks improvement over time
- Calculates consistency scores
- Identifies learning patterns

### 5. **Mistake Analysis**

- Categorizes mistake types
- Applies appropriate penalties
- Tracks learning from mistakes

### 6. **Spaced Repetition Effectiveness**

- Measures learning retention
- Tracks repetition patterns
- Rewards effective review strategies

### 7. **Stream-Specific Configurations**

- JEE vs NEET specific settings
- Different time expectations
- Stream-appropriate difficulty adjustments

### 8. **Hierarchical Mastery**

- Proper aggregation from subtopic to topic to subject
- Weighted by topic importance
- Maintains hierarchy integrity

## Performance Improvements

### 1. **Batch Processing**

- Reduced batch size from 100 to 50 users
- Parallel processing with concurrency limits
- Better error isolation

### 2. **Database Optimization**

- Efficient queries with proper indexing
- Batch database operations
- Reduced database round trips

### 3. **Memory Management**

- Streaming data processing
- Proper cleanup of large datasets
- Efficient data structures

### 4. **Error Handling**

- Comprehensive error catching
- Graceful degradation
- Detailed error logging

## Usage Examples

### Process All Users

```typescript
const masteryService = new MasteryService();
await masteryService.processAllUsers();
```

### Process Specific User

```typescript
const result = await masteryService.processUserWithLogging(userId, Stream.JEE);
console.log(`Processing result:`, result);
```

### Get User Mastery Summary

```typescript
const summary = await masteryService.getUserMasterySummary(userId);
console.log(`User mastery summary:`, summary);
```

### Get Hierarchical Mastery

```typescript
const masteryProcessor = new MasteryProcessor();
const hierarchicalData = await masteryProcessor.getHierarchicalMastery(userId);
console.log(`Hierarchical mastery:`, hierarchicalData);
```

## Configuration

The system is highly configurable through the `MasteryConfig` class:

```typescript
// Stream-specific configurations
streamSpecificConfig: {
  [Stream.JEE]: {
    idealTimePerQuestion: 144, // 2.4 minutes
    difficultyMultiplier: 1.2,
    masteryThresholdAdjustment: 0.05,
  },
  [Stream.NEET]: {
    idealTimePerQuestion: 70, // ~1.2 minutes
    difficultyMultiplier: 1.0,
    masteryThresholdAdjustment: 0.0,
  },
}

// Difficulty weighting
difficultyWeighting: {
  easy: 0.8,
  medium: 1.0,
  hard: 1.3,
}

// Forgetting curve parameters
forgettingCurveParams: {
  initialRetention: 0.9,
  decayRate: 0.1,
  reviewBoost: 0.15,
}
```

## Benefits

1. **More Accurate Mastery Assessment**: Considers multiple factors beyond simple accuracy
2. **Personalized Learning**: Adapts to individual user patterns
3. **Better Performance Tracking**: Comprehensive trend analysis
4. **Improved User Experience**: More meaningful mastery levels
5. **Scalable Architecture**: Efficient processing of large user bases
6. **Robust Error Handling**: Graceful handling of edge cases
7. **Comprehensive Logging**: Better monitoring and debugging
8. **Future-Proof Design**: Easy to extend and modify

## Migration Notes

The new system is backward compatible but provides significant improvements:

1. **Existing Data**: All existing mastery data will be preserved
2. **Gradual Rollout**: Can be deployed incrementally
3. **Performance Monitoring**: Enhanced logging for performance tracking
4. **Configuration Management**: Easy to adjust parameters without code changes

## Future Enhancements

1. **Machine Learning Integration**: Could incorporate ML models for better prediction
2. **Real-time Processing**: Could process mastery updates in real-time
3. **Advanced Analytics**: More sophisticated performance analytics
4. **A/B Testing**: Framework for testing different mastery algorithms
5. **External Integrations**: Could integrate with external learning platforms
