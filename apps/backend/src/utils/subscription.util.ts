import { TRIAL_PLAN_DURATION } from "@/constant";

/**
 * Create a trial subscription for new users
 */
export const createTrialSubscription = () => ({
  status: "TRIAL" as const,
  provider: "NONE" as const,
  duration: TRIAL_PLAN_DURATION,
  amount: 0,
  currentPeriodEnd: new Date(Date.now() + TRIAL_PLAN_DURATION * 24 * 60 * 60 * 1000),
});
