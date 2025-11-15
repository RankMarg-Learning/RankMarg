"use client"
import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/common-ui'
import { HelpCircle, CheckCircle } from 'lucide-react'

const List = [
    { 
      question: "How does the Adaptive Practice Session work for NEET/JEE?", 
      answer: "Our AI analyzes your performance across Physics, Chemistry, Mathematics, and Biology. It identifies weak topics (e.g., Thermodynamics, Organic Reactions), current syllabus topics you're studying, and topics that need revision. Based on this, it creates daily personalized question sets tailored to your needs, ensuring you focus on areas that need the most attention." 
    },
    { 
      question: "What are Smart Hints and how do they help without revealing answers?", 
      answer: "Smart Hints guide you toward the solution without giving away the answer. For example, if you're stuck on a Physics problem, the hint might say 'Consider conservation of momentum' or 'Check the sign of acceleration'. This helps you develop problem-solving skills and think strategically, rather than just memorizing solutions." 
    },
    { 
      question: "How does the Mistake Tracker categorize my errors?", 
      answer: "The Mistake Tracker automatically categorizes your errors into types: calculation mistakes, conceptual errors, time pressure mistakes, careless errors, and more. You can see patterns like 'You make 60% calculation errors in Chemistry' or 'Most mistakes happen in questions requiring 2+ steps'. This helps you fix root causes, not just symptoms." 
    },
    { 
      question: "What's included in the Mastery System?", 
      answer: "The Mastery System tracks your progress at three levels: Subject (e.g., Physics 85%), Topic (e.g., Mechanics 78%), and Subtopic (e.g., Rotational Motion 65%). It updates in real-time based on your performance, showing you exactly which concepts you've mastered and which need more practice." 
    },
    { 
      question: "Can I use RankMarg for both NEET and JEE preparation?", 
      answer: "Yes! RankMarg supports both NEET and JEE with exam-specific question banks, syllabus tracking, and solving strategies. For NEET, we cover Biology extensively. For JEE, we include advanced Mathematics and problem-solving techniques for JEE Advanced. You can switch between exam modes anytime." 
    },
    { 
      question: "How do Mock Tests work? Are they exactly like real exams?", 
      answer: "We offer three types of mock tests: Full-length (simulates complete NEET/JEE exam), Subject-wise (focus on one subject), and Topic-wise (drill specific topics). All tests follow real exam patterns with proper marking schemes. After each test, you get detailed analysis showing time per question, accuracy by topic, and comparison with your previous attempts." 
    },
    { 
      question: "What is the Curriculum Management System?", 
      answer: "It's your digital syllabus organizer. You can mark topics as 'Current' (studying now), 'Completed' (mastered), or 'Pending' (not started). The system tracks your progress through the entire NEET/JEE syllabus and shows you what percentage of each subject you've covered. It ensures you don't miss any topics before the exam." 
    },
    { 
      question: "Is there a free trial? What features can I test?", 
      answer: "Yes! We offer a 7-day free trial with full access to all 11 features: Adaptive Practice, Smart Hints, Solving Strategies, Common Mistakes Guide, Step-by-Step Solutions, Mastery System, Mock Tests, Mistake Tracker, Analytics Dashboard, Curriculum Management, and Performance-Based AI Learning. No credit card required to start." 
    },
    { 
      question: "How long does it take to see improvement in my scores?", 
      answer: "Most students see measurable improvement within 2-3 weeks of consistent practice (30-45 minutes daily). Our data shows students improve their accuracy by an average of 15-20% in their weakest subjects within the first month. The key is using the platform's recommendations consistently." 
    },
    { 
      question: "Can I access RankMarg on mobile phones or tablets?", 
      answer: "Absolutely! RankMarg works perfectly on all devices - smartphones, tablets, laptops, and desktops. Your progress syncs automatically across devices. Mobile app for Android and iOS is coming soon. You can practice anywhere, anytime." 
    },
    { 
      question: "What if I'm not satisfied? Is there a refund policy?", 
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with your progress or the platform within 30 days, we'll refund your subscription - no questions asked. We're confident you'll see results, but want you to feel completely risk-free." 
    },
]

const FAQSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-primary-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4">
            <HelpCircle className="w-4 h-4 text-primary-700" />
            <span className="text-sm font-semibold text-primary-700">Got Questions?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about RankMarg's features for NEET & JEE preparation
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {List.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white rounded-xl border-2 border-gray-200 px-6 py-2 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
            >
              <AccordionTrigger className="text-gray-900 hover:text-primary-700 font-semibold text-left hover:no-underline">
                <div className="flex items-start gap-3 pr-4">
                  <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>{faq.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pl-8 pr-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        
      </div>
    </section>
  )
}

export default FAQSection