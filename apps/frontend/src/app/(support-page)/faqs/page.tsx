import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const List = [
    {
      question: "What is Rankmarg and how does it help in JEE/NEET preparation?",
      answer: "Rankmarg is a smart practice platform that provides personalized question sets, mistake tracking, mastery analytics, and daily adaptive practice for JEE and NEET aspirants. It helps you improve your accuracy, speed, and rank by targeting your weak areas."
    },
    {
      question: "Does Rankmarg provide video lectures or study material?",
      answer: "No. Rankmarg focuses exclusively on smart and strategic practice. It does not provide video lectures or theory content. Our goal is to make you exam-ready through question-solving, analysis, and improvement."
    },
    {
      question: "What makes Rankmarg different from other EdTech platforms?",
      answer: "Unlike generic platforms, Rankmarg doesn’t overload you with content. Instead, it analyzes your strengths and weaknesses to deliver focused practice. Our mastery engine, mistake feedback system, and personalized roadmap mimic how a human mentor would guide you."
    },
    {
      question: "Can I prepare for both JEE and NEET on Rankmarg?",
      answer: "Yes. Rankmarg supports both JEE and NEET exam modes. You can switch between them or focus on one. Each mode offers subject-wise and topic-wise question banks, daily sessions, and mock tests tailored to that exam."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes. We offer a limited free trial so you can explore Rankmarg’s features like smart practice, analytics, and feedback before subscribing to a paid plan."
    },
    {
      question: "How often is new practice content generated?",
      answer: "Every night at midnight, Rankmarg generates a new set of daily practice questions per subject. These are customized based on your latest performance, syllabus progress, and mastery history."
    },
    {
      question: "Can I cancel or get a refund after subscribing?",
      answer: "Yes. You can cancel anytime to stop future renewals. Refunds are available within 7 days of purchase if you’ve used the platform minimally and faced unresolved issues. See our refund policy for full details."
    },
    {
      question: "How does Rankmarg track my progress?",
      answer: "Rankmarg uses mastery algorithms to analyze your concept understanding, mistake patterns, speed, and consistency. You’ll get detailed analytics and personalized suggestions based on this data."
    },
    {
      question: "Is Rankmarg accessible on mobile?",
      answer: "Absolutely. Rankmarg is mobile-responsive and works seamlessly on smartphones, tablets, and desktops. Your data syncs across all devices."
    },
    {
      question: "How can I contact support if I face issues?",
      answer: "You can reach us anytime at support@rankmarg.in. Our support team usually responds within 24–48 business hours."
    }
  ];
  

const FAQs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {List.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-gray-800 hover:text-gray-600 hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-800">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
    </div>
  )
}

export default FAQs