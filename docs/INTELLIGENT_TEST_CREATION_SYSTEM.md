# Intelligent Test Creation System

## Overview

The Intelligent Test Creation System is a powerful feature that allows administrators to create tests by specifying requirements and filters. The system automatically selects optimized questions from the database based on these criteria, providing a smart and efficient way to build tests.

## Features

### 1. **Intelligent Question Selection**
- Automatic question selection based on multiple filters
- Smart difficulty distribution (20% easy, 40% medium, 30% hard, 10% very hard)
- Randomized selection for fairness and variety

### 2. **Advanced Filtering Options**
- **Subject & Topic Selection**: Choose specific subjects and multiple topics
- **Difficulty Range**: Set minimum and maximum difficulty levels (1-4)
- **Question Types**: Filter by MCQ, MSQ, NUMERICAL, INTEGER, TRUE_FALSE
- **Question Formats**: Filter by TEXT, IMAGE, MIXED
- **Question Categories**: Filter by THEORY, NUMERICAL, CONCEPTUAL, APPLICATION

### 3. **Flexible Section Configuration**
- Multiple sections support
- Optional sections with max question limits
- Custom marking schemes per section (correct marks, negative marks)
- Topic-wise question distribution

### 4. **Interactive Question Preview**
- Drag-and-drop reordering within and across sections
- Remove unwanted questions
- Visual difficulty distribution
- Real-time statistics

### 5. **Test Metadata**
- Exam code support (JEE, NEET, etc.)
- Test types (FULL_LENGTH, SUBJECT_WISE, TOPIC_WISE, PYQ)
- Duration settings
- Start/End time scheduling
- Status (DRAFT, ACTIVE, ARCHIVED)
- Visibility (PUBLIC, PRIVATE)

## API Endpoints

### POST `/api/test/intelligent-create`

Creates an intelligent test by selecting questions based on provided filters.

**Request Body:**
```json
{
  "sections": [
    {
      "name": "Physics",
      "isOptional": false,
      "maxQuestions": null,
      "correctMarks": 4,
      "negativeMarks": 1,
      "questionCount": 30,
      "subjectId": "subject-uuid",
      "topicIds": ["topic-uuid-1", "topic-uuid-2"],
      "difficultyRange": {
        "min": 1,
        "max": 4
      },
      "questionTypes": ["MCQ", "MSQ"],
      "questionFormats": ["TEXT", "IMAGE"],
      "questionCategories": ["CONCEPTUAL", "APPLICATION"]
    }
  ],
  "examCode": "JEE",
  "totalQuestions": 90,
  "duration": 180
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "name": "Physics",
        "isOptional": false,
        "maxQuestions": null,
        "correctMarks": 4,
        "negativeMarks": 1,
        "questions": [
          {
            "id": "question-uuid",
            "title": "Question title",
            "slug": "question-slug",
            "difficulty": 2,
            "type": "MCQ",
            "format": "TEXT",
            "subject": {
              "id": "subject-uuid",
              "name": "Physics",
              "shortName": "PHY"
            },
            "topic": {
              "id": "topic-uuid",
              "name": "Mechanics",
              "weightage": 0.3
            },
            "subTopic": {
              "id": "subtopic-uuid",
              "name": "Newton's Laws"
            },
            "category": [
              { "category": "CONCEPTUAL" }
            ],
            "pyqYear": "2023"
          }
        ]
      }
    ],
    "totalQuestions": 30,
    "duration": 180,
    "examCode": "JEE"
  },
  "message": "Questions selected successfully"
}
```

## Frontend Usage

### Accessing the Intelligent Test Creator

Navigate to: `/admin/tests/intelligent-create`

### Step-by-Step Guide

#### Step 1: Configure Test Details
1. Enter basic test information:
   - Test Title (required)
   - Description (optional)
   - Exam Code (required) - JEE or NEET
   - Exam Type - FULL_LENGTH, SUBJECT_WISE, TOPIC_WISE, PYQ
   - Difficulty - EASY, MEDIUM, HARD
   - Duration in minutes (required)
   - Status - DRAFT, ACTIVE, ARCHIVED
   - Visibility - PUBLIC, PRIVATE

2. Set time settings:
   - Start Time (required)
   - End Time (optional, can set infinite time)
   - Test Key (optional, for private tests)

#### Step 2: Configure Sections
For each section, specify:

1. **Basic Settings:**
   - Section Name (e.g., "Physics", "Chemistry")
   - Number of Questions
   - Optional Section toggle (if enabled, set max questions)
   - Marking Scheme (correct marks, negative marks)

