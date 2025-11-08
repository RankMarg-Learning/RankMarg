# Adaptive Learning System - Quick Reference Cheatsheet

## 🎯 Quick Decision Tree

```
User Answer Correct?
├─ YES
│  ├─ 3+ in a row? → Increase Difficulty (+1)
│  └─ < 3 in a row → Maintain Level
│
└─ NO
   ├─ 2+ in a row? → Decrease Difficulty (-1)
   └─ < 2 in a row → Maintain Level
```

---

## 📊 Performance Score Guide

| Score Range | Status | Action | Difficulty Change |
|-------------|--------|--------|-------------------|
| 0.6 to 1.0 | 🎯 Excelling | Challenge more | ↑ Increase |
| 0.0 to 0.6 | ⚖️ Steady | Maintain | → Same |
| -0.4 to 0.0 | ⚖️ Steady | Maintain | → Same |
| -1.0 to -0.4 | 📉 Struggling | Support needed | ↓ Decrease |

---

## 🎲 Difficulty Levels

| Level | Name | Color | When to Use |
|-------|------|-------|-------------|
| 1 | Easy | 🟢 Green | Struggling users, confidence building |
| 2 | Medium | 🔵 Blue | Average performance, steady learning |
| 3 | Hard | 🟠 Orange | Excelling users, challenge needed |
| 4 | Very Hard | 🔴 Red | Top performers, maximum challenge |

---

## ⚙️ Key Constants (Quick Reference)

```typescript
// Performance Analysis
PERFORMANCE_WINDOW = 5              // Analyze last 5 attempts

// Streak Thresholds
DIFFICULTY_JUMP_THRESHOLD = 3       // 3 correct → harder
DIFFICULTY_DROP_THRESHOLD = 2       // 2 wrong → easier

// Performance Thresholds
PERFORMANCE_BOOST_THRESHOLD = 0.6   // Above = increase difficulty
PERFORMANCE_DROP_THRESHOLD = -0.4   // Below = decrease difficulty

// Selection Weights
DIFFICULTY_MATCH = 60%              // Match to target level
PROXIMITY = 20%                     // Nearby in sequence
VARIETY = 20%                       // Different when stuck
```

---

## 🔢 Scoring Formula

```typescript
// Step 1: Base Performance Score
score = (correct_count - wrong_count) / 5

// Step 2: Add Streak Bonuses
if (consecutive_correct >= 3) score += 2
if (consecutive_wrong >= 2) score -= 2

// Step 3: Normalize
final_score = clamp(score, -1, 1)
```

---

## 🎯 Question Selection Algorithm

```typescript
// For each unattempted question, calculate:

difficulty_score = 1 - |question_diff - target_diff| / 3
proximity_score = 1 - (question_index - current_index) / total
variety_score = is_stuck && different_diff ? 0.3 : 0

total_score = (difficulty_score × 0.6) + 
              (proximity_score × 0.2) + 
              (variety_score × 0.2)

// Select highest scoring question
```

---

## 🐛 Debug Quick Commands

```typescript
// In adaptiveLearning.ts
DEBUG_MODE = true                    // Enable all logging

// Check specific logs
LOG_LEVELS = {
  PERFORMANCE: true,                 // Performance calculations
  SELECTION: true,                   // Question selection
  SCORING: true,                     // Individual scores
}
```

---

## 🔧 Common Adjustments

### Make it Easier to Level Up
```typescript
DIFFICULTY_JUMP_THRESHOLD = 2       // Was 3
PERFORMANCE_BOOST_THRESHOLD = 0.4   // Was 0.6
```

### Make it Slower to Level Down
```typescript
DIFFICULTY_DROP_THRESHOLD = 3       // Was 2
PERFORMANCE_DROP_THRESHOLD = -0.6   // Was -0.4
```

### More Variety for Stuck Users
```typescript
SELECTION_WEIGHTS = {
  DIFFICULTY_MATCH: 0.5,            // Was 0.6
  PROXIMITY: 0.1,                   // Was 0.2
  VARIETY: 0.4,                     // Was 0.2 (doubled!)
}
```

### Faster Adaptation
```typescript
PERFORMANCE_WINDOW = 3              // Was 5
```

### Slower/Stable Adaptation
```typescript
PERFORMANCE_WINDOW = 8              // Was 5
```

---

## 📱 UI Integration Examples

### Show Difficulty Badge
```typescript
import { getDifficultyLabel, getDifficultyColor } from '@/constant/adaptiveLearning';

<span className={getDifficultyColor(difficulty)}>
  {getDifficultyLabel(difficulty)}
</span>
```

### Smart Next Button
```typescript
const nextIndex = getAdaptiveNextQuestion();
if (nextIndex !== null) {
  setCurrentQuestionIndex(nextIndex);
}
```

### Performance Indicator
```typescript
const score = calculatePerformanceScore();
const status = score > 0.6 ? "Excelling" : 
               score > 0 ? "Steady" : 
               score > -0.4 ? "Steady" : "Struggling";
```

---

## 🎓 Learning Patterns at a Glance

```
EXCELLING (⭐)
├─ Performance: > 0.6
├─ Streak: 3+ correct
└─ Action: Increase difficulty

STRUGGLING (📉)
├─ Performance: < -0.4
├─ Streak: 2+ wrong
└─ Action: Decrease difficulty

STUCK (🔄)
├─ Performance: < -0.5
├─ Same errors: 3+
└─ Action: Try variety

STEADY (⚖️)
├─ Performance: -0.4 to 0.6
├─ Mixed results
└─ Action: Maintain level
```

---

## ⚡ Performance Tips

```typescript
// ✅ DO
const score = useMemo(() => calculateScore(), [deps]);
const target = useCallback(() => getTarget(), [deps]);

// ❌ DON'T
const score = calculateScore(); // Recalculates every render
```

---

## 🧪 Test Scenarios

```typescript
// Test 1: Excelling User
answers: [✓, ✓, ✓, ✓, ✓]
expected: difficulty = 4 (Very Hard)

// Test 2: Struggling User
answers: [✗, ✗, ✗]
expected: difficulty = 1 (Easy)

// Test 3: Mixed Performance
answers: [✓, ✗, ✓, ✗, ✓]
expected: difficulty = 2 (Medium, stable)

// Test 4: Stuck User
answers: [✗, ✗, ✗, ✗] (all same difficulty)
expected: variety boost activated
```

---

## 📞 Quick Help

**Problem:** Too fast difficulty changes  
**Fix:** Increase `PERFORMANCE_WINDOW`

**Problem:** Not challenging enough  
**Fix:** Decrease `DIFFICULTY_JUMP_THRESHOLD`

**Problem:** Too challenging  
**Fix:** Increase `DIFFICULTY_DROP_THRESHOLD`

**Problem:** Boring/repetitive  
**Fix:** Increase `VARIETY` weight

---

## 🔗 File Locations

```
src/
  constant/
    ├─ adaptiveLearning.ts           # All constants & config
    ├─ ADAPTIVE_LEARNING_README.md   # Full documentation
    └─ ADAPTIVE_LEARNING_CHEATSHEET.md # This file
  
  components/
    └─ AiTopicQuestionSession.tsx    # Implementation
```

---

## 💡 Remember

1. **Performance Window** = How many attempts to look back
2. **Thresholds** = When to change difficulty
3. **Weights** = How important each factor is
4. **Debug Mode** = Your best friend during development

---

**Print this out and keep it handy! 🖨️**

