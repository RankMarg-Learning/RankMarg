# Adaptive Learning System - Complete Guide

## 📚 Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Configuration](#configuration)
4. [Algorithms](#algorithms)
5. [Rules & Thresholds](#rules--thresholds)
6. [Integration Guide](#integration-guide)
7. [Debugging & Monitoring](#debugging--monitoring)
8. [Best Practices](#best-practices)

---

## Overview

The **Adaptive Learning System** is an intelligent question selection engine that analyzes user performance in real-time and adjusts question difficulty to provide an optimal learning experience. It operates entirely on the frontend, requiring no additional backend requests after the initial question fetch.

### Key Features

- ✅ **Real-time Performance Analysis** - Tracks user performance continuously
- ✅ **Intelligent Question Selection** - Multi-factor scoring algorithm
- ✅ **Dynamic Difficulty Adjustment** - Adapts based on success/failure patterns
- ✅ **Zero Additional API Calls** - All logic runs client-side
- ✅ **Fully Configurable** - All parameters in `adaptiveLearning.ts`
- ✅ **Debug-Friendly** - Comprehensive logging in development mode

---

## How It Works

### 1. Performance Tracking

The system analyzes the **last 5 attempts** (configurable via `PERFORMANCE_WINDOW`) to calculate a performance score:

```typescript
Performance Score = (Correct - Incorrect) / PERFORMANCE_WINDOW
Range: -1 (struggling) to +1 (excelling)
```

**Bonuses & Penalties:**
- **Streak Bonus (+2)**: 3+ consecutive correct answers
- **Streak Penalty (-2)**: 2+ consecutive incorrect answers

### 2. Target Difficulty Calculation

Based on the performance score, the system determines the ideal difficulty level:

```typescript
Target Difficulty = Average Recent Difficulty + Performance Score
Clamped to: [1 (Easy), 4 (Very Hard)]
```

**Examples:**
- **High Performance (0.8)** → Suggest harder questions (difficulty ↑)
- **Low Performance (-0.6)** → Suggest easier questions (difficulty ↓)
- **Moderate Performance (0.2)** → Maintain current level

### 3. Question Selection Algorithm

Each unattempted question is scored based on three factors:

#### Factor 1: Difficulty Match (60% weight)
How well the question's difficulty matches the target difficulty.

```typescript
Score = 1 - |question_difficulty - target_difficulty| / 3
```

#### Factor 2: Proximity (20% weight)
Preference for questions closer in the curriculum sequence.

```typescript
Score = 1 - (question_index - current_index) / total_questions
```

#### Factor 3: Variety (20% weight)
When struggling, prefer different difficulty levels to break patterns.

```typescript
Score = (is_different_difficulty && is_struggling) ? 0.2 * 1.5 : 0
```

**Final Selection:**
The question with the highest combined score is selected.

---

## Configuration

All configuration is in `src/constant/adaptiveLearning.ts`

### Core Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `PERFORMANCE_WINDOW` | 5 | Number of recent attempts to analyze |
| `DIFFICULTY_JUMP_THRESHOLD` | 3 | Consecutive correct to increase difficulty |
| `DIFFICULTY_DROP_THRESHOLD` | 2 | Consecutive wrong to decrease difficulty |
| `PERFORMANCE_BOOST_THRESHOLD` | 0.6 | Score needed to increase difficulty |
| `PERFORMANCE_DROP_THRESHOLD` | -0.4 | Score that triggers easier questions |

### Selection Weights

```typescript
SELECTION_WEIGHTS = {
  DIFFICULTY_MATCH: 0.6,  // 60% - How well difficulty matches
  PROXIMITY: 0.2,         // 20% - Preference for nearby questions
  VARIETY: 0.2,           // 20% - Different approach when stuck
}
```

### Adaptive Rules

```typescript
ADAPTIVE_RULES = {
  MAX_DIFFICULTY_JUMP: 2,           // Max difficulty increase per step
  STUCK_THRESHOLD: 3,               // Consecutive failures = stuck
  VARIETY_BOOST_WHEN_STUCK: 1.5,    // Boost variety when stuck
  MIN_DIFFICULTY: 1,                // Minimum difficulty level
  MAX_DIFFICULTY: 4,                // Maximum difficulty level
}
```

---

## Algorithms

### Algorithm 1: Performance Calculation

```typescript
function calculatePerformanceScore(attempts) {
  let score = 0;
  let consecutiveCorrect = 0;
  let consecutiveWrong = 0;
  
  attempts.slice(-PERFORMANCE_WINDOW).forEach(attempt => {
    if (attempt.isCorrect) {
      score += CORRECT_ANSWER_POINTS;  // +1
      consecutiveCorrect++;
      consecutiveWrong = 0;
    } else {
      score += WRONG_ANSWER_POINTS;    // -1
      consecutiveWrong++;
      consecutiveCorrect = 0;
    }
  });
  
  // Apply streak bonuses/penalties
  if (consecutiveCorrect >= DIFFICULTY_JUMP_THRESHOLD) {
    score += STREAK_BONUS;  // +2
  }
  if (consecutiveWrong >= DIFFICULTY_DROP_THRESHOLD) {
    score += STREAK_PENALTY;  // -2
  }
  
  // Normalize to [-1, 1]
  return clamp(score / PERFORMANCE_WINDOW, -1, 1);
}
```

### Algorithm 2: Target Difficulty

```typescript
function getTargetDifficulty(attempts) {
  const performanceScore = calculatePerformanceScore(attempts);
  const avgDifficulty = average(attempts.map(a => a.difficulty));
  
  let target = avgDifficulty + performanceScore;
  
  // Limit max jump
  if (Math.abs(target - avgDifficulty) > MAX_DIFFICULTY_JUMP) {
    target = avgDifficulty + sign(performanceScore) * MAX_DIFFICULTY_JUMP;
  }
  
  return clamp(round(target), MIN_DIFFICULTY, MAX_DIFFICULTY);
}
```

### Algorithm 3: Question Selection

```typescript
function selectNextQuestion(questions, targetDifficulty, currentIndex) {
  const unattempted = questions.filter(q => !q.attempted && q.index > currentIndex);
  
  const scored = unattempted.map(q => {
    const difficultyMatch = 1 - Math.abs(q.difficulty - targetDifficulty) / 3;
    const proximity = 1 - (q.index - currentIndex) / questions.length;
    const variety = isStuck && q.difficulty !== lastDifficulty ? 0.2 * 1.5 : 0;
    
    return {
      question: q,
      score: (difficultyMatch * 0.6) + (proximity * 0.2) + (variety * 0.2)
    };
  });
  
  return scored.sort((a, b) => b.score - a.score)[0].question;
}
```

---

## Rules & Thresholds

### Learning Patterns

#### 1. Excelling Pattern 🎯
**Conditions:**
- Performance Score ≥ 0.6
- 3+ consecutive correct answers

**Action:**
- Increase difficulty by 1 level
- Suggest harder questions
- Maintain challenge

#### 2. Struggling Pattern 📉
**Conditions:**
- Performance Score ≤ -0.4
- 2+ consecutive wrong answers

**Action:**
- Decrease difficulty by 1 level
- Suggest easier questions
- Build confidence

#### 3. Stuck Pattern 🔄
**Conditions:**
- Performance Score ≤ -0.5
- 3+ failures at same difficulty

**Action:**
- Introduce variety
- Try different question types
- Change approach

#### 4. Steady Pattern ⚖️
**Conditions:**
- Performance Score between -0.4 and 0.6
- Mixed correct/incorrect

**Action:**
- Maintain current difficulty
- Continue steady progression

---

## Integration Guide

### Step 1: Import Constants

```typescript
import {
  PERFORMANCE_WINDOW,
  DIFFICULTY_JUMP_THRESHOLD,
  SELECTION_WEIGHTS,
  getDifficultyLabel,
  getDifficultyColor,
} from '@/constant/adaptiveLearning';
```

### Step 2: Implement Performance Tracking

```typescript
const calculatePerformanceScore = useCallback(() => {
  const recentAttempts = attempts.slice(-PERFORMANCE_WINDOW);
  // ... implementation
}, [attempts]);
```

### Step 3: Use Adaptive Selection

```typescript
const getAdaptiveNextQuestion = useCallback(() => {
  const targetDifficulty = getTargetDifficulty();
  const candidates = questions.filter(q => !q.attempted);
  
  // Score each candidate
  const scored = candidates.map(q => ({
    question: q,
    score: calculateQuestionScore(q, targetDifficulty)
  }));
  
  return scored.sort((a, b) => b.score - a.score)[0];
}, [questions]);
```

### Step 4: Add UI Elements

```typescript
const renderDifficultyIndicator = () => (
  <div className={cn("badge", getDifficultyColor(targetDifficulty))}>
    {getDifficultyLabel(targetDifficulty)}
  </div>
);
```

---

## Debugging & Monitoring

### Enable Debug Mode

In `adaptiveLearning.ts`:

```typescript
export const DEBUG_MODE = true; // Enable in development
```

### Log Levels

```typescript
export const LOG_LEVELS = {
  PERFORMANCE: true,  // Log performance calculations
  SELECTION: true,    // Log question selection decisions
  NAVIGATION: true,   // Log navigation events
  SCORING: true,      // Log individual question scores
};
```

### Console Output Examples

**Performance Logging:**
```
[Adaptive Learning] Performance: {
  score: 0.6,
  consecutiveCorrect: 3,
  consecutiveWrong: 0,
  recentAttempts: 5
}
```

**Selection Logging:**
```
[Adaptive Learning] Target Difficulty: {
  avgDifficulty: 2,
  performanceScore: 0.6,
  targetDifficulty: 3
}
```

**Scoring Logging:**
```
[Adaptive Learning] Question Selection: {
  targetDifficulty: 3,
  selectedDifficulty: 3,
  score: 0.85,
  isStuck: false,
  totalCandidates: 12
}
```

---

## Best Practices

### 1. Tuning for Different Audiences

**For Competitive Exam Prep (JEE/NEET):**
```typescript
PERFORMANCE_WINDOW = 5
DIFFICULTY_JUMP_THRESHOLD = 3
DIFFICULTY_DROP_THRESHOLD = 2
```

**For Learning/Practice:**
```typescript
PERFORMANCE_WINDOW = 8  // More stable
DIFFICULTY_JUMP_THRESHOLD = 4  // Slower progression
DIFFICULTY_DROP_THRESHOLD = 2
```

**For Quick Assessment:**
```typescript
PERFORMANCE_WINDOW = 3  // Fast adaptation
DIFFICULTY_JUMP_THRESHOLD = 2
DIFFICULTY_DROP_THRESHOLD = 1
```

### 2. Balancing Factors

**Focus on Accuracy:**
```typescript
SELECTION_WEIGHTS = {
  DIFFICULTY_MATCH: 0.8,  // Strong difficulty matching
  PROXIMITY: 0.1,
  VARIETY: 0.1,
}
```

**Focus on Curriculum Flow:**
```typescript
SELECTION_WEIGHTS = {
  DIFFICULTY_MATCH: 0.5,
  PROXIMITY: 0.4,  // Follow sequence
  VARIETY: 0.1,
}
```

**Focus on Exploration:**
```typescript
SELECTION_WEIGHTS = {
  DIFFICULTY_MATCH: 0.5,
  PROXIMITY: 0.1,
  VARIETY: 0.4,  // Try different approaches
}
```

### 3. Performance Optimization

- Use `useMemo` for expensive calculations
- Cache performance scores between renders
- Debounce rapid state changes
- Limit log output in production

### 4. User Experience

- Show difficulty level indicator
- Provide "Smart Next" button prominently
- Include manual navigation options
- Show progress/streak indicators
- Celebrate achievements (streaks, difficulty ups)

---

## Testing Scenarios

### Scenario 1: New User
**Expected:** Start with medium difficulty (2), observe performance

### Scenario 2: Excelling User
**Inputs:** 5 consecutive correct answers
**Expected:** 
- Performance Score → 1.0
- Target Difficulty → 4 (Very Hard)
- Suggest hardest available questions

### Scenario 3: Struggling User
**Inputs:** 3 consecutive incorrect answers
**Expected:**
- Performance Score → -0.8
- Target Difficulty → 1 (Easy)
- Suggest easiest available questions

### Scenario 4: Stuck User
**Inputs:** Same difficulty, repeated failures
**Expected:**
- Variety boost activated
- Suggest different difficulty level
- Help break the pattern

---

## API Reference

### Helper Functions

#### `getDifficultyLabel(difficulty: number): string`
Returns human-readable difficulty label.

```typescript
getDifficultyLabel(1) // "Easy"
getDifficultyLabel(2) // "Medium"
getDifficultyLabel(3) // "Hard"
getDifficultyLabel(4) // "Very Hard"
```

#### `getDifficultyColor(difficulty: number): string`
Returns Tailwind CSS color class.

```typescript
getDifficultyColor(1) // "text-green-600"
getDifficultyColor(2) // "text-blue-600"
getDifficultyColor(3) // "text-orange-600"
getDifficultyColor(4) // "text-red-600"
```

#### `identifyLearningPattern(score, correct, wrong): Pattern`
Identifies current learning pattern.

```typescript
identifyLearningPattern(0.8, 4, 0) // "EXCELLING"
identifyLearningPattern(-0.6, 0, 3) // "STRUGGLING"
```

#### `calculateDifficultyAdjustment(score): number`
Returns difficulty adjustment (+1, 0, or -1).

---

## Troubleshooting

### Issue: Difficulty changes too quickly
**Solution:** Increase `PERFORMANCE_WINDOW` or reduce `STREAK_BONUS`

### Issue: System stuck on one difficulty
**Solution:** Adjust `DIFFICULTY_JUMP_THRESHOLD` or `PERFORMANCE_BOOST_THRESHOLD`

### Issue: Not enough variety
**Solution:** Increase `SELECTION_WEIGHTS.VARIETY` or reduce `STUCK_THRESHOLD`

### Issue: Questions seem random
**Solution:** Increase `SELECTION_WEIGHTS.DIFFICULTY_MATCH` and `PROXIMITY`

---

## Future Enhancements

- [ ] Topic-specific difficulty weights
- [ ] Time-based performance factors
- [ ] Historical performance tracking
- [ ] Collaborative filtering recommendations
- [ ] A/B testing framework
- [ ] Machine learning integration
- [ ] Personalized learning paths

---

## Support

For questions or issues:
- Check debug logs with `DEBUG_MODE = true`
- Review this documentation
- Contact: dev@rankmarg.com

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Maintained By:** RankMarg Development Team

