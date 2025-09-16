"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { Check, ChevronDown, CreditCard, Shield, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import api from "@/utils/api";
import { plans } from "@/constant/pricing.constant";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SubscriptionContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planType = searchParams.get('plan');
  
  const [selectedDuration, setSelectedDuration] = useState(365);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    // Track subscription page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Subscription Page',
        page_location: window.location.href,
        plan_type: planType
      });
    }
  }, [planType]);

  // If it's free plan, redirect to onboarding
  useEffect(() => {
    if (planType === 'free') {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'free_plan_selected', {
          plan_type: 'free'
        });
      }
      router.push('/onboarding');
    }
  }, [planType, router]);

  const selectedPlan = plans.find((p) => p.days === selectedDuration);
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
      
      // Track coupon applied
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'coupon_applied', {
          coupon_code: coupon,
          discount_percent: couponRes.data.data.discount,
          plan_type: planType
        });
      }
    } catch (error: any) {
      console.error("Error applying coupon:", error.response?.data?.message);
      setCouponError(error.response?.data?.message || "Failed to apply coupon");
    }
  };

  const handlePayment = async() => {
    if (!selectedPlan) return;
    
    setPaying(true);
    
    // Track payment initiation
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        plan_type: planType,
        plan_duration: selectedPlan.days,
        amount: finalPrice,
        currency: 'INR'
      });
    }
    
    try {
      const response = await api.post('/payment/create-order', {
        planId: selectedPlan.plandId,
        amount: finalPrice,
        duration: selectedPlan.days
      });
      
      if (!response.data.success) {
        console.error("Payment creation failed:", response.data.message);
        setPaying(false);
        return;
      }
      
      const order = response.data.data;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: Math.round(finalPrice * 100),
        currency: order.currency,
        order_id: order.orderId,
        name: 'RANK BOOSTER PLAN',
        description: `Subscription for ${selectedPlan.label} plan`,
        handler: async function (response: any) {
          // Track successful payment
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'purchase', {
              transaction_id: response.razorpay_payment_id,
              value: finalPrice,
              currency: 'INR',
              plan_type: planType,
              plan_duration: selectedPlan.days
            });
          }
          
          const verifyResponse = await api.post(
            '/payment/verify',
            {
              coupon: coupon,
              discount,
              planId: selectedPlan.plandId,
              duration: selectedPlan.days,
              amount: finalPrice,
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
            // Track payment abandonment
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'payment_abandoned', {
                plan_type: planType,
                amount: finalPrice
              });
            }
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

  if (planType === 'free') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <div className="backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-primary-600 hover:text-primary-700 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-base font-semibold text-gray-900">Complete Your Subscription</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 ">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          
          {/* Plan Selection */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Choose Your Duration</h2>
              
              <div className="space-y-4">
                {plans.map((plan) => (
                  <button
                    key={plan.days}
                    onClick={() => setSelectedDuration(plan.days)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedDuration === plan.days
                        ? "border-primary-400 bg-primary-50 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-base">{plan.label}</div>
                        <div className="text-gray-600 text-sm">{plan.days} days access</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">₹{plan.current.toLocaleString()}</div>
                        <div className="text-gray-400 line-through text-sm">₹{plan.original.toLocaleString()}</div>
                        <div className="text-secondary-600 font-medium text-sm">
                          Save ₹{(plan.original - plan.current).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <button
                onClick={() => setShowCouponInput(!showCouponInput)}
                className="flex items-center justify-between w-full text-gray-900 font-semibold hover:text-primary-600 transition-colors"
              >
                <span className="text-lg">Have a coupon code?</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showCouponInput ? "rotate-180" : ""}`} />
              </button>

              {showCouponInput && (
                <div className="mt-6 space-y-4">
                  {!couponApplied ? (
                    <>
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        />
                        <button
                          onClick={applyCoupon}
                          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
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
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
              
              {selectedPlan && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Plan:</span>
                    <span className="font-semibold text-gray-900 text-sm">{selectedPlan.label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Duration:</span>
                    <span className="text-gray-900 text-sm">{selectedPlan.days} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Original Price:</span>
                    <span className="text-gray-400 line-through text-sm">₹{selectedPlan.original.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Discounted Price:</span>
                    <span className="text-gray-900 font-semibold text-sm">₹{selectedPlan.current.toLocaleString()}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 text-sm">Coupon Discount:</span>
                      <span className="text-green-600 font-semibold text-sm">
                        -₹{Math.round(selectedPlan.current * discount / 100).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-primary-600">
                    ₹{Math.round(finalPrice).toLocaleString()}
                  </span>
                </div>
                
                <button 
                  className={`w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 rounded-xl text-lg hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center ${paying ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={handlePayment}
                  disabled={paying}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {paying ? 'Processing...' : `Pay ₹${Math.round(finalPrice).toLocaleString()}`}
                </button>
                
                <div className="flex items-center justify-center mt-4 text-gray-500 text-sm">
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
