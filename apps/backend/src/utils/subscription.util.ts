/**
 * Create a trial subscription for new users
 */
export const createTrialSubscription = () => ({
  status: "TRIAL" as const,
  provider: "NONE" as const,
  duration: 30, // 30 days trial period
  amount: 0,
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});
