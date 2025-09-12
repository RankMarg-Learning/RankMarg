import dashboardRoutes from "./dashboard.routes";
import attemptRoutes from "./attempt.routes";
import currentTopicRoutes from "./currentTopic.routes";
import onboardingRoutes from "./onboarding.routes";
import masteryRoutes from "./mastery.routes";
import mistakeTrackerRoutes from "./mistakeTracker.route";
import practiceSessionRoutes from "./practiceSession.routes";
import testRoutes from "./test.routes";
import analyticsRoutes from "./analytics.routes";
import curriculumRoutes from "./topics.routes";
import topicsRoutes from "./topics.routes";
import subjectsRoutes from "./subjects.routes";
import subtopicsRoutes from "./subtopics.routes";
import questionRoutes from "./question.routes";
import authRoutes from "./auth.routes";
import suggestionRoutes from "./suggestion.routes";
import userRoutes from "./user.routes";
import miscRoutes from "./misc.routes";
import paymentRoutes from "./payment.routes";
import examRoutes from "./exam.routes";
import planRoutes from "./subscription/plan.routes";
import promoCodeRoutes from "./subscription/promoCode.routes";
// Add new routes here
export const routes = {
  auth: authRoutes,
  dashboard: dashboardRoutes,
  attempt: attemptRoutes,
  currentTopic: currentTopicRoutes,
  onboarding: onboardingRoutes,
  mastery: masteryRoutes,
  mistakeTracker: mistakeTrackerRoutes,
  practiceSession: practiceSessionRoutes,
  test: testRoutes,
  analytics: analyticsRoutes,
  curriculum: curriculumRoutes,
  topics: topicsRoutes,
  subjects: subjectsRoutes,
  subtopics: subtopicsRoutes,
  question: questionRoutes,
  suggestion: suggestionRoutes,
  user: userRoutes,
  misc: miscRoutes,
  payment: paymentRoutes,
  exam: examRoutes,
  plan: planRoutes,
  promoCode: promoCodeRoutes,
};
