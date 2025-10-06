export const gtagEvent = (name: string, params: Record<string, any> = {}) => {
    if (typeof window === 'undefined') return;
    if (!window.gtag) {
      console.warn('gtag not found');
      return;
    }
    window.gtag('event', name, params);
  };


  export const view_homepage = (source?: string, medium?: string, campaign?: string) =>
    gtagEvent('view_landing_page', { source, medium, campaign });
  
  export const click_signup_cta = (button_text?: string, position?: string) =>
    gtagEvent('click_signup_cta', { button_text, position });

  export const click_login_cta = (button_text?: string, position?: string) =>
    gtagEvent('click_login_cta', { button_text, position });
  
  export const signin_completed = (method?: string) =>
    gtagEvent('signin_completed', { method });
  
  export const signup_completed = (method?: string) =>
    gtagEvent('signup_completed', { method });

  export const onboarding_progress = (step?: string, is_completed?: boolean) =>
    gtagEvent('onboarding_progress', { step, is_completed });
  
  
  export const subscription_progress = (ref_page?: string, step?: string, plan_type?: string, is_completed?: boolean) =>
    gtagEvent('subscription_progress', { ref_page, step, plan_type, is_completed });

  export const subscription_purchased = (plan_id: string, amount: number, currency: string, payment_method: string) =>
    gtagEvent('subscription_purchased', { plan_id, amount, currency, payment_method });