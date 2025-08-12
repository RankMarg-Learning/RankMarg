-- CreateEnum
CREATE TYPE "Stream" AS ENUM ('JEE', 'NEET');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'INSTRUCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('google', 'credentials');

-- CreateEnum
CREATE TYPE "StandardEnum" AS ENUM ('CLASS_9', 'CLASS_10', 'CLASS_11', 'CLASS_12', 'CLASS_13', 'CLASS_14');

-- CreateEnum
CREATE TYPE "ClassEnum" AS ENUM ('CLASS_10', 'CLASS_11', 'CLASS_12', 'CLASS_13');

-- CreateEnum
CREATE TYPE "GradeEnum" AS ENUM ('A_PLUS', 'A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'INTEGER', 'SUBJECTIVE');

-- CreateEnum
CREATE TYPE "QuestionFormat" AS ENUM ('SINGLE_SELECT', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'MATCHING', 'ASSERTION_REASON', 'COMPREHENSION', 'MATRIX_MATCH');

-- CreateEnum
CREATE TYPE "QCategory" AS ENUM ('CALCULATION', 'APPLICATION', 'THEORETICAL', 'TRICKY', 'FACTUAL', 'TRAP', 'GUESS_BASED', 'MULTI_STEP', 'OUT_OF_THE_BOX', 'ELIMINATION_BASED', 'MEMORY_BASED', 'CONFIDENCE_BASED', 'HIGH_WEIGHTAGE', 'CONCEPTUAL', 'FORMULA_BASED');

-- CreateEnum
CREATE TYPE "AttemptType" AS ENUM ('NONE', 'SESSION', 'TEST');

-- CreateEnum
CREATE TYPE "SubmitStatus" AS ENUM ('CORRECT', 'INCORRECT', 'MARK_FOR_REVIEW', 'ANSWERED_MARK', 'NOT_ANSWERED');

-- CreateEnum
CREATE TYPE "MistakeType" AS ENUM ('NONE', 'CONCEPTUAL', 'CALCULATION', 'READING', 'OVERCONFIDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('FULL_LENGTH', 'SUBJECT_WISE', 'CHAPTER_WISE', 'ONBOARDING', 'CUSTOM', 'PYQ', 'SPEED_TEST', 'WEAKNESS_BASED', 'ADAPTIVE', 'DAILY_CHALLENGE', 'SIMULATION');

-- CreateEnum
CREATE TYPE "TestParticipationStatus" AS ENUM ('JOIN', 'STARTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('TOTAL_QUESTIONS', 'CORRECT_ATTEMPTS', 'MASTERY_LEVEL', 'TEST_SCORE');

-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('ENCOURAGEMENT', 'WARNING', 'CELEBRATION', 'GUIDANCE', 'REMINDER', 'MOTIVATION', 'WELLNESS');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('POST_EXAM', 'SESSION_ANALYSIS', 'DAILY_ANALYSIS', 'WEEKLY_ANALYSIS', 'MONTHLY_ANALYSIS', 'STREAK_MILESTONE', 'INACTIVITY', 'EXAM_PROXIMITY');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('ACTIVE', 'VIEWED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'DISMISSED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PLATFORM', 'SALES_AGENT', 'NONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "email" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "standard" "StandardEnum",
    "avatar" TEXT,
    "stream" "Stream",
    "coins" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "grade" "GradeEnum" NOT NULL DEFAULT 'C',
    "role" "Role" DEFAULT 'USER',
    "provider" "Provider" NOT NULL,
    "location" TEXT,
    "targetYear" INTEGER,
    "studyHoursPerDay" INTEGER,
    "questionsPerDay" INTEGER DEFAULT 5,
    "onboardingCompleted" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPerformance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyQuestions" INTEGER NOT NULL DEFAULT 5,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subjectWiseAccuracy" JSONB,
    "recentTestScores" JSONB,
    "highestScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lowestScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "avgScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastExamDate" TIMESTAMP(3),
    "avgDailyStudyHours" DOUBLE PRECISION DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrentStudyTopic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrentStudyTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "description" TEXT,
    "category" TEXT,
    "minDifficulty" INTEGER NOT NULL DEFAULT 1,
    "maxDifficulty" INTEGER NOT NULL DEFAULT 4,
    "totalMarks" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "negativeMarking" BOOLEAN NOT NULL DEFAULT false,
    "negativeMarkingRatio" DOUBLE PRECISION DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "registrationStartAt" TIMESTAMP(3),
    "registrationEndAt" TIMESTAMP(3),
    "examDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSubject" (
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ExamSubject_pkey" PRIMARY KEY ("examId","subjectId")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "stream" "Stream" NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "subjectId" TEXT NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "estimatedMinutes" INTEGER,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubTopic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "topicId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "estimatedMinutes" INTEGER,

    CONSTRAINT "SubTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "format" "QuestionFormat" NOT NULL,
    "content" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "subtopicId" TEXT,
    "topicId" TEXT,
    "subjectId" TEXT,
    "class" "ClassEnum",
    "stream" "Stream",
    "pyqYear" TEXT,
    "book" TEXT,
    "commonMistake" TEXT,
    "isNumerical" DOUBLE PRECISION,
    "solution" TEXT,
    "questionTime" INTEGER DEFAULT 2,
    "hint" TEXT,
    "isPublished" BOOLEAN DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionCategory" (
    "questionId" TEXT NOT NULL,
    "category" "QCategory" NOT NULL,

    CONSTRAINT "QuestionCategory_pkey" PRIMARY KEY ("questionId","category")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionInsights" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "avgHintsUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionInsights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "AttemptType" NOT NULL,
    "answer" TEXT,
    "mistake" "MistakeType" DEFAULT 'NONE',
    "timing" DOUBLE PRECISION DEFAULT 0,
    "reactionTime" DOUBLE PRECISION,
    "status" "SubmitStatus" NOT NULL DEFAULT 'NOT_ANSWERED',
    "hintsUsed" BOOLEAN NOT NULL DEFAULT false,
    "solvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testParticipationId" TEXT,
    "practiceSessionId" TEXT,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT,
    "questionsSolved" INTEGER DEFAULT 0,
    "correctAnswers" INTEGER DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeSessionQuestions" (
    "id" TEXT NOT NULL,
    "practiceSessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "PracticeSessionQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "testId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stream" "Stream",
    "totalMarks" INTEGER,
    "totalQuestions" INTEGER,
    "referenceId" TEXT,
    "testKey" TEXT,
    "difficulty" TEXT DEFAULT 'MEDIUM',
    "duration" INTEGER NOT NULL,
    "status" "TestStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "examType" "ExamType",
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "authorId" TEXT,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("testId")
);

-- CreateTable
CREATE TABLE "TestSection" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "maxQuestions" INTEGER,
    "correctMarks" DOUBLE PRECISION,
    "negativeMarks" DOUBLE PRECISION,

    CONSTRAINT "TestSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestQuestion" (
    "questionId" TEXT NOT NULL,
    "testSectionId" TEXT NOT NULL,

    CONSTRAINT "TestQuestion_pkey" PRIMARY KEY ("testSectionId","questionId")
);

-- CreateTable
CREATE TABLE "TestParticipation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "score" INTEGER DEFAULT 0,
    "status" "TestParticipationStatus" NOT NULL DEFAULT 'JOIN',
    "accuracy" DOUBLE PRECISION DEFAULT 0,
    "timing" INTEGER DEFAULT 0,
    "maxStreakCorrect" INTEGER DEFAULT 0,
    "maxStreakWrong" INTEGER DEFAULT 0,
    "cntMinmize" INTEGER DEFAULT 0,
    "cntAnsweredMark" INTEGER DEFAULT 0,
    "cntAnswered" INTEGER DEFAULT 0,
    "cntNotAnswered" INTEGER DEFAULT 0,
    "cntMarkForReview" INTEGER DEFAULT 0,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metricType" "MetricType" NOT NULL,
    "currentValue" INTEGER NOT NULL,
    "previousValue" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectMastery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SubjectMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicMastery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "strengthIndex" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TopicMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubtopicMastery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "strengthIndex" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SubtopicMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "lastReviewedAt" TIMESTAMP(3) NOT NULL,
    "nextReviewAt" TIMESTAMP(3) NOT NULL,
    "reviewInterval" INTEGER,
    "retentionStrength" DOUBLE PRECISION NOT NULL,
    "completedReviews" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReviewSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasteryHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "strengthIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasteryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badgeName" TEXT NOT NULL,
    "badgeDescription" TEXT NOT NULL,
    "criteriaValue" INTEGER NOT NULL,
    "coinReward" INTEGER NOT NULL DEFAULT 0,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT,
    "message" TEXT,
    "earnCoin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoinTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SuggestionType" NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "suggestion" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "displayUntil" TIMESTAMP(3),
    "actionName" TEXT,
    "actionUrl" TEXT,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudySuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "duration" INTEGER NOT NULL,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount" DOUBLE PRECISION NOT NULL,
    "maxUsageCount" INTEGER,
    "currentUsageCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "duration" INTEGER,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "provider" "PaymentProvider" NOT NULL,
    "providerId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "discountApplied" DOUBLE PRECISION DEFAULT 0,
    "promoCodeUsed" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "orderId" TEXT,
    "paymentMethod" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlanPromoCodes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_stream_idx" ON "User"("stream");

-- CreateIndex
CREATE INDEX "User_targetYear_idx" ON "User"("targetYear");

-- CreateIndex
CREATE INDEX "User_xp_idx" ON "User"("xp");

-- CreateIndex
CREATE UNIQUE INDEX "UserPerformance_userId_key" ON "UserPerformance"("userId");

-- CreateIndex
CREATE INDEX "UserPerformance_accuracy_idx" ON "UserPerformance"("accuracy");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStudyTopic_userId_subjectId_topicId_key" ON "CurrentStudyTopic"("userId", "subjectId", "topicId");

-- CreateIndex
CREATE INDEX "Exam_name_idx" ON "Exam"("name");

-- CreateIndex
CREATE INDEX "Exam_examDate_idx" ON "Exam"("examDate");

-- CreateIndex
CREATE INDEX "ExamSubject_subjectId_idx" ON "ExamSubject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_stream_key" ON "Subject"("name", "stream");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_shortName_stream_key" ON "Subject"("shortName", "stream");

-- CreateIndex
CREATE INDEX "Topic_subjectId_orderIndex_idx" ON "Topic"("subjectId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_subjectId_key" ON "Topic"("name", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_subjectId_key" ON "Topic"("slug", "subjectId");

-- CreateIndex
CREATE INDEX "SubTopic_topicId_orderIndex_idx" ON "SubTopic"("topicId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "SubTopic_name_topicId_key" ON "SubTopic"("name", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "SubTopic_slug_topicId_key" ON "SubTopic"("slug", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_slug_key" ON "Question"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionInsights_questionId_key" ON "QuestionInsights"("questionId");

-- CreateIndex
CREATE INDEX "Attempt_userId_questionId_idx" ON "Attempt"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TestParticipation_userId_testId_key" ON "TestParticipation"("userId", "testId");

-- CreateIndex
CREATE UNIQUE INDEX "Metric_userId_metricType_key" ON "Metric"("userId", "metricType");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectMastery_userId_subjectId_key" ON "SubjectMastery"("userId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicMastery_userId_topicId_key" ON "TopicMastery"("userId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "SubtopicMastery_userId_subtopicId_key" ON "SubtopicMastery"("userId", "subtopicId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewSchedule_userId_topicId_key" ON "ReviewSchedule"("userId", "topicId");

-- CreateIndex
CREATE INDEX "MasteryHistory_userId_subjectId_recordedAt_idx" ON "MasteryHistory"("userId", "subjectId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_type_key" ON "Achievement"("type");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_unlockedAt_idx" ON "UserAchievement"("userId", "unlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "CoinTransaction_userId_createdAt_idx" ON "CoinTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StudySuggestion_userId_status_createdAt_idx" ON "StudySuggestion"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "StudySuggestion_userId_triggerType_idx" ON "StudySuggestion"("userId", "triggerType");

-- CreateIndex
CREATE INDEX "Notification_type_createdAt_idx" ON "Notification"("type", "createdAt");

-- CreateIndex
CREATE INDEX "UserNotification_userId_status_idx" ON "UserNotification"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotification_userId_notificationId_key" ON "UserNotification"("userId", "notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE INDEX "Plan_isActive_idx" ON "Plan"("isActive");

-- CreateIndex
CREATE INDEX "Plan_name_duration_idx" ON "Plan"("name", "duration");

-- CreateIndex
CREATE INDEX "Plan_name_idx" ON "Plan"("name");

-- CreateIndex
CREATE INDEX "Plan_id_idx" ON "Plan"("id");

-- CreateIndex
CREATE INDEX "Plan_name_duration_isActive_idx" ON "Plan"("name", "duration", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_id_name_key" ON "Plan"("id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_PlanPromoCodes_AB_unique" ON "_PlanPromoCodes"("A", "B");

-- CreateIndex
CREATE INDEX "_PlanPromoCodes_B_index" ON "_PlanPromoCodes"("B");

-- AddForeignKey
ALTER TABLE "UserPerformance" ADD CONSTRAINT "UserPerformance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentStudyTopic" ADD CONSTRAINT "CurrentStudyTopic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentStudyTopic" ADD CONSTRAINT "CurrentStudyTopic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentStudyTopic" ADD CONSTRAINT "CurrentStudyTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubject" ADD CONSTRAINT "ExamSubject_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubject" ADD CONSTRAINT "ExamSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTopic" ADD CONSTRAINT "SubTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "SubTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCategory" ADD CONSTRAINT "QuestionCategory_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionInsights" ADD CONSTRAINT "QuestionInsights_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_testParticipationId_fkey" FOREIGN KEY ("testParticipationId") REFERENCES "TestParticipation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_practiceSessionId_fkey" FOREIGN KEY ("practiceSessionId") REFERENCES "PracticeSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSessionQuestions" ADD CONSTRAINT "PracticeSessionQuestions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSessionQuestions" ADD CONSTRAINT "PracticeSessionQuestions_practiceSessionId_fkey" FOREIGN KEY ("practiceSessionId") REFERENCES "PracticeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSection" ADD CONSTRAINT "TestSection_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("testId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_testSectionId_fkey" FOREIGN KEY ("testSectionId") REFERENCES "TestSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestParticipation" ADD CONSTRAINT "TestParticipation_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("testId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestParticipation" ADD CONSTRAINT "TestParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectMastery" ADD CONSTRAINT "SubjectMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectMastery" ADD CONSTRAINT "SubjectMastery_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicMastery" ADD CONSTRAINT "TopicMastery_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicMastery" ADD CONSTRAINT "TopicMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubtopicMastery" ADD CONSTRAINT "SubtopicMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubtopicMastery" ADD CONSTRAINT "SubtopicMastery_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "SubTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_userId_topicId_fkey" FOREIGN KEY ("userId", "topicId") REFERENCES "TopicMastery"("userId", "topicId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryHistory" ADD CONSTRAINT "MasteryHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryHistory" ADD CONSTRAINT "MasteryHistory_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySuggestion" ADD CONSTRAINT "StudySuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanPromoCodes" ADD CONSTRAINT "_PlanPromoCodes_A_fkey" FOREIGN KEY ("A") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanPromoCodes" ADD CONSTRAINT "_PlanPromoCodes_B_fkey" FOREIGN KEY ("B") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
