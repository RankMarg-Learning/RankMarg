/**
 * Utility functions for subscription expiry date calculations
 * Handles May-to-May annual cycles
 */

/**
 * Get May 1st of the current academic year
 * If current date is before May 1st, returns May 1st of previous year
 * Otherwise returns May 1st of current year
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
export function getSubscriptionExpiryDate(planDurationDays: number): Date {
  const currentMay = getCurrentMayStart();
  const nextMay = getNextMayStart();
  
  // Determine if it's a 1-year or 2-year plan
  // Assuming: 365 days = 1 year, 730 days = 2 years
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
 * Validate if a price calculation is correct and secure
 * @param requestedAmount - Amount user is trying to pay
 * @param planFullPrice - Full plan price
 * @param couponDiscount - Coupon discount percentage (0-100)
 * @param defaultDiscount - Default discount percentage (0-100)
 * @returns Object with isValid and calculatedPrice
 */
export function validatePrice(
  requestedAmount: number,
  planFullPrice: number,
  couponDiscount: number = 0,
  defaultDiscount: number = 0
): { isValid: boolean; calculatedPrice: number; error?: string } {
  // Apply default discount first, then coupon discount
  const priceAfterDefaultDiscount = planFullPrice * (1 - defaultDiscount / 100);
  const discountedPrice = priceAfterDefaultDiscount * (1 - couponDiscount / 100);
  const finalPrice = Math.round(discountedPrice);
  
  // Allow small rounding differences (up to 1 rupee)
  const priceDifference = Math.abs(requestedAmount - finalPrice);
  
  if (priceDifference > 1) {
    return {
      isValid: false,
      calculatedPrice: finalPrice,
      error: `Price mismatch. Expected: ₹${finalPrice}, Got: ₹${requestedAmount}`,
    };
  }
  
  return {
    isValid: true,
    calculatedPrice: finalPrice,
  };
}

