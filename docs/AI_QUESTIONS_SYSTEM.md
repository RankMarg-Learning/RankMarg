# AI Questions System Documentation

## Overview

The AI Questions System is a premium feature that provides personalized, performance-based question practice for subscribed users. The system automatically filters questions based on:

- User's current performance grade (A+, A, B, C, D)
- Previously attempted questions (excludes them)
- Topic hierarchy and subject organization
- Subscription status (paid users only)

## Architecture

### Backend Components

#### 1. Controller (`aiQuestion.controller.ts`)
**Location**: `apps/backend/src/controllers/aiQuestion.controller.ts`

**Key Features**:
- Performance-based question filtering
- Grade-aware difficulty adjustment
- Redis caching for optimal performance
- Pagination support
- Excludes already attempted questions

**Endpoints**:
```typescript
GET /api/ai-questions/subjects
  - Returns all subjects with question counts
  
GET /api/ai-questions/subjects/:subjectId/topics
  - Returns topics for a specific subject
  
GET /api/ai-questions/topic/:topicSlug?page=1&limit=10
  - Returns AI-filtered questions for a topic
  - Excludes attempted questions
  - Adjusts difficulty based on user grade
  
GET /api/ai-questions/stats
  - Returns user statistics (grade, accuracy, attempts)
```

**Grade-Based Difficulty Mapping**:
```typescript
A+ (A_PLUS): Difficulty 3-4 (Hard, Very Hard)
A:           Difficulty 2-4 (Medium, Hard, Very Hard)
B:           Difficulty 2-3 (Medium, Hard)
C:           Difficulty 1-2 (Easy, Medium)
D:           Difficulty 1   (Easy)
```

#### 2. Routes (`aiQuestion.routes.ts`)
**Location**: `apps/backend/src/routes/aiQuestion.routes.ts`

**Middleware Applied**:
- `authenticate`: Ensures user is logged in
- `checkSubscription(SubscriptionTier.BASIC)`: Ensures user has active paid subscription

#### 3. Caching Strategy
Uses Redis for optimal performance:
- Cache Key Format: `ai:questions:{topicSlug}:{userId}:{userGrade}:{page}:{limit}`
- TTL: 2 hours for questions
- Automatic invalidation on user performance updates

### Frontend Components

#### 1. Main Landing Page
**Location**: `apps/frontend/src/app/(site)/ai-questions/page.tsx`
**Route**: `/ai-questions`

**Features**:
- Displays all available subjects
- Shows user grade and accuracy statistics
- Premium feature indicator
- Responsive grid layout

#### 2. Topics Selection Page
**Location**: `apps/frontend/src/app/(site)/ai-questions/[subjectId]/page.tsx`
**Route**: `/ai-questions/[subjectId]`

**Features**:
- Lists all topics for selected subject
- Shows topic weightage and estimated time
- Displays question count per topic
- Visual difficulty indicators

#### 3. Questions Display Page
**Location**: `apps/frontend/src/app/(site)/ai-questions/[subjectId]/[topicSlug]/page.tsx`
**Route**: `/ai-questions/[subjectId]/[topicSlug]`

**Features**:
- Displays filtered questions based on user grade
- Pagination support (10 questions per page)
- Metadata cards showing:
  - User grade
  - Difficulty range
  - Questions attempted count
  - Available questions count
- Question preview with categories
- Click to view full question details

#### 4. API Service Layer
**Location**: `apps/frontend/src/services/aiQuestion.service.ts`

**Methods**:
```typescript
getSubjects(): Promise<Subject[]>
getTopicsBySubject(subjectId: string): Promise<Topic[]>
getQuestionsByTopic(topicSlug: string, page: number, limit: number): Promise<AIQuestionsResponse>
getUserStats(): Promise<UserAIStats>
```

## Database Schema

### Relevant Tables

1. **Question**: Stores question data
   - `difficulty`: 1-4 (Easy to Very Hard)
   - `isPublished`: Must be true for AI questions
   - `topicId`: Links to topic
   - `subjectId`: Links to subject

2. **Attempt**: Tracks user attempts
   - `userId`: User who attempted
   - `questionId`: Question attempted
   - `status`: CORRECT, INCORRECT, etc.
   - Used to exclude already attempted questions

3. **User**: User information
   - `grade`: Current performance grade (A_PLUS, A, B, C, D)
   - Used for difficulty filtering

4. **Subscription**: User subscription status
   - `status`: ACTIVE, TRIAL, EXPIRED, etc.
   - Required to access AI questions

## Usage Flow

### User Journey

1. **Access**: User navigates to `/ai-questions`
   - System checks authentication
   - System checks subscription status (must be BASIC or higher)
   
2. **Subject Selection**: User views and selects a subject
   - Displays all subjects with question counts
   - Shows user's current grade and accuracy
   
3. **Topic Selection**: User selects a topic from the subject
   - Shows topics with weightage and question counts
   - Indicates estimated time per topic
   
4. **Question Practice**: User views filtered questions
   - Questions are filtered by:
     - User's grade level (difficulty adjustment)
     - Exclude already attempted questions
     - Topic relevance
   - Pagination for easy navigation
   - Click to view full question and attempt

### API Request Flow

