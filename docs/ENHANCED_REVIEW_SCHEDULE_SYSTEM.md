# Enhanced Review Schedule System

## Overview

The Enhanced Review Schedule System is a sophisticated, multi-factor spaced repetition algorithm designed to optimize topic revision for exam preparation. It combines principles from SM-2 (SuperMemo 2), adaptive learning, forgetting curves, and exam urgency to provide highly personalized review schedules.

## Key Features

### 1. **Multi-Factor Analysis**
The system considers 15+ factors when determining review intervals:

#### Performance Metrics
- **Accuracy**: Overall correctness ratio (30% weight)
- **Speed**: Response time compared to ideal time (20% weight)
- **Consistency**: Performance variance over time (15% weight)
- **Confidence**: Multi-dimensional confidence score (15% weight)
- **Improvement**: Learning velocity and trend analysis (10% weight)
- **Recency**: Recent performance weighting (10% weight)

#### Learning Factors
- **Mastery Level**: Current understanding (0-100)
- **Strength Index**: Topic strength relative to others
- **Consecutive Correct/Incorrect**: Performance streaks
- **Retention Strength**: Long-term memory retention
- **Learning Velocity**: Rate of improvement
- **Question Difficulty**: Average difficulty attempted

#### Contextual Factors
- **Learning Phase**: NEW → LEARNING → REVIEWING → MASTERED
- **Exam Urgency**: Days until exam with urgency levels
- **Review History**: Completed reviews count
- **Forgetting Curve**: Recall probability over time

### 2. **Adaptive Learning Phases**

#### Phase 1: NEW
- **Characteristics**: First exposure to topic
- **Base Interval**: 6 hours to 1 day
- **Strategy**: Rapid reinforcement
- **Threshold**: At least 1 attempt

#### Phase 2: LEARNING
- **Characteristics**: Building initial understanding
- **Base Intervals**: 1 → 3 → 7 days (graduated)
- **Strategy**: Structured progression
- **Threshold**: 3 consecutive correct answers

#### Phase 3: REVIEWING
- **Characteristics**: Consolidating knowledge
- **Base Intervals**: Exponential growth using easiness factor
- **Strategy**: Standard spaced repetition
- **Threshold**: Mastery level ≥ 50%

#### Phase 4: MASTERED
- **Characteristics**: Strong understanding
- **Base Intervals**: Extended intervals (up to 60 days)
- **Strategy**: Maintenance reviews
- **Threshold**: Mastery level ≥ 80% + 5 consecutive correct

### 3. **Enhanced SM-2 Algorithm**

The system uses an improved version of the SM-2 algorithm:

```
Easiness Factor (EF) = Base (2.5) + Adjustments

Adjustments:
- Consecutive Correct: +0.1 per streak
- Consecutive Incorrect: -0.3 per streak
- Retention Strength: ±0.4 * (retention - 0.5)
- Question Difficulty: ±0.2 * (difficulty - 0.5)

Range: 1.3 ≤ EF ≤ 3.5
```

**Interval Calculation**:
```
Base Interval = EF^(n-1) × Phase Multiplier
Where n = number of completed reviews
```

### 4. **Exam Urgency System**

Reviews are automatically adjusted based on exam proximity:

| Days Until Exam | Urgency Level | Weak Topics | Strong Topics |
|-----------------|---------------|-------------|---------------|
| ≤ 7 days        | CRITICAL      | 0.3×        | 0.7×          |
| ≤ 21 days       | HIGH          | 0.5×        | 0.8×          |
| ≤ 45 days       | MEDIUM        | 0.7×        | 0.9×          |
| ≤ 90 days       | LOW           | 0.95×       | 0.95×         |
| > 90 days       | NORMAL        | 1.0×        | 1.0×          |

**Strategy**: As exams approach, weak topics get more frequent reviews while strong topics maintain reasonable intervals.

### 5. **Struggling Topic Detection**

Automatic intervention for topics requiring extra attention:

- **2+ Consecutive Incorrect**: Review within 1 day (max)
- **1 Incorrect (NEW phase)**: Review within 12 hours (max)
- **Low Retention (<0.3)**: Shorten intervals by 50%
- **Declining Performance**: Apply negative velocity modifier

