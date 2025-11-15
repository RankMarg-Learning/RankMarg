# Intelligent Test Creation - Quick Setup Guide

## Overview
This guide will help you quickly set up and start using the new Intelligent Test Creation system.

## What's New?

### New Route
- **URL:** `/admin/tests/intelligent-create`
- **Purpose:** Create tests with AI-powered question selection

### New Backend Endpoint
- **Endpoint:** `POST /api/test/intelligent-create`
- **Purpose:** Generate optimized question sets based on filters

## Prerequisites

1. **Backend Setup:**
   - Backend server running on specified port
   - Database properly seeded with questions
   - All migrations applied

2. **Frontend Setup:**
   - Admin panel accessible
   - User logged in with appropriate permissions
   - Subjects and topics configured in database

## Quick Start

### For Administrators

#### 1. Navigate to Test Creation
```
Admin Dashboard → Tests → Intelligent Test Creator
```
Or directly: `http://your-domain/admin/tests/intelligent-create`

#### 2. Create Your First Test
Follow the 5-step process:
1. Configure test details (title, exam code, duration)
2. Add sections with filters
3. Generate questions using AI
4. Preview and adjust questions
5. Create the test

#### 3. Access Created Tests
Navigate to: `http://your-domain/admin/tests`

## File Structure

### Backend Files
```
apps/backend/
├── src/
│   ├── controllers/
│   │   └── test.controller.ts          # Added intelligentCreateTest method
│   └── routes/
│       └── test.routes.ts               # Added POST /intelligent-create route
```

### Frontend Files
```
apps/admin/
├── src/
│   ├── app/(admin)/admin/tests/
│   │   └── intelligent-create/
│   │       └── page.tsx                 # Main page component
│   └── components/admin/test/
│       ├── intelligent-builder/
│       │   ├── SectionForm.tsx             # Filter-driven form
│       │   ├── ConfiguredSectionsTable.tsx # Section summary table
│       │   └── IntelligentSectionBuilder.tsx # Orchestrator
│       ├── components/QuestionFulfillmentDialog.tsx # Manual adjustments
│       ├── QuestionPreviewList.tsx        # Preview & adjustment UI
│       └── index.ts                        # Updated exports
```

### Documentation
```
docs/
├── INTELLIGENT_TEST_CREATION_SYSTEM.md  # Complete documentation
└── INTELLIGENT_TEST_SETUP_GUIDE.md     # This file
```

## Navigation Flow

### Old Test Creation Flow
```
Admin Tests Page → Click "Create Test" → Manual question selection
```

### New Intelligent Test Creation Flow
```
Admin Tests Page → Click "Intelligent Test Creator" → 
Configure filters → Generate questions → Preview → Create
```

## Key Features Comparison

| Feature | Old System | New Intelligent System |
|---------|-----------|----------------------|
| Question Selection | Manual | AI-Powered |
| Filters | Limited | Comprehensive (8+ filters) |
| Preview | Basic | Interactive with drag-drop |
| Time | Slow (manual selection) | Fast (automated) |
| Optimization | No | Smart difficulty distribution |

## API Usage Example

### cURL Request
```bash
curl -X POST http://localhost:3000/api/test/intelligent-create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sections": [
      {
        "name": "Physics",
        "questionCount": 30,
        "subjectId": "physics-uuid",
        "topicIds": ["mechanics-uuid"],
        "difficultyRange": { "min": 1, "max": 4 },
        "correctMarks": 4,
        "negativeMarks": 1,
        "isOptional": false
      }
    ],
    "examCode": "JEE",
    "duration": 180
  }'
```

### JavaScript/TypeScript
```typescript
const response = await axios.post('/api/test/intelligent-create', {
  sections: [
    {
      name: "Physics",
      questionCount: 30,
      subjectId: "physics-uuid",
      topicIds: ["mechanics-uuid"],
      difficultyRange: { min: 1, max: 4 },
      correctMarks: 4,
      negativeMarks: 1,
      isOptional: false
    }
  ],
  examCode: "JEE",
  duration: 180
});
```

## Environment Variables

No additional environment variables are required. The system uses existing configuration.

## Database Requirements

### Minimum Data Required
1. **Subjects:** At least 1 subject with published questions
2. **Topics:** At least 1 topic per subject
3. **Questions:** At least 100 published questions per subject
4. **ExamSubject:** Mapping between exam codes and subjects

### Recommended Data
- 500+ questions per subject
- Multiple topics per subject (10+)
- Mix of difficulty levels (1-4)
- Various question types (MCQ, MSQ, NUMERICAL)
- Multiple question formats (TEXT, IMAGE, MIXED)

## Testing the System