```
Frontend Request
    ↓
API Client Service
    ↓
Backend Route (with auth + subscription middleware)
    ↓
Controller (checks cache first)
    ↓
Database Query (if cache miss)
    ↓
Apply Filters:
  - Grade-based difficulty
  - Exclude attempted questions
  - Published only
    ↓
Cache Results
    ↓
Return Response
```

## Performance Optimizations

### Backend
1. **Redis Caching**
   - Caches filtered question sets
   - 2-hour TTL for stability
   - Reduces database load

2. **Query Optimization**
   - Uses indexed fields (topicId, difficulty, isPublished)
   - Efficient exclusion of attempted questions
   - Pagination to limit data transfer

3. **Parallel Queries**
   - Fetches questions and counts simultaneously
   - Reduces total request time

### Frontend
1. **Client-Side Caching**
   - API client handles response caching
   - Reduces redundant API calls

2. **Lazy Loading**
   - Pagination prevents loading all questions at once
   - Improved initial load time

3. **Optimistic UI**
   - Shows loading skeletons
   - Better perceived performance

## Security Features

1. **Authentication Required**
   - All routes protected by authenticate middleware
   - JWT token validation

2. **Subscription Check**
   - Ensures only paid users can access
   - Supports multiple tiers (BASIC, PREMIUM, ENTERPRISE)
   - Admin bypass for testing

3. **Data Privacy**
   - Correct answers not sent to frontend initially
   - Only visible after attempt submission

4. **Rate Limiting**
   - Applied via API client configuration
   - Prevents abuse

## Configuration

### Environment Variables
```env
# Backend
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your_jwt_secret

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Subscription Tiers
Located in `apps/backend/src/types/common.ts`:
```typescript
enum SubscriptionTier {
  FREE = "FREE",
  BASIC = "BASIC",      // Minimum for AI Questions
  PREMIUM = "PREMIUM",
  ENTERPRISE = "ENTERPRISE"
}
```

## Testing

### Manual Testing Checklist

#### Backend Tests
- [ ] GET /api/ai-questions/subjects returns subjects
- [ ] GET /api/ai-questions/subjects/:id/topics returns topics
- [ ] GET /api/ai-questions/topic/:slug returns filtered questions
- [ ] Questions filtered by grade correctly
- [ ] Already attempted questions excluded
- [ ] Pagination works correctly
- [ ] Cache is used on subsequent requests
- [ ] Unauthorized users get 401
- [ ] Non-subscribed users get 403

#### Frontend Tests
- [ ] Subject page loads and displays correctly
- [ ] Topic selection page shows all topics
- [ ] Questions page displays filtered questions
- [ ] Pagination works (next/previous)
- [ ] User stats display correctly
- [ ] Grade badges show correct colors
- [ ] Clicking question navigates to detail page
- [ ] Loading states show properly
- [ ] Error handling works (network errors)

### Example API Calls

```bash
# Get subjects (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/ai-questions/subjects

# Get topics for a subject
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/ai-questions/subjects/SUBJECT_ID/topics

# Get AI questions for a topic
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8080/api/ai-questions/topic/TOPIC_SLUG?page=1&limit=10"

# Get user stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/ai-questions/stats
```

## Future Enhancements

### Potential Improvements

1. **Machine Learning Integration**
   - Use ML models to predict optimal difficulty
   - Personalized question recommendations
   - Adaptive learning paths

2. **Advanced Filtering**
   - Filter by question categories
   - Filter by PYQ years
   - Custom difficulty preferences

3. **Analytics**
   - Track time spent per question
   - Identify weak areas automatically
   - Progress visualization

4. **Gamification**
   - Streaks for consistent practice
   - Achievements for milestones
   - Leaderboards per topic

5. **Social Features**
   - Share progress with friends
   - Collaborative study sessions
   - Discussion forums per question

## Troubleshooting

### Common Issues

#### 1. "Subscription Required" Error
**Cause**: User doesn't have active subscription
**Solution**: 
- Check subscription status in database
- Ensure user has BASIC or higher tier
- Verify subscription hasn't expired

#### 2. No Questions Available
**Cause**: All questions attempted or no questions match grade
**Solution**:
- Check if questions exist for topic
- Verify questions are published (isPublished = true)
- Check if user has attempted all available questions
- Adjust grade if necessary

#### 3. Cache Issues
**Cause**: Stale cache or Redis connection issues
**Solution**:
- Check Redis connection: `curl http://localhost:8080/health/redis`
- Manually invalidate cache via API
- Restart Redis service

#### 4. Slow Performance
**Cause**: Database queries or missing indexes
**Solution**:
- Check database query performance
- Ensure indexes exist on: topicId, difficulty, isPublished
- Monitor Redis hit rate
- Consider increasing cache TTL

## Maintenance

### Regular Tasks

1. **Weekly**
   - Monitor cache hit rates
   - Check API response times
   - Review error logs

2. **Monthly**
   - Update question difficulty ratings based on user performance
   - Review and adjust grade thresholds
   - Analyze user engagement metrics

3. **Quarterly**
   - Optimize database queries
   - Review and update documentation
   - Plan new features based on user feedback

## Support

For issues or questions:
- Check this documentation first
- Review error logs in backend console
- Check Redis connection status
- Verify database connectivity
- Contact development team with specific error messages

## Version History

- **v1.0.0** (Current)
  - Initial release
  - Grade-based filtering
  - Subscription-based access
  - Redis caching
  - Basic pagination
  - Responsive UI

---

Last Updated: October 2025