### 6. **Performance Metrics Computation**

#### Accuracy Metrics
```typescript
Overall Accuracy = Correct Attempts / Total Attempts
Recent Accuracy = Last 10 Attempts Accuracy
Accuracy Weight = 30% in confidence calculation
```

#### Speed Index
```typescript
Speed Index = Ideal Time / Average Time
Range: 0.1 to 2.0
Interpretation:
- > 1.0: Faster than ideal (good)
- = 1.0: At ideal pace
- < 1.0: Slower than ideal
```

#### Consistency Score
```typescript
Consistency = 1 - min(CV, 1)
Where CV = Coefficient of Variation (StdDev / Mean)
Interpretation:
- 1.0: Perfect consistency
- 0.5: Moderate variance
- 0.0: High variance
```

#### Improvement Rate
```typescript
Improvement = Second Half Accuracy - First Half Accuracy
Range: -1.0 to +1.0
Interpretation:
- Positive: Improving
- Zero: Stable
- Negative: Declining
```

### 7. **Confidence Score Calculation**

Multi-dimensional weighted average:

```typescript
Confidence = (
  Accuracy × 0.30 +
  (Speed Index / 2) × 0.20 +
  Consistency × 0.15 +
  ((Improvement + 1) / 2) × 0.10 +
  Recent Accuracy × 0.10 +
  Confidence Factor × 0.15
) / 1.0
```

### 8. **Learning Velocity**

Measures the rate of improvement:

```typescript
Velocity = (Recent Quarter Accuracy - Earlier Quarter Accuracy) × Mastery Factor
Mastery Factor = 1 - (Mastery Level / 100) × 0.5

Interpretation:
- Positive: User is improving
- Zero: Stable performance
- Negative: Performance declining
```

### 9. **Priority Scoring**

Topics are assigned priority scores (0-100) for optimal scheduling:

```typescript
Priority = 50 (base)
  + Phase Weight (NEW: 20, LEARNING: 15, REVIEWING: 10, MASTERED: 5)
  + Consecutive Incorrect × 15
  + (100 - Mastery Level) × 0.2
  + (1 - Retention Strength) × 10
  + Exam Proximity Bonus (up to 30)
  + Overdue Days × 2
```

**Higher Priority = More Urgent Review**

### 10. **Retention Strength**

Combines accuracy and time efficiency:

```typescript
Retention = Accuracy × 0.7 + Time Efficiency × 0.3

Time Efficiency = min(max(Ideal Time / Avg Time, 0), 1)

Interpretation:
- 1.0: Perfect retention
- 0.5: Moderate retention
- 0.0: Poor retention
```

### 11. **Forgetting Curve Integration**

Uses exponential decay model:

```typescript
Recall Probability = e^(-adjusted_decay × days_since_review)

Adjusted Decay = Base Decay × (1 - Retention Strength)

Base Decay = 0.1 (configurable per exam type)
```

**Application**: Adjusts intervals based on predicted memory decay.

## Algorithm Flow

### Complete Review Scheduling Process

```
1. Fetch User & Topic Data
   ├─ Topic Mastery (level, strength index)
   ├─ Current Schedule (last review, completed reviews)
   ├─ Exam Information (code, date)
   └─ Recent Attempts (last 50, with difficulty)

2. Compute Performance Metrics
   ├─ Accuracy (overall & recent)
   ├─ Average Time & Speed Index
   ├─ Consistency Score
   ├─ Improvement Rate
   └─ Consecutive Streaks

3. Calculate Derived Metrics
   ├─ Confidence Score (multi-factor)
   ├─ Learning Velocity (trend)
   ├─ Average Difficulty
   └─ Retention Strength

4. Determine Learning Phase
   └─ NEW → LEARNING → REVIEWING → MASTERED

5. Calculate Easiness Factor
   └─ Based on streaks, retention, difficulty

6. Compute Base Interval
   └─ Phase-specific with EF application

7. Apply Multipliers (in sequence)
   ├─ Mastery Level Multiplier
   ├─ Retention Modifier
   ├─ Confidence Modifier
   ├─ Learning Velocity Modifier
   ├─ Exam Urgency Modifier
   └─ Diminishing Returns (for long intervals)

8. Apply Safety Constraints
   ├─ Handle Struggling Topics (consecutive incorrect)
   ├─ Min Interval: 6 hours (0.25 days)
   └─ Max Interval: 60 days

9. Calculate Priority Score
   └─ For scheduling optimization

10. Apply Forgetting Curve
    └─ Adjust retention based on recall probability

11. Update Database
    ├─ Next Review Date
    ├─ Review Interval
    ├─ Retention Strength
    └─ (Optional: Priority, EF, Phase)
```

