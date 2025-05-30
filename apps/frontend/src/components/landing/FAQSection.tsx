import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'

const List = [
    { question: "How does Rankmarg's A1 personalize my practice?", answer: "Our A1 analyzes your performance patterns, identifies weak areas, and creates personalized question sets. It tracks your mistakes, learning speed, and concept mastery to suggest the most effective practice path for your specific needs." },
    { question: "What makes Rankmarg different from other platforms?", answer: "Unlike generic platforms, Rankmarg focuses on smart practice over more practice. Our A1 adapts to your individual learning style, prioritizes high-impact topics, and helps you study efficiently to maximize rank improvement." },
    { question: "Can I use Rankmarg for both NEET and JEE preparation?", answer: "Yes! Rankmarg supports both NEET and JEE preparation with specialized question banks, syllabus tracking, and exam-specific strategies. You can switch between exam modes or prepare for both simultaneously." },
    { question: "How long does it take to see improvement in my scores?", answer: "Most students see noticeable improvements within 2-4 weeks of consistent practice. Our data shows an average 15% score improvement per month with regular use of the platform's personalized recommendations." },
    { question: "Is there a free trial available?", answer: "Yes! We offer a 7-day free trial of our Rank Booster plan. You can experience all premium features including unlimited A1 practice, mistake tracking, and personalized analytics before committing to a subscription." },
    { question: "What if I'm not satisfied with the platform?", answer: "We offer a 30-day money-back guarantee. If you're not completely satisfied with your progress or the platform's effectiveness, we'll provide a full refund with no questions asked." },
    { question: "Can I access Rankmarg on mobile devices?", answer: "Absolutely! Rankmarg is fully responsive and works seamlessly on all devices - smartphones, tablets, and computers. Your progress syncs across all devices so you can practice anywhere, anytime." },
]

const FAQSection = () => {
  return (
    <section className=" py-24">
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
        </section>
  )
}

export default FAQSection