2. **Question Filters:**
   - Select Subject (required)
   - Select Topics (required, multiple selection)
   - Set Difficulty Range (min and max)
   - Select Question Types (optional)
   - Select Question Formats (optional)
   - Select Question Categories (optional)

3. Click "Add Section" to add the configured section

4. Repeat for multiple sections

#### Step 3: Generate Questions
1. Review your configured sections in the summary table
2. Click "Generate Questions" button
3. Wait for the AI-powered selection algorithm to find optimal questions

#### Step 4: Preview & Adjust
1. Review generated questions organized by section
2. See difficulty distribution for each section
3. Drag and drop questions to reorder:
   - Within the same section
   - Between different sections
4. Remove unwanted questions using the trash icon
5. Remove entire sections if needed

#### Step 5: Create Test
1. Review final configuration
2. Click "Create Test" button
3. System will create the test and redirect to tests list

## Question Selection Algorithm

The intelligent selection algorithm uses the following logic:

### 1. **Filtering Phase**
```
Filter questions by:
├── isPublished: true (only published questions)
├── subjectId (if provided)
├── topicId in topicIds[] (if provided)
├── difficulty >= min AND difficulty <= max
├── type in questionTypes[] (if provided)
├── format in questionFormats[] (if provided)
└── category in questionCategories[] (if provided)
```

### 2. **Distribution Phase**
Smart distribution based on difficulty:
- 20% Easy (difficulty = 1)
- 40% Medium (difficulty = 2)
- 30% Hard (difficulty = 3)
- 10% Very Hard (difficulty = 4)

Distribution adjusts if difficulty range is restricted.

### 3. **Selection Phase**
- Questions are grouped by difficulty level
- Random selection from each difficulty group
- Fisher-Yates shuffle for true randomness
- Gap filling if insufficient questions at specific difficulty

### 4. **Optimization Phase**
- Ensures no duplicate questions
- Maintains requested count
- Final shuffle for complete randomness

## Database Schema

### Test Model
```prisma
model Test {
  testId         String    @id @default(uuid())
  title          String
  description    String?
  examCode       String?
  totalMarks     Int?
  totalQuestions Int?
  difficulty     String?   @default("MEDIUM")
  duration       Int
  status         String    @default("DRAFT")
  visibility     String    @default("PUBLIC")
  examType       String?
  startTime      DateTime?
  endTime        DateTime?
  createdBy      String
  authorId       String?
  
  testSection       TestSection[]
  testParticipation TestParticipation[]
}
```

### TestSection Model
```prisma
model TestSection {
  id            String  @id @default(uuid())
  testId        String
  name          String
  isOptional    Boolean @default(false)
  maxQuestions  Int?
  correctMarks  Float?
  negativeMarks Float?
  
  test         Test
  testQuestion TestQuestion[]
}
```

### TestQuestion Model
```prisma
model TestQuestion {
  questionId    String
  testSectionId String
  
  question    Question
  testSection TestSection
}
```

## Technical Implementation

### Backend (Node.js/Express/Prisma)

**Controller:** `apps/backend/src/controllers/test.controller.ts`
- `intelligentCreateTest()` - Main endpoint handler
- `selectOptimizedQuestions()` - Question selection algorithm
- `shuffleArray()` - Fisher-Yates shuffle implementation

**Routes:** `apps/backend/src/routes/test.routes.ts`
```typescript
router.post("/intelligent-create", authenticate, testController.intelligentCreateTest);
```

### Frontend (Next.js/React)

**Page:** `apps/admin/src/app/(admin)/admin/tests/intelligent-create/page.tsx`
- Main orchestration component
- State management for test configuration
- API integration

**Components:**

1. **IntelligentSectionBuilder** (`intelligent-builder/IntelligentSectionBuilder.tsx`)
   - Composes `SectionForm` and `ConfiguredSectionsTable`
   - Keeps subject/topic fetching isolated inside the form
   - Handles add/remove flows and loading states

2. **QuestionPreviewList** (`QuestionPreviewList.tsx`)
   - Drag-and-drop interface plus manual fulfillment entry point
   - Displays section statistics, limits, and optionality
   - Invokes the new `QuestionFulfillmentDialog` for replacements
   - Supports delete/reorder actions

3. **QuestionFulfillmentDialog** (`components/QuestionFulfillmentDialog.tsx`)
   - Embeds the shared `Questionset` picker with max slot enforcement
   - Normalizes question metadata for the preview grid
   - Provides cancel/save controls for manual adjustments

## Usage Examples

