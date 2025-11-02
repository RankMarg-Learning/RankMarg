"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { Check, ChevronDown, CreditCard, Shield, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import api from "@/utils/api";
import { planService, Plan } from "@/services/subscription.service";
import { subscription_progress, subscription_purchased } from '@/utils/analytics';
import Loading from "@/components/Loading";
import {
  getSubscriptionExpiryDate,
  formatDate,
} from "@/utils/subscription-pricing.util";
import { DEFAULT_PLAN_DISCOUNT } from "@/constant/pricing.constant";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface DisplayPlan {
  plandId: string;
  label: string;
  tillDate: Date;
  days: number;
  current: number;
  original: number;
}

const SubscriptionContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref_page = searchParams.get('ref');
  const plan_type = searchParams.get('plan');
  const planIdParam = searchParams.get('planId');
  const couponParam = searchParams.get('coupon');
  
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [coupon, setCoupon] = useState(couponParam || "");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [paying, setPaying] = useState(false);

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const apiPlans = await planService.getPlans({ status: 'active' });
        
        const mappedPlans: DisplayPlan[] = apiPlans.map((plan: Plan) => {
          const expiryDate = getSubscriptionExpiryDate(plan.duration);
          
          const originalPrice = plan.amount;
          const discountedPrice = Math.round(originalPrice * (1 - DEFAULT_PLAN_DISCOUNT / 100));
          
          return {
            plandId: plan.id,
            label: plan.name,
            tillDate: expiryDate, 
            days: Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            current: discountedPrice, 
            original: originalPrice, 
          };
        });
        
        mappedPlans.sort((a, b) => a.days - b.days);
        
        setPlans(mappedPlans);
        
        // Set selected plan from URL param
        if (planIdParam) {
          const foundPlan = mappedPlans.find(p => p.plandId === planIdParam);
          if (foundPlan) {
            setSelectedPlanId(foundPlan.plandId);
          } else if (mappedPlans.length > 0) {
            setSelectedPlanId(mappedPlans[0].plandId);
          }
        } else if (mappedPlans.length > 0) {
          setSelectedPlanId(mappedPlans[0].plandId);
        }
      } catch (error: any) {
        console.error("Error fetching plans:", error);
        setError(error?.response?.data?.message || "Failed to load plans. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [planIdParam]);

  // Auto-apply coupon from URL if present
  useEffect(() => {
    if (couponParam && couponParam.length > 0 && selectedPlanId) {
      const autoApplyCoupon = async () => {
        try {
          const couponRes = await api.get('/m/check/coupon', {
            params: { coupon: couponParam, planId: selectedPlanId },
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (couponRes.data.success) {
            setDiscount(couponRes.data.data.discount ?? 0);
            setCouponApplied(true);
            setCouponError("");
            subscription_progress(ref_page || "Unknown", 'coupon_applied', plan_type || "Unknown", true);
          }
        } catch (error: any) {
          console.error("Error auto-applying coupon:", error.response?.data?.message);
        }
      };
      
      autoApplyCoupon();
    }
  }, [couponParam, selectedPlanId, ref_page, plan_type]);

  // Update URL when selection changes
  useEffect(() => {
    if (selectedPlanId) {
      const params = new URLSearchParams(searchParams.toString());
      const currentPlanId = params.get('planId');
      const currentCoupon = params.get('coupon');
      
      // Only update if something actually changed
      const shouldUpdate = 
        currentPlanId !== selectedPlanId ||
        (coupon && couponApplied && currentCoupon !== coupon) ||
        ((!coupon || !couponApplied) && currentCoupon !== null);
      
      if (shouldUpdate) {
        params.set('planId', selectedPlanId);
        if (coupon && couponApplied) {
          params.set('coupon', coupon);
        } else {
          params.delete('coupon');
        }
        router.replace(`/subscription?${params.toString()}`, { scroll: false });
      }
    }
  }, [selectedPlanId, coupon, couponApplied, router, searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      subscription_progress(ref_page || "Unknown", 'subscription_page_view', plan_type || "Unknown", false);
    }
  }, []);

  const selectedPlan = plans.find((p) => p.plandId === selectedPlanId);
  const finalPrice = couponApplied && selectedPlan ? selectedPlan.current - (selectedPlan.current * discount / 100) : selectedPlan?.current || 0;

  const applyCoupon = async() => {
    if (!selectedPlan) return;
    
    try {
      const couponRes = await api.get('/m/check/coupon', {
        params: { coupon, planId: selectedPlan.plandId },
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!couponRes.data.success) {
        setCouponError(couponRes?.data?.message || "Invalid Coupon Code");
        return;
      }
      
      setDiscount(couponRes.data.data.discount ?? 0);
      setCouponApplied(true);
      setCouponError("");
      
      // Update URL with coupon
      const params = new URLSearchParams(searchParams.toString());
      params.set('coupon', coupon);
      router.replace(`/subscription?${params.toString()}`, { scroll: false });
      
      subscription_progress(ref_page || "Unknown", 'coupon_applied', plan_type || "Unknown", true);
    } catch (error: any) {
      console.error("Error applying coupon:", error.response?.data?.message);
      setCouponError(error.response?.data?.message || "Failed to apply coupon");
    }
  };

  const handlePayment = async() => {
    if (!selectedPlan) return;
    
    setPaying(true);

    subscription_progress(ref_page || "Unknown", 'payment_initiated', plan_type || "Unknown", true);
    
    try {
      const response = await api.post('/payment/create-order', {
        planId: selectedPlan.plandId,
        coupon: couponApplied ? coupon : null,
        // Note: duration is calculated on backend based on May-to-May cycle
      });
      
      if (!response.data.success) {
        console.error("Payment creation failed:", response.data.message);
        setPaying(false);
        return;
      }
      
      const order = response.data.data;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        order_id: order.orderId,
        name: 'RANK BOOSTER PLAN',
        description: `Subscription for ${selectedPlan.label} plan`,
        handler: async function (response: any) {
          subscription_progress(ref_page || "Unknown", 'payment_verified', plan_type || "Unknown", true);
          
          const verifyResponse = await api.post(
            '/payment/verify',
            {
              coupon: couponApplied ? coupon : null,
              discount,
              planId: selectedPlan.plandId,
              amount: order.amount,
              userId: order.userId,
              orderId: order.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );

          if (verifyResponse.data.success) {
            router.push(`/payment?status=success&planId=${verifyResponse.data.data.planId}&expiry=${verifyResponse.data.data.expiry}&planName=${verifyResponse.data.data.planName}`);
            subscription_purchased(selectedPlan.plandId, finalPrice, 'INR', 'Razorpay');
          } else {
            router.push('/payment?status=failed');
          }
          setPaying(false);
        },
        prefill: {
          name: order.userName, 
          email: order.userEmail,
        },
        modal: {
          ondismiss: function() {
            setPaying(false);
            subscription_progress(ref_page || "Unknown", 'payment_abandoned', plan_type || "Unknown", true);
          }
        }
      };
      
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      setPaying(false);
    }
  };

  if (plan_type === 'free') {
    return null;
  }

  // Show full-screen loading until plans are loaded
  if (loading) {
    return <Loading />;
  }

  // Show error if plans failed to load
  if (error || plans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "No plans available"}
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <div className="backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-primary-600 hover:text-primary-700 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back 
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-sm sm:text-base font-semibold text-gray-900">Complete Your Subscription</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 ">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 sm:gap-6">
          
          {/* Plan Selection */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Choose Your Duration</h2>
              
              <div className="space-y-4">
                {plans.map((plan) => (
                    <button
                      key={plan.plandId}
                      onClick={() => setSelectedPlanId(plan.plandId)}
                      className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        selectedPlanId === plan.plandId
                          ? "border-primary-400 bg-primary-50 shadow-lg"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{plan.label}</div>
                        <div className="text-gray-600 text-xs sm:text-sm">
                          Until {formatDate(plan.tillDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base sm:text-lg font-bold text-primary-600">₹{plan.current.toLocaleString()}</div>
                        {plan.original > plan.current && (
                          <>
                            <div className="text-gray-400 line-through text-xs sm:text-sm">₹{plan.original.toLocaleString()}</div>
                            <div className="text-secondary-600 font-medium text-xs sm:text-sm">
                              Save ₹{(plan.original - plan.current).toLocaleString()}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <button
                onClick={() => setShowCouponInput(!showCouponInput)}
                className="flex items-center justify-between w-full text-gray-900 font-semibold hover:text-primary-600 transition-colors"
              >
                <span className="text-base sm:text-lg">Have a coupon code?</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showCouponInput ? "rotate-180" : ""}`} />
              </button>

              {showCouponInput && (
                <div className="mt-6 space-y-4">
                  {!couponApplied ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                        <input
                          type="text"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 sm:py-3 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        />
                        <button
                          onClick={applyCoupon}
                          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <div className="text-red-500 text-sm font-medium">{couponError}</div>
                      )}
                    </>
                  ) : (
                    <div className="bg-green-100 border border-green-500 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-green-800 font-medium">Coupon Applied!</span>
                        </div>
                        <button
                          onClick={() => {
                            setCoupon("");
                            setCouponApplied(false);
                            setDiscount(0);
                            // Update URL to remove coupon
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('coupon');
                            router.replace(`/subscription?${params.toString()}`, { scroll: false });
                          }}
                          className="text-green-600 hover:text-green-700 text-sm underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-green-700 text-sm">
                        You saved {discount}% with "<span className="font-mono">{coupon}</span>"
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 md:sticky md:top-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h3>
              
              {selectedPlan && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs sm:text-sm">Plan:</span>
                    <span className="font-semibold text-gray-900 text-xs sm:text-sm">{selectedPlan.label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs sm:text-sm">Valid Until:</span>
                    <span className="text-gray-900 text-xs sm:text-sm">{formatDate(selectedPlan.tillDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs sm:text-sm">Original Price:</span>
                    <span className="text-gray-400 line-through text-xs sm:text-sm">₹{selectedPlan.original.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs sm:text-sm">Discounted Price:</span>
                    <span className="text-gray-900 font-semibold text-xs sm:text-sm">₹{selectedPlan.current.toLocaleString()}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 text-xs sm:text-sm">Coupon Discount:</span>
                      <span className="text-green-600 font-semibold text-xs sm:text-sm">
                        -₹{Math.round(selectedPlan.current * discount / 100).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base sm:text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-base sm:text-lg font-bold text-primary-600">
                    ₹{Math.round(finalPrice).toLocaleString()}
                  </span>
                </div>
                
                <button 
                  className={`w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-3 sm:py-4 rounded-xl text-base sm:text-lg hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center ${paying ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={handlePayment}
                  disabled={paying}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {paying ? 'Processing...' : `Pay ₹${Math.round(finalPrice).toLocaleString()}`}
                </button>
                
                <div className="flex items-center justify-center mt-4 text-gray-500 text-xs sm:text-sm">
                  <Shield className="w-6 h-6 mr-1" />
                  Secure payment with 256-bit SSL encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
};

export default SubscriptionPage;
