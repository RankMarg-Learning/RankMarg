-- DropIndex
DROP INDEX "CurrentStudyTopic_userId_isCompleted_startedAt_idx";

-- DropIndex
DROP INDEX "Exam_name_idx";

-- DropIndex
DROP INDEX "ExamUser_userId_idx";

-- DropIndex
DROP INDEX "Plan_id_idx";

-- DropIndex
DROP INDEX "Plan_name_duration_idx";

-- DropIndex
DROP INDEX "Plan_name_duration_isActive_idx";

-- DropIndex
DROP INDEX "Plan_name_idx";

-- DropIndex
DROP INDEX "PracticeSessionQuestions_questionId_idx";

-- DropIndex
DROP INDEX "StudySuggestion_userId_triggerType_idx";

-- DropIndex
DROP INDEX "Subscription_planId_idx";

-- DropIndex
DROP INDEX "Test_authorId_idx";

-- DropIndex
DROP INDEX "User_xp_idx";

-- CreateIndex
CREATE INDEX "Achievement_type_idx" ON "Achievement"("type");

-- CreateIndex
CREATE INDEX "Attempt_userId_status_idx" ON "Attempt"("userId", "status");

-- CreateIndex
CREATE INDEX "Attempt_solvedAt_idx" ON "Attempt"("solvedAt");

-- CreateIndex
CREATE INDEX "Attempt_questionId_idx" ON "Attempt"("questionId");

-- CreateIndex
CREATE INDEX "Attempt_status_idx" ON "Attempt"("status");

-- CreateIndex
CREATE INDEX "Attempt_userId_timing_idx" ON "Attempt"("userId", "timing");

-- CreateIndex
CREATE INDEX "Attempt_userId_status_solvedAt_idx" ON "Attempt"("userId", "status", "solvedAt");

-- CreateIndex
CREATE INDEX "Attempt_practiceSessionId_type_solvedAt_idx" ON "Attempt"("practiceSessionId", "type", "solvedAt");

-- CreateIndex
CREATE INDEX "CoinTransaction_type_idx" ON "CoinTransaction"("type");

-- CreateIndex
CREATE INDEX "CurrentStudyTopic_userId_isCurrent_idx" ON "CurrentStudyTopic"("userId", "isCurrent");

-- CreateIndex
CREATE INDEX "CurrentStudyTopic_userId_isCompleted_idx" ON "CurrentStudyTopic"("userId", "isCompleted");

-- CreateIndex
CREATE INDEX "CurrentStudyTopic_userId_isCompleted_isCurrent_idx" ON "CurrentStudyTopic"("userId", "isCompleted", "isCurrent");

-- CreateIndex
CREATE INDEX "Exam_isActive_idx" ON "Exam"("isActive");

-- CreateIndex
CREATE INDEX "Exam_registrationStartAt_idx" ON "Exam"("registrationStartAt");

-- CreateIndex
CREATE INDEX "Exam_registrationEndAt_idx" ON "Exam"("registrationEndAt");

-- CreateIndex
CREATE INDEX "ExamSubject_examCode_idx" ON "ExamSubject"("examCode");

-- CreateIndex
CREATE INDEX "ExamUser_registeredAt_idx" ON "ExamUser"("registeredAt");

-- CreateIndex
CREATE INDEX "MasteryHistory_userId_recordedAt_idx" ON "MasteryHistory"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "Metric_userId_metricType_idx" ON "Metric"("userId", "metricType");

-- CreateIndex
CREATE INDEX "Option_isCorrect_idx" ON "Option"("isCorrect");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_userId_status_idx" ON "Payment"("userId", "status");

-- CreateIndex
CREATE INDEX "Payment_subscriptionId_status_idx" ON "Payment"("subscriptionId", "status");

-- CreateIndex
CREATE INDEX "Plan_amount_idx" ON "Plan"("amount");

-- CreateIndex
CREATE INDEX "Plan_duration_idx" ON "Plan"("duration");

-- CreateIndex
CREATE INDEX "PracticeSession_userId_isCompleted_idx" ON "PracticeSession"("userId", "isCompleted");

-- CreateIndex
CREATE INDEX "PracticeSession_subjectId_idx" ON "PracticeSession"("subjectId");

-- CreateIndex
CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_isActive_idx" ON "PromoCode"("isActive");

-- CreateIndex
CREATE INDEX "PromoCode_validUntil_idx" ON "PromoCode"("validUntil");

-- CreateIndex
CREATE INDEX "PromoCode_isActive_validUntil_idx" ON "PromoCode"("isActive", "validUntil");

-- CreateIndex
CREATE INDEX "Question_type_idx" ON "Question"("type");

-- CreateIndex
CREATE INDEX "Question_pyqYear_idx" ON "Question"("pyqYear");

-- CreateIndex
CREATE INDEX "Question_createdAt_idx" ON "Question"("createdAt");

-- CreateIndex
CREATE INDEX "Question_subjectId_difficulty_idx" ON "Question"("subjectId", "difficulty");

-- CreateIndex
CREATE INDEX "Question_subjectId_isPublished_idx" ON "Question"("subjectId", "isPublished");