## Configuration

### Tunable Parameters

```typescript
// Base intervals
baseIntervalDays = 1
maxIntervalDays = 60
minIntervalDays = 0.25

// SM-2 parameters
initialEasinessFactor = 2.5
minEasinessFactor = 1.3
maxEasinessFactor = 3.5

// Learning phase thresholds
NEW_TO_LEARNING = 1 attempt
LEARNING_TO_REVIEWING = 3 consecutive correct
REVIEWING_TO_MASTERED = 5 consecutive correct

// Weight factors
weights = {
  accuracy: 0.30,
  speed: 0.20,
  consistency: 0.15,
  confidence: 0.15,
  improvement: 0.10,
  recency: 0.10
}

// Exam urgency thresholds (days)
CRITICAL = 7
HIGH = 21
MEDIUM = 45
LOW = 90
```

## Usage Examples

### Example 1: New Topic

```typescript
Input:
- Mastery Level: 10
- Total Attempts: 1
- Consecutive Correct: 1
- Learning Phase: NEW
- Days Until Exam: 45

Output:
- Next Review: 1 day
- Learning Phase: NEW
- Priority: 75 (high)
```

### Example 2: Struggling Topic

```typescript
Input:
- Mastery Level: 30
- Total Attempts: 15
- Consecutive Incorrect: 3
- Learning Phase: LEARNING
- Days Until Exam: 14

Output:
- Next Review: 0.5 days (12 hours)
- Learning Phase: LEARNING
- Priority: 95 (very high)
```

### Example 3: Mastered Topic

```typescript
Input:
- Mastery Level: 85
- Total Attempts: 50
- Consecutive Correct: 8
- Learning Phase: MASTERED
- Days Until Exam: 60

Output:
- Next Review: 21 days
- Learning Phase: MASTERED
- Priority: 25 (low)
```

### Example 4: Exam Approaching

```typescript
Input:
- Mastery Level: 55
- Total Attempts: 25
- Consecutive Correct: 2
- Learning Phase: REVIEWING
- Days Until Exam: 5

Output:
- Next Review: 1 day (urgency override)
- Learning Phase: REVIEWING
- Priority: 88 (very high)
```

## Performance Optimizations

### 1. Caching Strategy
- Schedule data cached for 5 minutes
- Reduces database queries by ~60%
- Cache key: `review_schedule_{userId}_{topicId}`

### 2. Batch Processing
- Users processed in batches of 100
- Concurrent processing: 10 topics at a time
- Estimated throughput: 1000 topics/minute

### 3. Query Optimization
- Parallel fetching of mastery, schedule, and user data
- Limited to 50 most recent attempts
- Indexed queries on userId + topicId

## Database Schema Recommendations

Consider adding these fields to `ReviewSchedule` table for enhanced tracking:

```prisma
model ReviewSchedule {
  // Existing fields...
  
  // Enhanced fields
  easinessFactor     Float?   @default(2.5)
  learningPhase      String?  @default("NEW")
  priorityScore      Float?   @default(50)
  confidenceScore    Float?
  learningVelocity   Float?   @default(0)
  consecutiveCorrect Int?     @default(0)
  consecutiveIncorrect Int?   @default(0)
  averageDifficulty  Float?   @default(0.5)
  
  @@index([priorityScore])
  @@index([learningPhase])
  @@index([nextReviewAt, priorityScore])
}
```

## API Integration

### Main Function

