import React from 'react';
import { 
  HelpCircle, 
  Headphones, 
  Wrench,
  FileText,
  AlertTriangle,
  Mail,
  Clock,
  Reply,
  Bug,
  Lock,
  CreditCard,
  BarChart3,
  BookOpen,
  Video,
  Shield,
  FileImage,
  RotateCcw,
  ChevronRight
} from 'lucide-react';

export const metadata = {
    title: 'Help & Support | RankMarg',
    description:
      'Need assistance with Rankmarg? Access our Help & Support page for quick answers, troubleshooting guides, and personalized support for your JEE & NEET preparation journey.',
    openGraph: {
      title: 'Rankmarg Help & Support – Assistance for JEE & NEET Students',
      description:
        'Find solutions to common issues, get guidance on using Rankmarg’s AI-powered practice platform, and connect with our support team to resolve your queries quickly.',
      url: 'https://rankmarg.in/help-support',
      type: 'website',
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
  

const helpSupportContent = {
  title: "Help & Support – RankMarg",
  intro: "At RankMarg, our goal is to empower every JEE and NEET aspirant with a smooth and productive practice experience. If you need help, have questions, or want to share feedback, you're in the right place.",
  faqRedirect: {
    heading: "Looking for FAQs?",
    description: "For answers to commonly asked questions about practice, performance, subscriptions, and more, please visit our dedicated FAQ section.",
    linkText: "Go to FAQs",
    linkHref: "/faqs"
  },
  contact: {
    heading: "Contact Support",
    description: "If your issue isn't covered in the FAQ, reach out to us directly.",
    email: "support@rankmarg.in",
    supportHours: "10 AM – 7 PM IST (Monday to Saturday)",
    responseTime: "We usually respond within 24–48 business hours.",
    instructions: [
      "Include your registered email ID.",
      "Briefly describe the issue you're facing.",
      "Attach relevant screenshots if needed."
    ]
  },
  supportScope: {
    heading: "What We Can Help You With",
    items: [
      { type: "Platform issues", covered: true, note: "Errors, bugs, broken pages", icon: Bug },
      { type: "Account or login help", covered: true, note: "Login issues, email updates", icon: Lock },
      { type: "Subscription & payment", covered: true, note: "Activation, billing, plan upgrades", icon: CreditCard },
      { type: "Analytics & practice doubts", covered: true, note: "Understanding mastery, mistake logs", icon: BarChart3 },
      { type: "Conceptual doubts", covered: false, note: "We don't provide academic guidance", icon: BookOpen },
      { type: "Lecture or video content", covered: false, note: "RankMarg only offers question practice", icon: Video }
    ]
  },
  policies: {
    heading: "Important Links",
    links: [
      { text: "Privacy Policy", href: "/privacy-policy", icon: Shield },
      { text: "Terms of Use", href: "/terms", icon: FileImage },
      { text: "Refund & Cancellation Policy", href: "/refunds", icon: RotateCcw }
    ]
  },
  reminder: {
    heading: "Please Note",
    text: "RankMarg is an intelligent practice platform. We do not offer live classes, lectures, or doubt-clearing services. Our mission is to help you master exam questions through personalized practice, analytics, and feedback."
  },
  copyright: {
    legalNote: "All content, logic, and analytics systems on RankMarg are protected by copyright. Unauthorized use or duplication is strictly prohibited. RankMarg® is a registered trademark in India."
  }
};

const HelpSupportPage = () => {
  

  

  const SupportScopeCard = ({ item, index }) => {
    const IconComponent = item.icon;
    return (
      <div 
        className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300  hover:shadow-sm ${
          item.covered 
            ? 'bg-gradient-to-br from-primary-50 to-primary-50 border border-primary-200 hover:border-primary-300 hover:to-primary-100' 
            : 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 hover:border-red-300 hover:to-rose-100'
        }`}
        style={{
          animationDelay: `${index * 100}ms`
        }}
      >
        <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 group-hover:scale-110 transition-transform duration-300" />
        <div className="relative">
          <div className={`inline-flex p-3 rounded-xl mb-4 ${
            item.covered ? 'bg-primary-100 text-primary-600' : 'bg-red-100 text-red-600'
          }`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.type}</h4>
          <p className="text-gray-600 text-sm">{item.note}</p>
          <div className={`mt-3 text-xs font-medium ${
            item.covered ? 'text-primary-600' : 'text-red-600'
          }`}>
            {item.covered ? '✓ We can help' : '✗ Not available'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100">

      <div className="relative">
        {/* Header */}
        <div className={`text-center py-16 px-4 transition-all duration-1000 opacity-100 translate-y-0`}>
          <div className="max-w-4xl mx-auto">
            
            <h1 className="text-2xl font-bold text-primary-700 mb-6">
              Help & Support
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              {helpSupportContent.intro}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* FAQ Card */}
            <div className={`lg:col-span-4 transition-all duration-700 delay-200 opacity-100 translate-y-0`}>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-md border border-white/20 hover:shadow-2xl transition-all duration-300 group h-full">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <HelpCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{helpSupportContent.faqRedirect.heading}</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">{helpSupportContent.faqRedirect.description}</p>
                  <a 
                    href={helpSupportContent.faqRedirect.linkHref}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {helpSupportContent.faqRedirect.linkText}
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Support Card */}
            <div className={`lg:col-span-8 transition-all duration-700 delay-300 opacity-100 translate-y-0`}>
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 shadow-md text-white h-full">
                <div className="flex items-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mr-4">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{helpSupportContent.contact.heading}</h3>
                    <p className="text-primary-100 mt-2">{helpSupportContent.contact.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                      <Mail className="w-6 h-6 text-primary-200" />
                      <div className="flex-1">
                          <span className='text-white font-medium  transition-colors flex items-center space-x-2'>{helpSupportContent.contact.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                      <Clock className="w-6 h-6 text-primary-200" />
                      <span className="text-white">{helpSupportContent.contact.supportHours}</span>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                      <Reply className="w-6 h-6 text-primary-200" />
                      <span className="text-white">{helpSupportContent.contact.responseTime}</span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h4 className="text-lg font-semibold mb-4 text-white">When contacting us, please:</h4>
                    <ul className="space-y-3">
                      {helpSupportContent.contact.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary-300 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-primary-100">{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Scope */}
            <div className={`lg:col-span-12 transition-all duration-700 delay-400 opacity-100 translate-y-0`}>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl md:p-8 p-4 shadow-md border border-white/20">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-md p-2 mb-4">
                    <Wrench className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{helpSupportContent.supportScope.heading}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {helpSupportContent.supportScope.items.map((item, index) => (
                    <SupportScopeCard key={index} item={item} index={index} />
                  ))}
                </div>
              </div>
            </div>

            {/* Important Links & Reminder */}
            <div className="lg:col-span-6">
              <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-md border border-white/20 h-full transition-all duration-700 delay-500 opacity-100 translate-y-0`}>
                <div className="flex items-center mb-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-xl mr-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{helpSupportContent.policies.heading}</h3>
                </div>
                <p className="text-gray-600 mb-6">Quick access to our policies and terms</p>
                <div className="space-y-3">
                  {helpSupportContent.policies.links.map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                      <a 
                        key={index}
                        href={link.href}
                        className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 group"
                      >
                        <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
                        <span className="text-gray-700 group-hover:text-primary-600 font-medium">{link.text}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform duration-300" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className={`bg-gradient-to-br from-primary-50 to-primary-50 border border-primary-200 rounded-3xl p-8 shadow-md h-full transition-all duration-700 delay-600 opacity-100 translate-y-0`}>
                <div className="flex items-center mb-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-xl mr-4">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{helpSupportContent.reminder.heading}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{helpSupportContent.reminder.text}</p>
              </div>
            </div>

            {/* Copyright Section */}
            <div className={`lg:col-span-12 transition-all duration-700 delay-700 opacity-100 translate-y-0`}>
                <div className="text-center space-y-3">
                  <span className=" text-gray-800 ">©RankMarg {new Date().getFullYear()}, All rights reserved.</span>
                  <p className="text-gray-700  max-w-4xl mx-auto text-sm">
                    {helpSupportContent.copyright.legalNote}
                  </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;