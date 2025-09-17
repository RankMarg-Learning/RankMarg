"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface GoogleAnalyticsProps {
  trackingId: string;
}


const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ trackingId }) => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', trackingId, {
        page_path: pathname,
        custom_map: {
          custom_parameter_1: 'subscription_flow_step'
        }
      });
    }
  }, [trackingId, pathname]);

  // Track page changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: pathname,
      });
    }
  }, [pathname]);

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
      ></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingId}', {
              page_path: window.location.pathname,
              custom_map: {
                custom_parameter_1: 'subscription_flow_step'
              }
            });
          `,
        }}
      />
    </>
  );
};

// Utility functions for tracking subscription events
export const trackSubscriptionEvent = (eventName: string, parameters: any = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'subscription',
      event_label: 'rankmarg_subscription',
      ...parameters
    });
  }
};

export const trackPricingPageView = () => {
  trackSubscriptionEvent('pricing_page_view', {
    subscription_flow_step: 'pricing'
  });
};

export const trackPlanSelection = (planType: string, planPrice: string) => {
  trackSubscriptionEvent('select_plan', {
    plan_type: planType,
    plan_price: planPrice,
    currency: 'INR',
    subscription_flow_step: 'plan_selection'
  });
};

export const trackSubscriptionPageView = (planType: string) => {
  trackSubscriptionEvent('subscription_page_view', {
    plan_type: planType,
    subscription_flow_step: 'subscription_details'
  });
};

export const trackCouponApplied = (couponCode: string, discountPercent: number, planType: string) => {
  trackSubscriptionEvent('coupon_applied', {
    coupon_code: couponCode,
    discount_percent: discountPercent,
    plan_type: planType,
    subscription_flow_step: 'coupon_application'
  });
};

export const trackPaymentInitiation = (planType: string, planDuration: number, amount: number) => {
  trackSubscriptionEvent('begin_checkout', {
    plan_type: planType,
    plan_duration: planDuration,
    amount: amount,
    currency: 'INR',
    subscription_flow_step: 'payment_initiation'
  });
};

export const trackSuccessfulPayment = (transactionId: string, value: number, planType: string, planDuration: number) => {
  trackSubscriptionEvent('purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'INR',
    plan_type: planType,
    plan_duration: planDuration,
    subscription_flow_step: 'payment_success'
  });
};

export const trackPaymentAbandonment = (planType: string, amount: number) => {
  trackSubscriptionEvent('payment_abandoned', {
    plan_type: planType,
    amount: amount,
    subscription_flow_step: 'payment_abandonment'
  });
};

export const trackFreePlanSelection = () => {
  trackSubscriptionEvent('free_plan_selected', {
    plan_type: 'free',
    subscription_flow_step: 'free_plan_selection'
  });
};

export default GoogleAnalytics;
