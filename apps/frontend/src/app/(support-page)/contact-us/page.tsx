import React from 'react';
import { 
  Mail, 
  Clock,
  Send,
  MessageCircle,
  Headphones,
  AlertCircle,
  ArrowRight,
  Globe,
  Linkedin,
  Instagram,
} from 'lucide-react';

const contactContent = {
  title: "Contact Us",
  intro: "Have questions, feedback, or need assistance? We're here to help! Reach out to us through our support email, and our team will get back to you as soon as possible.",
  mainContact: {
    title: "Main Support",
    description: "For all inquiries, technical support, feedback, and general questions",
    value: "support@rankmarg.in",
    icon: Mail,
    color: "from-primary-500 to-primary-600",
    responseTime: "24-48 hours"
  },
  supportHours: {
    title: "Support Hours",
    schedule: "Monday to Saturday: 10:00 AM - 7:00 PM IST",
    note: "We're closed on Sundays and national holidays",
    icon: Clock
  },
  socialMedia: {
    title: "Follow Us",
    platforms: [
      { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/rankmarg/", color: "hover:text-primary-600" },
      { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/rankmarg.in/", color: "hover:text-pink-500" },
    ]
  },
  contactTypes: [
    {
      title: "Technical Support",
      description: "Platform issues, login problems, bugs, or technical difficulties",
      icon: Headphones,
      email: "support@rankmarg.in",
      subject: "Technical Support - [Brief Description]"
    },
    {
      title: "General Inquiries",
      description: "Questions about features, platform usage, or general information",
      icon: MessageCircle,
      email: "support@rankmarg.in",
      subject: "General Inquiry - [Your Question]"
    },
    {
      title: "Feedback & Suggestions",
      description: "Share your ideas, suggestions, or feedback to help us improve",
      icon: Send,
      email: "support@rankmarg.in",
      subject: "Feedback - [Your Suggestion]"
    }
  ]
};

const ContactPage = () => {
  const MainContactCard = () => {
    const IconComponent = contactContent.mainContact.icon;
    return (
      <div className="group relative overflow-hidden rounded-xl p-8 bg-white/90 backdrop-blur-sm border border-white/30 hover:shadow-xl transition-all duration-300">
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/5 group-hover:scale-110 transition-transform duration-300" />
        <div className="relative text-center">
          <div className={`inline-flex p-4 rounded-2xl mb-6 bg-gradient-to-r ${contactContent.mainContact.color} text-white shadow-lg`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">{contactContent.mainContact.title}</h3>
          <p className="text-gray-600 mb-4">{contactContent.mainContact.description}</p>
          <div className="text-lg text-primary-600 font-bold mb-3">{contactContent.mainContact.value}</div>
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-2 inline-block">
            Response time: {contactContent.mainContact.responseTime}
          </div>
        </div>
      </div>
    );
  };

  const ContactTypeCard = ({ type, index }) => {
    const IconComponent = type.icon;
    return (
      <div 
        className="group md:p-6 p-4 bg-gradient-to-br from-primary-50 to-primary-50 border border-primary-200 hover:border-primary-300 hover:to-primary-100 rounded-2xl transition-all duration-300"
        style={{
          animationDelay: `${index * 100}ms`
        }}
      >
        <div className="flex items-start space-x-4">
          <div className="inline-flex p-2 rounded-xl bg-primary-100 text-primary-600">
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h4>
            <p className="text-gray-600 text-sm mb-3">{type.description}</p>
            <a 
              href={`mailto:${type.email}?subject=${encodeURIComponent(type.subject)}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center group-hover:translate-x-1 transition-transform duration-200"
            >
              Send Email
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
            <div className="text-xs text-gray-500 mt-1">Subject: {type.subject}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100">
      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center py-16 px-4 transition-all duration-1000 opacity-100 translate-y-0">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-6 shadow-2xl">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary-700 mb-6">
              Contact Us
            </h1>
            <p className=" text-gray-600 leading-relaxed max-w-3xl mx-auto">
              {contactContent.intro}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Contact Card */}
            <div className="lg:col-span-2 transition-all duration-700 delay-200 opacity-100 translate-y-0">
              <MainContactCard />
            </div>

            {/* Support Hours */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-white/20 transition-all duration-700 delay-400 opacity-100 translate-y-0 h-full flex flex-col justify-center">
                <div className="flex items-center mb-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mr-3">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">{contactContent.supportHours.title}</h4>
                </div>
                <p className="text-gray-700 font-medium mb-3 text-base">{contactContent.supportHours.schedule}</p>
                <p className="text-gray-600 text-sm">{contactContent.supportHours.note}</p>
              </div>
            </div>

            {/* Contact Types */}
            <div className="lg:col-span-3 transition-all duration-700 delay-300 opacity-100 translate-y-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl md:p-8 shadow-md border border-white/20">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">How Can We Help You?</h3>
                  <p className="text-gray-600">Click on any option below to send a pre-formatted email</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {contactContent.contactTypes.map((type, index) => (
                    <ContactTypeCard key={index} type={type} index={index} />
                  ))}
                </div>
              </div>
            </div>

            {/* Social Media & Additional Info */}
            <div className="lg:col-span-3 transition-all duration-700 delay-600 opacity-100 translate-y-0">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl md:p-8 p-4 shadow-md text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Stay Connected</h3>
                    <p className="text-gray-300 mb-6">Follow us on social media for updates, tips, and educational content to help you succeed in your JEE & NEET preparation journey.</p>
                    <div className="flex space-x-4">
                      {contactContent.socialMedia.platforms.map((platform, index) => {
                        const IconComponent = platform.icon;
                        return (
                          <a
                            key={index}
                            href={platform.href}
                            target='_blank'
                            className={`inline-flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 text-gray-300 ${platform.color}`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-white/20 to-white/5 rounded-xl mb-4">
                      <Globe className="w-4 h-4 text-primary-600" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">Available 24/7 Online</h4>
                    <p className="text-gray-300 text-sm">Our platform is always accessible for your practice sessions, even when support is offline.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="lg:col-span-3 transition-all duration-700 delay-700 opacity-100 translate-y-0">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-lg font-semibold text-amber-800 mb-2">Important Note</h4>
                  <p className="text-amber-700">
                    For urgent technical issues that prevent you from accessing the platform, please include "URGENT" in your email subject line. 
                    We prioritize these requests and aim to respond within 4-6 hours during business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Copyright Section */}
            <div className="lg:col-span-3 transition-all duration-700 delay-800 opacity-100 translate-y-0">
              <div className="text-center space-y-3">
                <span className="text-gray-800 font-medium">©RankMarg {new Date().getFullYear()}, All rights reserved.</span>
                <p className="text-gray-700 max-w-4xl mx-auto text-sm">
                  All content, logic, and analytics systems on RankMarg are protected by copyright. Unauthorized use or duplication is strictly prohibited. RankMarg® is a registered trademark in India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;