import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Configuration
const BATCH_SIZE = {
  USERS: 10,
  SUBJECTS: 5,
  TOPICS: 10,
  SUBTOPICS: 25,
  QUESTIONS: 50,
  CATEGORIES: 100,
  EXAMS: 2,
  EXAM_RELATIONS: 5,
  PLANS: 2,
  PROMO_CODES: 5,
  SUBSCRIPTIONS: 5,
  PAYMENTS: 10,
  USER_PERFORMANCES: 5,
  METRICS: 25,
  MASTERY: 10,
  SESSIONS: 20,
  ATTEMPTS: 200,
} as const;

// Utility function for batch processing
async function processBatch<T>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<void>,
  entityName: string,
  emoji: string
): Promise<number> {
  let processed = 0;
  const total = items.length;

  console.log(`\n${emoji} Processing ${total} ${entityName}...`);

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    await Promise.all(batch.map(processor));

    processed += batch.length;
    const progress = Math.round((processed / total) * 100);

    console.log(
      `  ${emoji} Batch ${Math.floor(i / batchSize) + 1}: ${processed}/${total} ${entityName} (${progress}%)`
    );
  }

  console.log(`✅ ${entityName} completed: ${processed} processed\n`);
  return processed;
}

function readJsonArraySafe<T = any>(filePath: string): T[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as T[];
    return [];
  } catch (error) {
    console.error(`❌ Failed to read ${filePath}:`, error);
    return [];
  }
}

// Helper function to convert various date formats to ISO-8601
function normalizeDate(
  dateString: string | Date | null | undefined
): Date | null {
  if (!dateString) return null;

  try {
    // If it's already a Date object, return it
    if (
      dateString &&
      typeof dateString === "object" &&
      dateString instanceof Date
    ) {
      return dateString;
    }

    // At this point, dateString should be a string (since we checked for Date above)
    const dateStr = dateString as string;

    // If it's already a valid ISO string, parse it
    if (dateStr.includes("T") || dateStr.includes("Z")) {
      return new Date(dateStr);
    }

    // Handle "YYYY-MM-DD HH:mm:ss.sss" format (from the error)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
      return new Date(dateStr.replace(" ", "T") + "Z");
    }

    // Handle "YYYY-MM-DD HH:mm:ss" format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      return new Date(dateStr.replace(" ", "T") + ".000Z");
    }

    // Handle "YYYY-MM-DD" date-only format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(dateStr + "T00:00:00.000Z");
    }

    // Fallback: try to parse as-is
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    console.warn(`⚠️ Could not parse date: "${dateStr}"`);
    return null;
  } catch (error) {
    console.warn(`⚠️ Error parsing date "${dateString}":`, error);
    return null;
  }
}

// Function to normalize date fields in objects
function normalizeDateFields(obj: Record<string, any>): Record<string, any> {
  const dateFields = [
    "createdAt",
    "updatedAt",
    "paidAt",
    "registeredAt",
    "startTime",
    "endTime",
    "lastExamDate",
    "startedAt",
    "solvedAt",
    "lastReviewedAt",
    "nextReviewAt",
    "recordedAt",
    "deliveredAt",
    "readAt",
    "validFrom",
    "validUntil",
    "registrationStartAt",
    "registrationEndAt",
    "examDate",
    "currentPeriodEnd",
    "trialEndsAt",
    "displayUntil",
  ];

  const normalized = { ...obj };

  for (const field of dateFields) {
    if (normalized[field]) {
      const normalizedDate = normalizeDate(normalized[field]);
      if (normalizedDate) {
        normalized[field] = normalizedDate;
      }
    }
  }

  return normalized;
}