### Example 1: Creating a JEE Full-Length Test

```typescript
// Configuration
{
  title: "JEE Main 2024 Mock Test #1",
  examCode: "JEE",
  examType: "FULL_LENGTH",
  duration: 180,
  sections: [
    {
      name: "Physics",
      questionCount: 30,
      subjectId: "physics-uuid",
      topicIds: ["mechanics-uuid", "thermodynamics-uuid"],
      difficultyRange: { min: 1, max: 4 },
      correctMarks: 4,
      negativeMarks: 1
    },
    {
      name: "Chemistry",
      questionCount: 30,
      subjectId: "chemistry-uuid",
      topicIds: ["organic-uuid", "inorganic-uuid"],
      difficultyRange: { min: 1, max: 4 },
      correctMarks: 4,
      negativeMarks: 1
    },
    {
      name: "Mathematics",
      questionCount: 30,
      subjectId: "math-uuid",
      topicIds: ["calculus-uuid", "algebra-uuid"],
      difficultyRange: { min: 1, max: 4 },
      correctMarks: 4,
      negativeMarks: 1
    }
  ]
}
```

### Example 2: Creating a Topic-Wise Practice Test

```typescript
{
  title: "Mechanics Deep Dive",
  examCode: "JEE",
  examType: "TOPIC_WISE",
  duration: 60,
  sections: [
    {
      name: "Mechanics - Easy to Medium",
      questionCount: 20,
      subjectId: "physics-uuid",
      topicIds: ["mechanics-uuid"],
      difficultyRange: { min: 1, max: 2 },
      questionTypes: ["MCQ"],
      correctMarks: 4,
      negativeMarks: 1
    },
    {
      name: "Mechanics - Hard",
      questionCount: 10,
      isOptional: true,
      maxQuestions: 5,
      subjectId: "physics-uuid",
      topicIds: ["mechanics-uuid"],
      difficultyRange: { min: 3, max: 4 },
      correctMarks: 4,
      negativeMarks: 1
    }
  ]
}
```

### Example 3: Creating a PYQ Test

```typescript
{
  title: "JEE Advanced PYQ 2020-2023",
  examCode: "JEE",
  examType: "PYQ",
  duration: 120,
  sections: [
    {
      name: "Physics PYQ",
      questionCount: 20,
      subjectId: "physics-uuid",
      topicIds: ["all-topics"],
      questionCategories: ["PYQ"],
      difficultyRange: { min: 3, max: 4 },
      correctMarks: 4,
      negativeMarks: 1
    }
  ]
}
```

## Best Practices

### 1. **Question Selection**
- Always select multiple topics for better coverage
- Use difficulty range strategically (1-3 for practice, 2-4 for mock tests)
- Include variety in question types for comprehensive assessment

### 2. **Section Design**
- Keep section names clear and descriptive
- Use optional sections for bonus questions
- Match marking scheme to actual exam patterns

### 3. **Test Configuration**
- Set realistic durations (1-2 minutes per question)
- Use DRAFT status while testing, ACTIVE for release
- Set appropriate start times for scheduled tests

### 4. **Quality Assurance**
- Always review generated questions before publishing
- Check difficulty distribution matches expectations
- Remove any inappropriate or duplicate questions
- Test the complete flow before sharing with students

## Troubleshooting

### Issue: "No questions found for section"
**Solution:** 
- Check if the subject has published questions
- Verify topic selection is correct
- Relax filter constraints (remove optional filters)
- Check difficulty range is not too restrictive

### Issue: Fewer questions than requested
**Solution:**
- Database has insufficient questions matching filters
- Reduce questionCount or relax filters
- Add more questions to the database

### Issue: Drag-and-drop not working
**Solution:**
- Ensure browser supports HTML5 drag-and-drop
- Try refreshing the page
- Check browser console for errors

### Issue: Test creation fails
**Solution:**
- Verify all required fields are filled
- Check that at least one section has questions
- Ensure user has proper permissions
- Check network connectivity

## Future Enhancements

- [ ] Machine Learning-based question selection
- [ ] Historical performance-based difficulty adjustment
- [ ] Automatic test generation based on syllabus
- [ ] Question recommendation engine
- [ ] Bulk test creation
- [ ] Template-based test creation
- [ ] Export/Import test configurations

## Support

For issues or questions:
1. Check this documentation
2. Review the troubleshooting section
3. Contact the development team
4. Create an issue in the repository

---

**Version:** 1.0.0  
**Last Updated:** November 13, 2025  
**Maintained By:** RankMarg Development Team