-- CreateIndex
CREATE INDEX "Question_topicId_difficulty_idx" ON "Question"("topicId", "difficulty");

-- CreateIndex
CREATE INDEX "Question_topicId_isPublished_idx" ON "Question"("topicId", "isPublished");

-- CreateIndex
CREATE INDEX "QuestionCategory_category_idx" ON "QuestionCategory"("category");

-- CreateIndex
CREATE INDEX "QuestionInsights_accuracy_idx" ON "QuestionInsights"("accuracy");

-- CreateIndex
CREATE INDEX "QuestionInsights_totalAttempts_idx" ON "QuestionInsights"("totalAttempts");

-- CreateIndex
CREATE INDEX "ReviewSchedule_nextReviewAt_idx" ON "ReviewSchedule"("nextReviewAt");

-- CreateIndex
CREATE INDEX "ReviewSchedule_userId_nextReviewAt_idx" ON "ReviewSchedule"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "StudySuggestion_userId_type_idx" ON "StudySuggestion"("userId", "type");

-- CreateIndex
CREATE INDEX "StudySuggestion_displayUntil_idx" ON "StudySuggestion"("displayUntil");

-- CreateIndex
CREATE INDEX "SubTopic_id_idx" ON "SubTopic"("id");

-- CreateIndex
CREATE INDEX "Subject_name_idx" ON "Subject"("name");

-- CreateIndex
CREATE INDEX "Subject_id_idx" ON "Subject"("id");

-- CreateIndex
CREATE INDEX "SubjectMastery_userId_masteryLevel_idx" ON "SubjectMastery"("userId", "masteryLevel");

-- CreateIndex
CREATE INDEX "SubjectMastery_subjectId_masteryLevel_idx" ON "SubjectMastery"("subjectId", "masteryLevel");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "Subscription_trialEndsAt_idx" ON "Subscription"("trialEndsAt");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE INDEX "Subscription_status_currentPeriodEnd_idx" ON "Subscription"("status", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "SubtopicMastery_userId_masteryLevel_idx" ON "SubtopicMastery"("userId", "masteryLevel");

-- CreateIndex
CREATE INDEX "SubtopicMastery_subtopicId_masteryLevel_idx" ON "SubtopicMastery"("subtopicId", "masteryLevel");

-- CreateIndex
CREATE INDEX "Test_status_idx" ON "Test"("status");

-- CreateIndex
CREATE INDEX "Test_visibility_idx" ON "Test"("visibility");

-- CreateIndex
CREATE INDEX "Test_examCode_idx" ON "Test"("examCode");

-- CreateIndex
CREATE INDEX "Test_startTime_idx" ON "Test"("startTime");

-- CreateIndex
CREATE INDEX "Test_endTime_idx" ON "Test"("endTime");

-- CreateIndex
CREATE INDEX "Test_createdAt_idx" ON "Test"("createdAt");

-- CreateIndex
CREATE INDEX "Test_status_startTime_idx" ON "Test"("status", "startTime");

-- CreateIndex
CREATE INDEX "Test_visibility_status_idx" ON "Test"("visibility", "status");

-- CreateIndex
CREATE INDEX "TestParticipation_status_idx" ON "TestParticipation"("status");

-- CreateIndex
CREATE INDEX "TestParticipation_score_idx" ON "TestParticipation"("score");

-- CreateIndex
CREATE INDEX "TestParticipation_startTime_idx" ON "TestParticipation"("startTime");

-- CreateIndex
CREATE INDEX "TestParticipation_userId_status_idx" ON "TestParticipation"("userId", "status");

-- CreateIndex
CREATE INDEX "TestParticipation_testId_status_idx" ON "TestParticipation"("testId", "status");

-- CreateIndex
CREATE INDEX "TestParticipation_userId_startTime_idx" ON "TestParticipation"("userId", "startTime");

-- CreateIndex
CREATE INDEX "TestQuestion_testSectionId_idx" ON "TestQuestion"("testSectionId");

-- CreateIndex
CREATE INDEX "TestSection_testId_idx" ON "TestSection"("testId");

-- CreateIndex
CREATE INDEX "Topic_slug_idx" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_id_idx" ON "Topic"("id");

-- CreateIndex
CREATE INDEX "TopicMastery_userId_masteryLevel_idx" ON "TopicMastery"("userId", "masteryLevel");

-- CreateIndex
CREATE INDEX "TopicMastery_topicId_masteryLevel_idx" ON "TopicMastery"("topicId", "masteryLevel");

-- CreateIndex
CREATE INDEX "TopicMastery_userId_strengthIndex_idx" ON "TopicMastery"("userId", "strengthIndex");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "UserNotification_deliveredAt_idx" ON "UserNotification"("deliveredAt");

-- CreateIndex
CREATE INDEX "UserPerformance_highestScore_idx" ON "UserPerformance"("highestScore");

-- CreateIndex
CREATE INDEX "UserPerformance_lastExamDate_idx" ON "UserPerformance"("lastExamDate");

-- CreateIndex
CREATE INDEX "UserPerformance_userId_idx" ON "UserPerformance"("userId");

-- CreateIndex
CREATE INDEX "activity_userId_createdAt_idx" ON "activity"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_type_idx" ON "activity"("type");