async function importFromDumpDir() {
  const baseDir = path.join(__dirname, "json", "7-9-25");
  console.log(`📁 Importing dump from: ${baseDir}`);

  const file = (name: string) => path.join(baseDir, `${name}.json`);

  // Load and normalize date fields for all entities
  const Users = readJsonArraySafe(file("User")).map(
    normalizeDateFields
  ) as any[];
  const Subjects = readJsonArraySafe(file("Subject")).map(
    normalizeDateFields
  ) as any[];
  const Topics = readJsonArraySafe(file("Topic")).map(
    normalizeDateFields
  ) as any[];
  const SubTopics = readJsonArraySafe(file("SubTopic")).map(
    normalizeDateFields
  ) as any[];
  const Questions = readJsonArraySafe(file("Question")).map(
    normalizeDateFields
  ) as any[];
  const Options = readJsonArraySafe(file("Option")).map(
    normalizeDateFields
  ) as any[];
  const QuestionCategories = readJsonArraySafe(file("QuestionCategory")).map(
    normalizeDateFields
  ) as any[];
  const Exams = readJsonArraySafe(file("Exam")).map(
    normalizeDateFields
  ) as any[];
  const ExamSubjects = readJsonArraySafe(file("ExamSubject")).map(
    normalizeDateFields
  ) as any[];
  const ExamUsers = readJsonArraySafe(file("ExamUser")).map(
    normalizeDateFields
  ) as any[];
  const Plans = readJsonArraySafe(file("Plan")).map(
    normalizeDateFields
  ) as any[];
  const PromoCodes = readJsonArraySafe(file("PromoCode")).map(
    normalizeDateFields
  ) as any[];
  const Subscriptions = readJsonArraySafe(file("Subscription")).map(
    normalizeDateFields
  ) as any[];
  const Payments = readJsonArraySafe(file("Payment")).map(
    normalizeDateFields
  ) as any[];
  const UserPerformances = readJsonArraySafe(file("UserPerformance")).map(
    normalizeDateFields
  ) as any[];
  const Metrics = readJsonArraySafe(file("Metric")).map(
    normalizeDateFields
  ) as any[];
  const SubjectMasteries = readJsonArraySafe(file("SubjectMastery")).map(
    normalizeDateFields
  ) as any[];
  const TopicMasteries = readJsonArraySafe(file("TopicMastery")).map(
    normalizeDateFields
  ) as any[];
  const SubtopicMasteries = readJsonArraySafe(file("SubtopicMastery")).map(
    normalizeDateFields
  ) as any[];
  const ReviewSchedules = readJsonArraySafe(file("ReviewSchedule")).map(
    normalizeDateFields
  ) as any[];
  const MasteryHistories = readJsonArraySafe(file("MasteryHistory")).map(
    normalizeDateFields
  ) as any[];
  const PracticeSessions = readJsonArraySafe(file("PracticeSession")).map(
    normalizeDateFields
  ) as any[];
  const PracticeSessionQuestions = readJsonArraySafe(
    file("PracticeSessionQuestions")
  ).map(normalizeDateFields) as any[];
  const Attempts = readJsonArraySafe(file("Attempt")).map(
    normalizeDateFields
  ) as any[];
  const StudySuggestions = readJsonArraySafe(file("StudySuggestion")).map(
    normalizeDateFields
  ) as any[];
  const CurrentStudyTopics = readJsonArraySafe(file("CurrentStudyTopic")).map(
    normalizeDateFields
  ) as any[];

  console.log("🚀 Starting Data Import Process");
  console.log("=".repeat(80));
  console.log("📊 LOADED DATA SUMMARY (with Date Normalization):");
  console.log(
    JSON.stringify(
      {
        "👥 Users": Users.length,
        "📚 Subjects": Subjects.length,
        "📖 Topics": Topics.length,
        "📝 SubTopics": SubTopics.length,
        "❓ Questions": Questions.length,
        "🔘 Options": Options.length,
        "🏷️ QuestionCategories": QuestionCategories.length,
        "📋 Exams": Exams.length,
        "🔗 ExamSubjects": ExamSubjects.length,
        "👨‍🎓 ExamUsers": ExamUsers.length,
        "💳 Plans": Plans.length,
        "🎫 PromoCodes": PromoCodes.length,
        "📄 Subscriptions": Subscriptions.length,
        "💰 Payments": Payments.length,
        "📈 UserPerformances": UserPerformances.length,
        "📊 Metrics": Metrics.length,
        "🎯 SubjectMasteries": SubjectMasteries.length,
        "🎯 TopicMasteries": TopicMasteries.length,
        "🎯 SubtopicMasteries": SubtopicMasteries.length,
        "📅 ReviewSchedules": ReviewSchedules.length,
        "📈 MasteryHistories": MasteryHistories.length,
        "🏃 PracticeSessions": PracticeSessions.length,
        "❓ PracticeSessionQuestions": PracticeSessionQuestions.length,
        "📝 Attempts": Attempts.length,
        "💡 StudySuggestions": StudySuggestions.length,
        "🎯 CurrentStudyTopics": CurrentStudyTopics.length,
      },
      null,
      2
    )
  );
  console.log("=".repeat(80));
  console.log("🔄 Starting data insertion process (dates normalized)...\n");

  // Show a sample of normalized dates to verify
  if (PromoCodes.length > 0) {
    console.log("📅 Sample normalized dates:");
    const sample = PromoCodes[0];
    if (sample.validFrom) console.log(`  🎫 validFrom: ${sample.validFrom}`);
    if (sample.validUntil) console.log(`  🎫 validUntil: ${sample.validUntil}`);
    if (sample.createdAt) console.log(`  🎫 createdAt: ${sample.createdAt}`);
    console.log("");
  }

  // ============================================
  // PHASE 1: USER MANAGEMENT
  // ============================================
  console.log("👥 PHASE 1: USER MANAGEMENT");

  const usersProcessed = await processBatch(
    Users,
    BATCH_SIZE.USERS,
    async (user) => {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: user,
      });
    },
    "users",
    "👤"
  );

  // ============================================
  // PHASE 2: CORE TAXONOMY
  // ============================================
  console.log("📚 PHASE 2: CORE TAXONOMY");

  const subjectsProcessed = await processBatch(
    Subjects,
    BATCH_SIZE.SUBJECTS,
    async (subject) => {
      await prisma.subject.upsert({
        where: { id: subject.id },
        update: {},
        create: subject,
      });
    },
    "subjects",
    "📚"
  );

  const topicsProcessed = await processBatch(
    Topics,
    BATCH_SIZE.TOPICS,
    async (topic) => {
      await prisma.topic.upsert({
        where: { id: topic.id },
        update: {},
        create: topic,
      });
    },
    "topics",
    "📖"
  );

  const subTopicsProcessed = await processBatch(
    SubTopics,
    BATCH_SIZE.SUBTOPICS,
    async (subTopic) => {
      await prisma.subTopic.upsert({
        where: { id: subTopic.id },
        update: {},
        create: subTopic,
      });
    },
    "subtopics",
    "📝"
  );

  console.log(
    `📊 Taxonomy Summary: ${subjectsProcessed} subjects, ${topicsProcessed} topics, ${subTopicsProcessed} subtopics\n`
  );

  // Group options by questionId
  const optionsByQuestionId = Options.reduce(
    (acc, opt) => {
      if (!acc[opt.questionId]) {
        acc[opt.questionId] = [];
      }
      acc[opt.questionId].push(opt);
      return acc;
    },
    {} as Record<string, any[]>
  );

  // ============================================
  // PHASE 3: QUESTIONS & OPTIONS
  // ============================================
  console.log("❓ PHASE 3: QUESTIONS & OPTIONS");

  let totalOptions = 0;
  const questionsProcessed = await processBatch(
    Questions,
    BATCH_SIZE.QUESTIONS,
    async (question) => {
      const relatedOptions = optionsByQuestionId[question.id] || [];

      await prisma.question.upsert({
        where: { id: question.id },
        update: {},
        create: {
          ...question,
          options: {
            create: relatedOptions.map((opt) => ({
              id: opt.id,
              content: opt.content,
              isCorrect: opt.isCorrect,
            })),
          },
        },
      });

      totalOptions += relatedOptions.length;
    },
    "questions",
    "❓"
  );

  console.log(
    `📊 Questions Summary: ${questionsProcessed} questions with ${totalOptions} options\n`
  );

  // ============================================
  // PHASE 4: QUESTION CATEGORIES
  // ============================================
  console.log("🏷️ PHASE 4: QUESTION CATEGORIES");

  console.log("📝 Filtering QuestionCategories...");
  const validQuestionIds = new Set(Questions.map((q) => q.id));
  const validCategories = QuestionCategories.filter((c) =>
    validQuestionIds.has(c.questionId)
  );

  console.log(
    `📊 QuestionCategories: ${QuestionCategories.length} total, ${validCategories.length} valid (${QuestionCategories.length - validCategories.length} filtered out)`
  );

  const categoriesProcessed = await processBatch(
    validCategories,
    BATCH_SIZE.CATEGORIES,
    async (category) => {
      await prisma.questionCategory.upsert({
        where: {
          questionId_category: {
            questionId: category.questionId,
            category: category.category,
          },
        },
        update: {},
        create: category,
      });
    },
    "question categories",
    "🏷️"
  );

  // ============================================
  // PHASE 5: EXAMS & REGISTRATIONS
  // ============================================
  console.log("📋 PHASE 5: EXAMS & REGISTRATIONS");

  const examsProcessed = await processBatch(
    Exams,
    BATCH_SIZE.EXAMS,
    async (exam) => {
      await prisma.exam.upsert({
        where: { code: exam.code },
        update: {},
        create: exam,
      });
    },
    "exams",
    "📋"
  );

  const examSubjectsProcessed = await processBatch(
    ExamSubjects,
    BATCH_SIZE.EXAM_RELATIONS,
    async (examSubject) => {
      await prisma.examSubject.upsert({
        where: {
          examCode_subjectId: {
            examCode: examSubject.examCode,
            subjectId: examSubject.subjectId,
          },
        },
        update: { weightage: examSubject.weightage },
        create: examSubject,
      });
    },
    "exam-subject relations",
    "🔗"
  );

  const examUsersProcessed = await processBatch(
    ExamUsers,
    BATCH_SIZE.EXAM_RELATIONS,
    async (examUser) => {
      await prisma.examUser.upsert({
        where: {
          userId_examCode: {
            userId: examUser.userId,
            examCode: examUser.examCode,
          },
        },
        update: {},
        create: examUser,
      });
    },
    "exam registrations",
    "👨‍🎓"
  );

  console.log(
    `📊 Exams Summary: ${examsProcessed} exams, ${examSubjectsProcessed} relations, ${examUsersProcessed} registrations\n`
  );

  // ============================================
  // PHASE 6: SUBSCRIPTION MANAGEMENT
  // ============================================
  console.log("💳 PHASE 6: SUBSCRIPTION MANAGEMENT");

  const plansProcessed = await processBatch(
    Plans,
    BATCH_SIZE.PLANS,
    async (plan) => {
      await prisma.plan.upsert({
        where: { id: plan.id },
        update: {},
        create: plan,
      });
    },
    "plans",
    "💳"
  );

  const promoCodesProcessed = await processBatch(
    PromoCodes,
    BATCH_SIZE.PROMO_CODES,
    async (promoCode) => {
      await prisma.promoCode.upsert({
        where: { id: promoCode.id },
        update: {},
        create: promoCode,
      });
    },
    "promo codes",
    "🎫"
  );

  const subscriptionsProcessed = await processBatch(
    Subscriptions,
    BATCH_SIZE.SUBSCRIPTIONS,
    async (subscription) => {
      await prisma.subscription.upsert({
        where: { userId: subscription.userId },
        update: {},
        create: subscription,
      });
    },
    "subscriptions",
    "📄"
  );

  const paymentsProcessed = await processBatch(
    Payments,
    BATCH_SIZE.PAYMENTS,
    async (payment) => {
      await prisma.payment.upsert({
        where: { id: payment.id },
        update: {},
        create: payment,
      });
    },
    "payments",
    "💰"
  );

  console.log(
    `📊 Subscription Summary: ${plansProcessed} plans, ${promoCodesProcessed} promo codes, ${subscriptionsProcessed} subscriptions, ${paymentsProcessed} payments\n`
  );

  // Performance & Mastery
  console.log("📈 PHASE 7: PERFORMANCE & MASTERY TRACKING");
  console.log("📝 Inserting UserPerformance...");
  let userPerfCount = 0;
  const totalUserPerformances = UserPerformances.length;
  for (const up of UserPerformances) {
    try {
      await prisma.userPerformance.upsert({
        where: { userId: up.userId },
        update: {},
        create: up,
      });
      userPerfCount++;
      if (userPerfCount % 5 === 0 || userPerfCount === totalUserPerformances) {
        const progress = Math.round(
          (userPerfCount / totalUserPerformances) * 100
        );
        console.log(
          `  📊 Processed ${userPerfCount}/${totalUserPerformances} user performances (${progress}%)`
        );
      }
    } catch (error) {
      console.error(`❌ UserPerformance user=${up.userId}:`, error);
    }
  }

  console.log("📝 Inserting Metrics...");
  let metricCount = 0;
  const totalMetrics = Metrics.length;
  for (const m of Metrics) {
    try {
      await prisma.metric.upsert({
        where: {
          userId_metricType: { userId: m.userId, metricType: m.metricType },
        },
        update: {
          currentValue: m.currentValue,
          previousValue: m.previousValue,
        },
        create: m,
      });
      metricCount++;
      if (metricCount % 25 === 0 || metricCount === totalMetrics) {
        const progress = Math.round((metricCount / totalMetrics) * 100);
        console.log(
          `  📈 Processed ${metricCount}/${totalMetrics} metrics (${progress}%)`
        );
      }
    } catch (error) {
      console.error(`❌ Metric user=${m.userId} type=${m.metricType}:`, error);
    }
  }

  console.log("📝 Inserting SubjectMastery...");
  for (const sm of SubjectMasteries) {
    try {
      await prisma.subjectMastery.upsert({
        where: {
          userId_subjectId: { userId: sm.userId, subjectId: sm.subjectId },
        },
        update: {
          masteryLevel: sm.masteryLevel,
          totalAttempts: sm.totalAttempts,
          correctAttempts: sm.correctAttempts,
        },
        create: sm,
      });
    } catch (error) {
      console.error(
        `❌ SubjectMastery user=${sm.userId} subject=${sm.subjectId}`,
        error
      );
    }
  }

  console.log("📝 Inserting TopicMastery...");
  for (const tm of TopicMasteries) {
    try {
      await prisma.topicMastery.upsert({
        where: { userId_topicId: { userId: tm.userId, topicId: tm.topicId } },
        update: {
          masteryLevel: tm.masteryLevel,
          strengthIndex: tm.strengthIndex,
          totalAttempts: tm.totalAttempts,
          correctAttempts: tm.correctAttempts,
        },
        create: tm,
      });
    } catch (error) {
      console.error(
        `❌ TopicMastery user=${tm.userId} topic=${tm.topicId}`,
        error
      );
    }
  }

  console.log("📝 Inserting SubtopicMastery...");
  for (const stm of SubtopicMasteries) {
    try {
      await prisma.subtopicMastery.upsert({
        where: {
          userId_subtopicId: { userId: stm.userId, subtopicId: stm.subtopicId },
        },
        update: {
          masteryLevel: stm.masteryLevel,
          strengthIndex: stm.strengthIndex,
          totalAttempts: stm.totalAttempts,
          correctAttempts: stm.correctAttempts,
        },
        create: stm,
      });
    } catch (error) {
      console.error(
        `❌ SubtopicMastery user=${stm.userId} subtopic=${stm.subtopicId}`,
        error
      );
    }
  }

  console.log("📝 Inserting ReviewSchedule...");
  for (const rs of ReviewSchedules) {
    try {
      await prisma.reviewSchedule.upsert({
        where: { userId_topicId: { userId: rs.userId, topicId: rs.topicId } },
        update: {
          lastReviewedAt: rs.lastReviewedAt,
          nextReviewAt: rs.nextReviewAt,
          reviewInterval: rs.reviewInterval,
          retentionStrength: rs.retentionStrength,
          completedReviews: rs.completedReviews,
        },
        create: rs,
      });
    } catch (error) {
      console.error(
        `❌ ReviewSchedule user=${rs.userId} topic=${rs.topicId}`,
        error
      );
    }
  }

  console.log("📝 Inserting MasteryHistory...");
  for (const mh of MasteryHistories) {
    try {
      await prisma.masteryHistory.upsert({
        where: { id: mh.id },
        update: {},
        create: mh,
      });
    } catch (error) {
      console.error(`❌ MasteryHistory ${mh.id}`, error);
    }
  }

  // Practice Sessions
  console.log("📝 Inserting PracticeSessions...");
  for (const ps of PracticeSessions) {
    try {
      await prisma.practiceSession.upsert({
        where: { id: ps.id },
        update: {},
        create: ps,
      });
    } catch (error) {
      console.error(`❌ PracticeSession ${ps.id}`, error);
    }
  }

  // PracticeSessionQuestions (filter valid ones)
  console.log("📝 Filtering PracticeSessionQuestions...");
  const validPracticeSessionIds = new Set(PracticeSessions.map((ps) => ps.id));
  const validPSQ = PracticeSessionQuestions.filter(
    (psq) =>
      validPracticeSessionIds.has(psq.practiceSessionId) &&
      validQuestionIds.has(psq.questionId)
  );
  console.log(
    `📊 PracticeSessionQuestions: ${PracticeSessionQuestions.length} total, ${validPSQ.length} valid`
  );

  console.log("📝 Inserting PracticeSessionQuestions...");
  for (const psq of validPSQ) {
    try {
      await prisma.practiceSessionQuestions.upsert({
        where: {
          practiceSessionId_questionId: {
            practiceSessionId: psq.practiceSessionId,
            questionId: psq.questionId,
          },
        },
        update: {},
        create: psq,
      });
    } catch (error) {
      console.error(
        `❌ PracticeSessionQuestions session=${psq.practiceSessionId} question=${psq.questionId}`,
        error
      );
    }
  }

  // Study Suggestions & CurrentStudyTopic
  console.log("📝 Inserting StudySuggestions...");
  let studySuggestionCount = 0;
  const totalStudySuggestions = StudySuggestions.length;
  for (const ss of StudySuggestions) {
    try {
      await prisma.studySuggestion.upsert({
        where: { id: ss.id },
        update: {},
        create: ss,
      });
      studySuggestionCount++;
      if (
        studySuggestionCount % 20 === 0 ||
        studySuggestionCount === totalStudySuggestions
      ) {
        const progress = Math.round(
          (studySuggestionCount / totalStudySuggestions) * 100
        );
        console.log(
          `  💡 Processed ${studySuggestionCount}/${totalStudySuggestions} study suggestions (${progress}%)`
        );
      }
    } catch (error) {
      console.error(`❌ StudySuggestion ${ss.id}:`, error);
    }
  }

  // CurrentStudyTopic (filter valid ones)
  console.log("📝 Filtering CurrentStudyTopic...");
  const validUserIds = new Set(Users.map((u) => u.id));
  const validSubjectIds = new Set(Subjects.map((s) => s.id));
  const validTopicIds = new Set(Topics.map((t) => t.id));
  const validCST = CurrentStudyTopics.filter(
    (cst) =>
      validUserIds.has(cst.userId) &&
      validSubjectIds.has(cst.subjectId) &&
      validTopicIds.has(cst.topicId)
  );
  console.log(
    `📊 CurrentStudyTopic: ${CurrentStudyTopics.length} total, ${validCST.length} valid`
  );

  console.log("📝 Inserting CurrentStudyTopic...");
  let currentStudyTopicCount = 0;
  const totalCurrentStudyTopics = validCST.length;
  for (const cst of validCST) {
    try {
      await prisma.currentStudyTopic.upsert({
        where: { id: cst.id },
        update: {},
        create: cst,
      });
      currentStudyTopicCount++;
      if (
        currentStudyTopicCount % 10 === 0 ||
        currentStudyTopicCount === totalCurrentStudyTopics
      ) {
        const progress = Math.round(
          (currentStudyTopicCount / totalCurrentStudyTopics) * 100
        );
        console.log(
          `  🎯 Processed ${currentStudyTopicCount}/${totalCurrentStudyTopics} current study topics (${progress}%)`
        );
      }
    } catch (error) {
      console.error(`❌ CurrentStudyTopic ${cst.id}:`, error);
    }
  }

  // Attempts last (depends on several relations)
  console.log("📝 Filtering Attempts...");
  const validAttempts = Attempts.filter(
    (a) =>
      validUserIds.has(a.userId) &&
      validQuestionIds.has(a.questionId) &&
      (!a.practiceSessionId || validPracticeSessionIds.has(a.practiceSessionId))
  );
  console.log(
    `📊 Attempts: ${Attempts.length} total, ${validAttempts.length} valid`
  );

  console.log("📝 Inserting Attempts...");
  let aCount = 0;
  const totalAttempts = validAttempts.length;
  for (const a of validAttempts) {
    try {
      await prisma.attempt.upsert({
        where: { id: a.id },
        update: {},
        create: a,
      });
      aCount++;
      if (aCount % 200 === 0 || aCount === totalAttempts) {
        const progress = Math.round((aCount / totalAttempts) * 100);
        console.log(
          `  📝 Processed ${aCount}/${totalAttempts} attempts (${progress}%)`
        );
      }
    } catch (error) {
      console.error(`❌ Attempt ${a.id}:`, error);
    }
  }
  console.log(`✅ Attempts completed: ${aCount} attempts inserted\n`);
}

