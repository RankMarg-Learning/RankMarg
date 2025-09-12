import { plans } from "@/constant/pricing.constant";
import api from "@/utils/api";
import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";


const PricingDialog = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [selected, setSelected] = useState(365);
    const [coupon, setCoupon] = useState("");
    const [couponApplied, setCouponApplied] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState("");
    const [showCouponInput, setShowCouponInput] = useState(false);
    const [paying, setPaying] = useState(false);
  
    const router = useRouter();
  
    const plan = plans.find((p) => p.days === selected);
    const finalPrice = couponApplied ? plan.current - (plan.current * discount / 100) : plan.current;
  
    const applyCoupon = async() => {
        try {
            const couponRes = await api.get('/m/check/coupon', {
                params: { coupon, planId: plan.plandId },
                headers: { 'Content-Type': 'application/json' }
                });
            if (!couponRes.data.success) {
                setCouponError(couponRes?.data?.message || "Invalid Coupon Code");
                return;
                }
            setDiscount(couponRes.data.data.discount ?? 0);
            setCouponApplied(true);
            setCouponError("");
        } catch (error) {
          console.error("Error applying coupon:", error.response.data.message);
          setCouponError(error.response.data.message || "Failed to apply coupon");
          return;
            
        }
    };
  
    const handleOverlayClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    const handlePayment = async() => {
        setPaying(true);
        try {
            const response = await api.post('/payment/create-order', {
                planId: plan.plandId,
                amount: finalPrice,
                duration: plan.days
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
                currency:order.currency,
                order_id: order.orderId,
                name: 'RANK BOOSTER PLAN',
                description:  `Subscription for ${plan.label} plan`,
                handler: async function (response: any) {
                   const verifyResponse = await api.post(
                     '/payment/verify',
                     {
                        coupon:coupon,
                        discount,
                        planId: plan.plandId,
                        duration: plan.days,
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
                    setTimeout(() => {
                      onClose();
                  }, 2000);
                  }
                }
              };
            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error("Payment error:", error);
            setPaying(false);
        }
    }
  
    const PlanCard = ({ planData }:{planData:{
      days: number;
      label: string;
      current: number;
      original: number;
    }}) => (
      <button
        onClick={() => setSelected(planData.days)}
        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
          selected === planData.days
            ? "border-primary-500 bg-primary-50 shadow-md"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm md:text-base">{planData.label}</div>
            <div className="text-xs md:text-sm text-gray-500">{planData.days} days access</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-primary-600">₹{planData.current.toLocaleString()}</div>
            <div className="text-xs text-gray-400 line-through">₹{planData.original.toLocaleString()}</div>
            <div className="text-xs text-green-600 font-medium">Save ₹{(planData.original - planData.current).toLocaleString()}</div>
          </div>
        </div>
      </button>
    );
  
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 rounded-2xl"
        onClick={handleOverlayClick}
      >
        <div className="bg-white  shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col ">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-4 relative flex-shrink-0">
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"
              onClick={onClose}
            >
              ×
            </button>
            <h2 className="text-lg md:text-xl font-bold mb-1">Join RANK Plan</h2>
            <div className="flex items-center space-x-2 mt-2">
              {[1, 2].map((i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>
  
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Target Year</h3>
                <div className="space-y-3">
                  {plans.map((planData) => (
                    <PlanCard key={planData.days} planData={planData} />
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-4">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">⚡</span>
                    <span className="text-sm font-medium text-blue-800">Complete RANK Access Included</span>
                  </div>
                </div>
              </div>
            )}
  
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment & Coupon</h3>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">Selected Plan:</div>
                  <div className="font-semibold text-gray-900">{plan.label}</div>
                  <div className="text-lg font-bold text-primary-600 mt-1">₹{plan.current.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 line-through">₹{plan.original.toLocaleString()}</div>
                </div>
  
                {/* Coupon Section */}
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(!showCouponInput)}
                    className="flex items-center justify-between w-full text-primary-700 font-semibold hover:underline focus:outline-none"
                  >
                    <span>Have a coupon code?</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCouponInput ? "rotate-180" : ""}`} />
                  </button>
  
                  {showCouponInput && (
                    <div className="mt-4 space-y-3">
                      {!couponApplied ? (
                        <>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={coupon}
                              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                              placeholder="Enter coupon code"
                              className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all text-sm"
                            />
                            <button
                              onClick={applyCoupon}
                              className="bg-gradient-to-r from-primary-500 to-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-primary -600 hover:to-primary-500 transition-all text-sm"
                            >
                              Apply
                            </button>
                          </div>
                          {couponError && (
                            <div className="text-xs text-red-600 font-medium">{couponError}</div>
                          )}
                          
                        </>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Check className="w-4 h-4 text-green-600 mr-2" />
                              <span className="text-green-800 font-medium">Coupon Applied!</span>
                            </div>
                            <button
                              onClick={() => {
                                setCoupon("");
                                setCouponApplied(false);
                                setDiscount(0);
                              }}
                              className="text-green-600 hover:text-green-800 text-sm underline"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="text-sm text-green-600">
                            You saved {discount}% with "<span className="font-mono">{coupon}</span>"
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
  
                {/* Payment Summary */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-50 rounded-xl p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-semibold">{plan.label}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Original Price:</span>
                      <span className="text-gray-400 line-through">₹{plan.original.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discounted Price:</span>
                      <span className="text-gray-900 font-semibold">₹{plan.current.toLocaleString()}</span>
                    </div>
                    {couponApplied && (
                      <div className="flex justify-between items-center">
                        <span className="text-green-600">Coupon Discount:</span>
                        <span className="text-green-600 font-semibold">-₹{Math.round(plan.current * discount / 100).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-primary-600">₹{Math.round(finalPrice).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
  
                  <button 
                    className={`w-full bg-gradient-to-r from-primary-500 to-primary-500 text-white font-bold py-4 rounded-xl text-lg hover:from-primary-600 hover:to-primary-500 transition-all transform hover:scale-105 shadow-lg ${paying ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={handlePayment}
                    disabled={paying}
                  >
                    {paying ? 'Processing Payment...' : `Pay ₹${Math.round(finalPrice).toLocaleString()}`}
                  </button>
                
                
                <div className="text-center text-xs text-gray-500">
                  Secure payment 
                </div>
              </div>
            )}
          </div>
  
          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center flex-shrink-0">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                step === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              ← Back
            </button>
            
            <span className="text-sm text-gray-500">
              Step {step} of 2
            </span>
            
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all"
              >
                Next →
              </button>
            )}
            
            {step === 2 && (
              <div className="w-20"></div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default PricingDialog;