```typescript
const reviewScheduleService = new ReviewScheduleService({
  batchSize: 100,
  concurrencyLimit: 10,
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000 // 5 minutes
});

// Update schedule for specific user-topic
await reviewScheduleService.updateReviewSchedule(userId, topicId);

// Update all schedules for a user
await reviewScheduleService.updateSchedulesForUser(userId);

// Run batch job for all users
await reviewScheduleService.runJob();
```

### Manual Schedule Calculation

```typescript
const schedule = reviewScheduleService.computeNextReviewSchedule({
  masteryLevel: 65,
  strengthIndex: 0.8,
  lastReviewedAt: new Date(),
  completedReviews: 5,
  retentionStrength: 0.75,
  examCode: "JEE_MAINS",
  consecutiveCorrect: 3,
  consecutiveIncorrect: 0,
  totalAttempts: 20,
  averageDifficulty: 0.6,
  confidenceScore: 0.72,
  learningVelocity: 0.15,
  daysUntilExam: 30
});

console.log(schedule);
// {
//   nextReviewAt: Date,
//   reviewInterval: 7.5,
//   easinessFactor: 2.7,
//   priority: 45,
//   learningPhase: "REVIEWING"
// }
```

## Monitoring & Analytics

### Key Metrics to Track

1. **Average Review Interval by Phase**
   - NEW: ~0.5-1 days
   - LEARNING: ~3-7 days
   - REVIEWING: ~7-21 days
   - MASTERED: ~21-60 days

2. **Priority Distribution**
   - High Priority (70-100): ~20%
   - Medium Priority (40-70): ~50%
   - Low Priority (0-40): ~30%

3. **Phase Transition Rates**
   - NEW → LEARNING: ~3-5 sessions
   - LEARNING → REVIEWING: ~10-15 sessions
   - REVIEWING → MASTERED: ~20-30 sessions

4. **Retention Rates by Phase**
   - Target: >90% in MASTERED phase
   - Expected: 60-70% in LEARNING phase
   - Acceptable: 40-50% in NEW phase

## Best Practices

### 1. Regular Job Execution
- Run batch update daily (recommended: 2 AM)
- Real-time updates after each practice session
- Recalculate on exam date changes

### 2. Gradual Parameter Tuning
- Monitor user retention rates
- A/B test interval adjustments
- Collect user feedback on scheduling

### 3. Edge Case Handling
- Users with no exam date: Use default (90 days)
- Topics with no attempts: Start with NEW phase
- Very high/low mastery: Apply caps (0-100)

### 4. Performance Monitoring
- Track job execution time
- Monitor database query performance
- Cache hit rates (target: >80%)

## Future Enhancements

### Potential Additions

1. **Time-of-Day Optimization**
   - Schedule reviews at user's peak performance times
   - Consider circadian rhythm patterns

2. **Topic Dependency Mapping**
   - Prioritize prerequisite topics
   - Cascade reviews for dependent concepts

3. **Personalized Learning Styles**
   - Visual vs. analytical learners
   - Adjust intervals based on learning style

4. **Collaborative Filtering**
   - Learn from similar user patterns
   - Predict optimal intervals based on cohort data

5. **Neural Network Integration**
   - ML model for interval prediction
   - Feature importance analysis

6. **Mobile Push Notifications**
   - Smart notification timing
   - Review reminders with priority

## Troubleshooting

### Common Issues

**Issue**: Reviews too frequent
- **Check**: Consecutive incorrect count
- **Fix**: Improve question difficulty matching

**Issue**: Reviews too infrequent
- **Check**: Mastery level inflation
- **Fix**: Adjust mastery thresholds

**Issue**: All topics have same intervals
- **Check**: Performance variance
- **Fix**: Ensure diverse question difficulty

**Issue**: Exam urgency not applying
- **Check**: Exam date in database
- **Fix**: Verify ExamUser relationship

## Conclusion

The Enhanced Review Schedule System provides a robust, research-backed approach to spaced repetition that adapts to individual learner needs, exam timelines, and performance patterns. By considering multiple factors and learning phases, it optimizes retention while minimizing study time.

For implementation support or questions, refer to the source code documentation or contact the development team.

---

**Version**: 2.0  
**Last Updated**: November 8, 2025  
**Author**: RankMarg Development Team