async function main() {
  await importFromDumpDir();
}

main()
  .catch((e) => {
    console.error("❌ FATAL ERROR during data import:", e);
    process.exit(1);
  })
  .finally(() => {
    console.log("\n" + "=".repeat(80));
    console.log("🎉 DATA IMPORT PROCESS COMPLETED!");
    console.log(
      "✅ Successfully processed all entities using optimized batch processing:"
    );
    console.log(
      "   👥 PHASE 1: Users - Batch processed with real-time progress"
    );
    console.log("   📚 PHASE 2: Taxonomy - Subjects, Topics, SubTopics");
    console.log("   ❓ PHASE 3: Questions & Options - Combined insertion");
    console.log("   🏷️ PHASE 4: Question Categories - Filtered and validated");
    console.log("   📋 PHASE 5: Exams & Registrations - Complete exam system");
    console.log(
      "   💳 PHASE 6: Subscription Management - Plans, Promos, Payments"
    );
    console.log("   📈 PHASE 7: Performance & Mastery - User analytics");
    console.log("   💡 Study Suggestions & Current Topics - User engagement");
    console.log("   📝 Attempts - Complete question attempt history");
    console.log(
      "📊 All data processed with batch optimization and date normalization."
    );
    console.log("=".repeat(80));
    prisma.$disconnect();
  });
