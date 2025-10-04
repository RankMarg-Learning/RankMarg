
"use client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import HeroSection from "@/components/landing/HeroSection"
import BottomCTA from "@/components/landing/BottomCTA"
import FAQSection from "@/components/landing/FAQSection"
import Footer from "@/components/Footer"
import PricingSection from "@/components/landing/PricingSection"
import QouteSection from "@/components/landing/QouteSection"
import FeatureSection from "@/components/landing/FeatureSection"
import AnalyticsSection from "@/components/landing/AnalyticsSection"
import TestimonialsSection from "@/components/landing/TestimonialsSection"
import JourneyToSuccess from "@/components/landing/JourneyToSuccess"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { trackSubscriptionEvent } from "@/lib/GoogleAnalytics"


export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  // Track landing page view
  useEffect(() => {
    trackSubscriptionEvent('landing_page_view', {
      page_type: 'landing',
      subscription_flow_step: 'landing_page'
    });
  }, []);

  // Track section views
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.getAttribute('data-section');
            if (sectionName) {
              trackSubscriptionEvent('section_view', {
                section_name: sectionName,
                subscription_flow_step: 'section_engagement'
              });
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const refs = [heroRef, pricingRef, testimonialsRef, faqRef];
    refs.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Track navigation clicks
  const handleLoginClick = () => {
    trackSubscriptionEvent('login_click', {
      source: 'navigation',
      subscription_flow_step: 'login_initiation'
    });
  };

  const handleSignUpClick = () => {
    trackSubscriptionEvent('signup_click', {
      source: 'navigation',
      subscription_flow_step: 'signup_initiation'
    });
  };

  return (
    <div className="min-h-screen  overflow-hidden noselect">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-50/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Image src={'https://utfs.io/f/DbhgrrAIqRoKWCwFFv4kujRo2cBDzhfSAtQ1p0ZrLwxy9lHG'} alt="Acme Inc" width={140} height={140} priority />
            </div>
            <div className="flex gap-4">
              <Link href={'/sign-in'}>
                <Button variant="ghost" onClick={handleLoginClick}>
                  Login
                </Button>
              </Link>
              <Link href={'/sign-up'}>
                <Button className="bg-primary-500 hover:bg-primary-600 text-white px-6 md:px-6 py-4 rounded-full" onClick={handleSignUpClick}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="pt-16 bg-primary-50">
        <div ref={heroRef} data-section="hero">
          <HeroSection />
        </div>
        <JourneyToSuccess />
        <FeatureSection />
        <AnalyticsSection />
        <div ref={pricingRef} data-section="pricing">
          <PricingSection />
        </div>
        {/* <ProvenResults/> */}
        <QouteSection />
        <div ref={testimonialsRef} data-section="testimonials">
          <TestimonialsSection />
        </div>
        <div ref={faqRef} data-section="faq">
          <FAQSection />
        </div>
        <BottomCTA />
        <Footer />
      </main>
    </div>
  )
}
