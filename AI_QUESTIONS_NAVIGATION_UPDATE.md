# AI Questions Navigation Update - Previous Button History

## Overview
Enhanced the AI question-solving system to show the last 10 attempted questions when navigating backwards. Users can now review their previous attempts with their selected answers highlighted.

## What Changed

### Backend Updates

#### Modified `getQuestionsForSession` Method
**File:** `apps/backend/src/controllers/aiQuestion.controller.ts`

The session endpoint now returns:
- **Last 10 attempted questions** (with full attempt details)
- **All unattempted questions** (for new practice)
- Questions are ordered: Attempted questions first (oldest to newest) → Unattempted questions

**Response Structure:**
```typescript
{
  questions: [
    {
      question: { /* full question details */ },
      attempt: {
        id: string,
        answer: string,
        questionId: string,
        status: "CORRECT" | "INCORRECT",
        timing: number,
        mistake: string | null,
        hintsUsed: boolean,
        solvedAt: Date
      } | null
    }
  ],
  metadata: {
    topicName: string,
    subjectName: string,
    userGrade: string,
    difficultyRange: { min: number, max: number },
    totalQuestions: number,
    attemptedCount: number,
    unattemptedCount: number
  }
}
```

### Frontend Updates

#### Enhanced `AiTopicQuestionSession` Component
**File:** `apps/frontend/src/components/AiTopicQuestionSession.tsx`

**Key Changes:**

1. **Data Structure Handling**
   - Questions now come with their attempts attached
   - Component handles both attempted and unattempted questions seamlessly

2. **Smart Navigation**
   - Previous button shows last attempted questions with answers
   - Next button moves through all questions (attempted + unattempted)
   - "Skip to Next Unattempted" button intelligently skips reviewed questions

3. **Visual Indicators**
   - Blue banner shows when reviewing previous attempts
   - Displays attempt number (e.g., "📝 Reviewing Previous Attempt #3")
   - Shows attempt result: ✓ Correct or ✗ Incorrect

4. **Answer Highlighting**
   - User's selected answers are automatically shown
   - Correct answers are highlighted in green
   - Incorrect answers are highlighted in red (via QuestionUI)
   - Solution is automatically displayed for attempted questions

5. **Progress Tracking**
   - Progress bar accounts for both local and server attempts
   - Counter shows correct number of attempted/total questions

## User Experience Flow

### Scenario: User Solves 3 Questions, Then Clicks Previous

1. **Question 1** → User answers → Correct ✓
2. **Question 2** → User answers → Incorrect ✗
3. **Question 3** → User answers → Correct ✓
4. **User clicks Previous** → Shows Question 2 with:
   - Banner: "📝 Reviewing Previous Attempt #2 ✗ Incorrect"
   - User's selected answer highlighted
   - Correct answer shown in green
   - Full solution visible
5. **User clicks Previous** → Shows Question 1 with attempt #1
6. **User clicks Next** → Back to Question 2 (review)
7. **User clicks Next** → Back to Question 3 (review)
8. **User clicks Next** → Question 4 (new/unattempted)

### Navigation Features

- **Previous Button:** 
  - Navigate back through attempted questions
  - See your exact answers and whether they were correct
  - Review solutions and strategies

- **Next Button:**
  - Move forward through all questions
  - Seamlessly switch between reviewed and new questions

- **Skip to Next Unattempted:**
  - Jump directly to next new question
  - Skip all reviewed/attempted questions

## Technical Details

### Question Ordering
```
[Oldest Attempted] → [Newer Attempted] → ... → [Newest Attempted] → [Unattempted Questions]
Example: Attempt #1 → #2 → #3 → ... → #10 → New Q1 → New Q2 → ...
```

### State Management

1. **Server State (React Query)**
   - Questions with their attempts loaded from backend
   - Cached for 5 minutes
   - Invalidated after new attempt submission

2. **Local State**
   - `localAttempts`: Map of newly submitted attempts (optimistic UI)
   - `currentQuestionIndex`: Current position in question list
   - `showSolution`: Controls solution visibility

3. **Attempt Resolution Priority**
   ```typescript
   // Check local first (for new submissions), then server data
   const currentAttempt = localAttempt || serverAttempt || null;
   ```

### Progress Calculation

```typescript
// Count questions with attempts (server OR local)
const attemptedCount = questions.filter(q => 
    q.attempt || localAttempts.has(q.question.id)
).length;

const progressPercentage = (attemptedCount / totalQuestions) * 100;
```

## Benefits

