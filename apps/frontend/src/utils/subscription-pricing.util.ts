/**
 * Frontend utility functions for subscription expiry date calculations
 * Handles May-to-May annual cycles
 */

/**
 * Get May 1st of the current academic year
 */
export function getCurrentMayStart(): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  const may1stThisYear = new Date(currentYear, 4, 1); // Month 4 = May (0-indexed)
  
  if (now < may1stThisYear) {
    // Before May 1st, use previous year's May 1st
    return new Date(currentYear - 1, 4, 1);
  }
  
  return may1stThisYear;
}

/**
 * Get May 1st of the next academic year
 */
export function getNextMayStart(): Date {
  const currentMay = getCurrentMayStart();
  return new Date(currentMay.getFullYear() + 1, 4, 1);
}

/**
 * Get subscription expiry date based on plan duration
 * @param planDurationDays - Plan duration in days (365 for 1 year, 730 for 2 years)
 * @returns Expiry date (May 1st of the appropriate year)
 */
export function getSubscriptionExpiryDate(planDurationDays: number = 365): Date {
  const currentMay = getCurrentMayStart();
  const nextMay = getNextMayStart();
  
  // Determine if it's a 1-year or 2-year plan
  const isTwoYearPlan = planDurationDays >= 730 || planDurationDays > 365;
  
  if (isTwoYearPlan) {
    // 2-year plan: expires May 1st, 2 years from now
    return new Date(currentMay.getFullYear() + 2, 4, 1);
  } else {
    // 1-year plan: expires next May 1st
    return nextMay;
  }
}

/**
 * Format date to display format
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Get month name from date
 */
export function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long' });
}