### 1. Verify Database
```sql
-- Check published questions count
SELECT COUNT(*) FROM "Question" WHERE "isPublished" = true;

-- Check subjects
SELECT * FROM "Subject";

-- Check topics per subject
SELECT s.name, COUNT(t.id) as topic_count 
FROM "Subject" s 
LEFT JOIN "Topic" t ON t."subjectId" = s.id 
GROUP BY s.id, s.name;
```

### 2. Test Backend Endpoint
```bash
# Test with curl (after authentication)
curl -X POST http://localhost:3000/api/test/intelligent-create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"sections":[...]}'
```

### 3. Test Frontend
1. Login to admin panel
2. Navigate to `/admin/tests/intelligent-create`
3. Fill in test details
4. Add a section with filters
5. Click "Generate Questions"
6. Verify questions are loaded
7. Test drag-and-drop
8. Create the test

## Common Issues & Solutions

### Issue: "No questions found for section"
**Causes:**
- Subject has no published questions
- Topics don't have questions
- Filters are too restrictive

**Solutions:**
```sql
-- Check questions for subject
SELECT COUNT(*) FROM "Question" 
WHERE "subjectId" = 'your-subject-id' 
AND "isPublished" = true;

-- Publish more questions
UPDATE "Question" 
SET "isPublished" = true 
WHERE "subjectId" = 'your-subject-id' 
AND "isPublished" = false 
LIMIT 100;
```

### Issue: Route not accessible
**Solution:**
1. Clear browser cache
2. Verify you're logged in as admin
3. Check route is properly exported
4. Restart Next.js dev server

### Issue: API endpoint returns 404
**Solution:**
1. Verify backend server is running
2. Check route is registered in `test.routes.ts`
3. Verify controller method exists
4. Check API base URL in frontend

## Performance Considerations

### Database Optimization
```sql
-- Add indexes for better query performance (already in schema)
CREATE INDEX IF NOT EXISTS idx_question_published ON "Question"("isPublished");
CREATE INDEX IF NOT EXISTS idx_question_subject ON "Question"("subjectId");
CREATE INDEX IF NOT EXISTS idx_question_topic ON "Question"("topicId");
CREATE INDEX IF NOT EXISTS idx_question_difficulty ON "Question"("difficulty");
```

### Frontend Optimization
- Questions are loaded once per generation
- Drag-and-drop uses lightweight handlers
- No unnecessary re-renders
- Efficient state management

### Backend Optimization
- Single database query per section
- Efficient shuffle algorithm (O(n))
- No duplicate question checks
- Optimized Prisma queries

## Adding to Navigation

To add a button to the main tests page:

```tsx
// In apps/admin/src/app/(admin)/admin/tests/page.tsx

<Link href="/admin/tests/intelligent-create">
  <Button>
    <Sparkles className="mr-2 h-4 w-4" />
    Intelligent Test Creator
  </Button>
</Link>
```

## Security Considerations

1. **Authentication:** All endpoints require authentication
2. **Authorization:** Only admins can create tests
3. **Input Validation:** Request body is validated
4. **SQL Injection:** Prevented by Prisma ORM
5. **Rate Limiting:** Consider adding for production

## Production Deployment Checklist

- [ ] Database is properly seeded with questions
- [ ] All migrations are applied
- [ ] Backend environment variables are set
- [ ] Frontend build is successful
- [ ] API endpoints are accessible
- [ ] CORS is properly configured
- [ ] SSL/TLS is enabled
- [ ] Rate limiting is configured
- [ ] Error logging is set up
- [ ] Monitoring is enabled

## Next Steps

1. **Test the system** with sample data
2. **Add more questions** to the database
3. **Configure exam codes** and subjects
4. **Train administrators** on the new system
5. **Monitor usage** and performance
6. **Gather feedback** from users
7. **Iterate and improve** based on feedback

## Support & Resources

- **Documentation:** See `INTELLIGENT_TEST_CREATION_SYSTEM.md` for detailed docs
- **API Reference:** Check backend controller for endpoint details
- **Component Docs:** Review component files for prop interfaces
- **Database Schema:** See `schema.prisma` for data models

## Feedback & Contributions

If you encounter issues or have suggestions:
1. Document the issue with screenshots
2. Check existing documentation
3. Contact the development team
4. Create a detailed bug report

---

**Quick Links:**
- [Full Documentation](./INTELLIGENT_TEST_CREATION_SYSTEM.md)
- [Database Schema](../packages/db/prisma/schema.prisma)
- [Backend Controller](../apps/backend/src/controllers/test.controller.ts)
- [Frontend Page](../apps/admin/src/app/(admin)/admin/tests/intelligent-create/page.tsx)

**Version:** 1.0.0  
**Created:** November 13, 2025  
**Last Updated:** November 13, 2025