### 1. **Better Review Experience**
- Users can review their mistakes immediately
- See exactly what they selected vs. correct answer
- Learn from errors without losing context

### 2. **Seamless Navigation**
- No modal pop-ups or separate history page needed for quick review
- Navigate naturally through questions
- Previous button intuitively shows past work

### 3. **Context Preservation**
- Last 10 attempts always available
- Solution and strategy visible for review
- Mistake categories displayed

### 4. **Smart Learning**
- Review recent attempts before continuing
- Compare incorrect answer with correct one
- Study solution approach for difficult questions

## Data Flow

```
Page Load
    ↓
Fetch Session Data (API)
    ↓
Backend Returns:
  - Last 10 Attempted (with answers)
  - Unattempted Questions
    ↓
Component Initializes:
  - Position at first unattempted
  - Store attempted questions
    ↓
User Navigates with Previous/Next
    ↓
Show appropriate UI:
  - Attempted: Banner + Answers + Solution
  - Unattempted: Clean question interface
    ↓
User Submits New Answer
    ↓
Optimistic Update (Local)
    ↓
API Call
    ↓
Cache Invalidation
    ↓
Refresh Session Data
```

## Examples

### Example 1: Review Last Attempt
```
User is on Question 15 (new)
↓ Click Previous
Shows Question 14 with:
  - "📝 Reviewing Previous Attempt #10 ✓ Correct"
  - User's answer: Option 2 (highlighted green)
  - Solution visible
```

### Example 2: Navigate Through History
```
Current Position: Question 4 (new)
Click Previous 3 times:
  Q3 (Attempt #3) → Q2 (Attempt #2) → Q1 (Attempt #1)
Each shows:
  - Attempt number and result
  - User's selected answer
  - Complete solution
```

### Example 3: Skip to Unattempted
```
User on Question 5 (already attempted)
Click "Skip to Next Unattempted"
↓
Jumps to Question 11 (first new question)
```

## Visual Indicators

### Attempted Question Banner
```
┌─────────────────────────────────────────────────┐
│ 📝 Reviewing Previous Attempt #5 ✓ Correct      │
│                                   or            │
│ 📝 Reviewing Previous Attempt #3 ✗ Incorrect    │
└─────────────────────────────────────────────────┘
```

### Progress Display
```
[■■■■■■■■■■□□□□□□□□□□] 10/20
  ^attempted  ^remaining
```

## API Response Example

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question": { /* full question object */ },
        "attempt": {
          "id": "attempt-1",
          "answer": "1,2",
          "status": "CORRECT",
          "timing": 45.2,
          "mistake": null,
          "hintsUsed": false,
          "solvedAt": "2025-01-15T10:30:00Z"
        }
      },
      // ... 9 more attempted questions
      {
        "question": { /* full question object */ },
        "attempt": null  // Unattempted question
      }
    ],
    "metadata": {
      "topicName": "Algebra",
      "attemptedCount": 10,
      "unattemptedCount": 40
    }
  }
}
```

## Migration Notes

### Breaking Changes
None - This is backward compatible.

### Data Migration
No database migration needed. Uses existing `Attempt` table.

### Cache Considerations
- Cache key remains same: `["ai-questions-session", topicSlug]`
- Cache invalidated after each attempt
- Stale time: 5 minutes

## Testing Checklist

- [x] Navigate backwards through attempted questions
- [x] Verify user's answers are shown correctly
- [x] Check correct/incorrect highlighting
- [x] Test "Skip to Next Unattempted" button
- [x] Verify progress calculation
- [x] Test with 0 attempts (new topic)
- [x] Test with exactly 10 attempts
- [x] Test with more than 10 attempts (shows only last 10)
- [x] Verify solution visibility for attempted questions
- [x] Test optimistic updates (new submissions)
- [x] Check error handling and rollback

## Performance Considerations

1. **Limited History**: Only last 10 attempts to keep payload small
2. **Single Query**: All data fetched in one request
3. **Efficient Filtering**: Use Sets for O(1) lookups
4. **Memoization**: Heavy calculations cached with useMemo
5. **React Query**: Built-in caching and deduplication

## Future Enhancements

1. **Pagination**: Load more history on demand
2. **Filter Options**: Show only incorrect attempts
3. **Comparison Mode**: Side-by-side current vs previous attempt
4. **Statistics**: Show improvement over time
5. **Bookmarks**: Mark questions for later review

## Conclusion

Users can now seamlessly navigate through their question-solving history using the Previous button. This provides immediate context for learning from mistakes and reviewing correct approaches, all within the same interface without breaking the flow.

