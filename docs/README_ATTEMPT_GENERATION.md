# Attempt Data Generation Scripts

This directory contains scripts to generate and insert additional attempt data for testing curriculum features.

## Overview

The scripts generate realistic attempt data for 3 different students across 4 subjects (Biology, Chemistry, Mathematics, Physics) to provide comprehensive testing data for your curriculum system.

## Files Created

### 1. `generateAttemptData.ts`
- **Purpose**: Generates 200-400 attempt records per student
- **Features**:
  - Realistic timing patterns (10-120 seconds, with outliers)
  - 70% accuracy rate (realistic for practice)
  - Various mistake types (CONCEPTUAL, CALCULATION, READING, OTHER)
  - Random hint usage (20% chance)
  - Proper date distribution over last 30 days
  - Valid question IDs from existing database

### 2. `insertGeneratedAttempts.ts`
- **Purpose**: Inserts generated attempt data into the database
- **Features**:
  - Batch processing (50 attempts per batch)
  - Duplicate detection and skipping
  - Error handling and reporting
  - Progress tracking
  - Data verification

### 3. `generateAndInsertAttempts.ts`
- **Purpose**: Combined pipeline script
- **Features**:
  - Runs generation and insertion in sequence
  - Comprehensive error handling
  - Final verification

## Usage

### Option 1: Run the complete pipeline (Recommended)
```bash
cd apps/backend
npm run ts-node scripts/generateAndInsertAttempts.ts
```

### Option 2: Run scripts individually
```bash
# Step 1: Generate data
npm run ts-node scripts/generateAttemptData.ts

# Step 2: Insert data
npm run ts-node scripts/insertGeneratedAttempts.ts
```

## Generated Data Structure

Each attempt record includes:
```typescript
{
  id: string,                    // UUID
  userId: string,                // Student ID
  questionId: string,            // Valid question ID from database
  type: "SESSION" | "NONE",      // Attempt type
  answer: "0" | "1" | "2" | "3", // MCQ answer
  mistake: string | null,        // Mistake type if incorrect
  timing: number,                // Time taken in seconds
  reactionTime: number,          // Reaction time in seconds
  status: "CORRECT" | "INCORRECT", // Result status
  hintsUsed: boolean,            // Whether hints were used
  solvedAt: string,              // ISO date string
  testParticipationId: null,     // Not used in generated data
  practiceSessionId: string | null // Session ID if type is SESSION
}
```

## Students Included

1. **Aniket Sudke** (`0aad2b65-5334-4ab2-b6c8-1e37d97dc3f5`)
   - Standard: 12th
   - Role: ADMIN
   - Target Year: 2027

2. **Suyash Dhone** (`12a154d8-4ebc-4f36-839d-200040446c37`)
   - Standard: CLASS_11
   - Role: USER
   - Target Year: 2027

3. **Bhushan** (`9cff25aa-f601-449c-be4f-715bdbdd3ee9`)
   - Standard: CLASS_11
   - Role: USER
   - Target Year: 2026

## Subjects Covered

- **Biology** (`70821584-88d7-4205-9f32-4dd5ecde20b9`)
- **Chemistry** (`959f2ce7-b37a-4325-a9d0-d46c2ba3ef59`)
- **Mathematics** (`c47c9c14-2dd7-42fc-823d-d3f550a0e471`)
- **Physics** (`fdee61f5-0236-44d2-b614-a1da45659ca6`)

## Output Files

- **GeneratedAttempts.json**: Contains all generated attempt data
- **Location**: `apps/backend/scripts/json/7-9-25/GeneratedAttempts.json`

## Data Statistics

The generated data includes:
- **Total Attempts**: 600-1200 (200-400 per student)
- **Accuracy Rate**: ~70% (realistic for practice)
- **Hint Usage**: ~20% of attempts
- **Time Distribution**: 10-120 seconds (with outliers)
- **Date Range**: Last 30 days
- **Mistake Types**: CONCEPTUAL, CALCULATION, READING, OTHER

## Error Handling

The scripts include comprehensive error handling:
- Database connection issues
- Missing question IDs
- Invalid date formats
- Duplicate attempt detection
- Batch processing failures

## Verification

After insertion, the script automatically verifies:
- Total attempt count
- Correct vs incorrect distribution
- Attempts per student
- Database integrity

## Notes

- The scripts use existing question IDs from your database
- Generated data is realistic and follows patterns from your existing data
- All attempts are properly linked to valid users and questions
- The pipeline is idempotent (safe to run multiple times)

## Troubleshooting

### Common Issues

1. **"No questions available for subject"**
   - Ensure your database has questions for all subjects
   - Check if questions are properly linked to subjects

2. **"Generated attempts file not found"**
   - Run `generateAttemptData.ts` first
   - Check file permissions

3. **Database connection errors**
   - Verify your database is running
   - Check connection string in environment variables

### Support

If you encounter issues:
1. Check the console output for detailed error messages
2. Verify your database schema matches the expected structure
3. Ensure all required dependencies are installed
4. Check that the existing data (users, subjects, questions) is properly set up
