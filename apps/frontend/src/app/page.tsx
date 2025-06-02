
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


export default function Home() {


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
                <Button variant="ghost" >
                  Login
                </Button>
              </Link>
              <Link href={'/sign-up'}>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="pt-16 bg-primary-50">
        <HeroSection />
        <JourneyToSuccess />
        <FeatureSection />
        <AnalyticsSection />
        <PricingSection />
        {/* <ProvenResults/> */}
        <QouteSection />
        <TestimonialsSection />
        <FAQSection />
        <BottomCTA />
        <Footer />
      </main>
    </div>
  )
}
