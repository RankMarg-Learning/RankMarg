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

  // Article Analytics
  export const view_articles_page = (page?: number, total_articles?: number) =>
    gtagEvent('view_articles_page', { page, total_articles });

  export const view_article_detail = (
    article_id?: string,
    article_slug?: string,
    article_title?: string,
    category?: string,
    tags?: string[],
    reading_time?: number
  ) =>
    gtagEvent('view_article_detail', {
      article_id,
      article_slug,
      article_title,
      category,
      tags: tags?.join(','),
      reading_time,
    });

  export const filter_articles = (filter_type?: string, filter_value?: string) =>
    gtagEvent('filter_articles', { filter_type, filter_value });

  export const click_article = (article_id?: string, article_slug?: string, article_title?: string, position?: string) =>
    gtagEvent('click_article', { article_id, article_slug, article_title, position });

  export const share_article = (article_id?: string, article_slug?: string, article_title?: string, method?: string) =>
    gtagEvent('share_article', { article_id, article_slug, article_title, method });

  export const click_related_article = (
    article_id?: string,
    article_slug?: string,
    article_title?: string,
    related_to_article_id?: string
  ) =>
    gtagEvent('click_related_article', {
      article_id,
      article_slug,
      article_title,
      related_to_article_id,
    });