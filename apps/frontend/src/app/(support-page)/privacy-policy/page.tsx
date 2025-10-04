import React from 'react';

export const metadata = {
  title: 'Privacy Policy | RankMarg',
  description:
    'Learn how Rankmarg collects, uses, and protects your data. Our Privacy Policy ensures transparency and safeguards your personal information as you prepare for JEE & NEET.',
  openGraph: {
    title: 'Privacy Policy – Rankmarg',
    description:
      'Understand how your data is handled on Rankmarg. We are committed to protecting your privacy while delivering a secure and personalized learning experience for JEE & NEET preparation.',
    url: 'https://rankmarg.in/privacy-policy',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};


const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto md:px-6 px-4 py-5">
        <div className=" rounded-lg shadow-sm   md:p-8 p-2">
          {/* Policy Header */}
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-primary-700 mb-6">Privacy Policy</h2>
          </div>

          {/* Introduction */}
          <div className="mb-8">
            <p className="text-gray-700 mb-4">
              Welcome to RankMarg. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our platform.
            </p>
            <p className="text-gray-700">
              Rankmarg ("we", "our", "us") is committed to safeguarding the privacy of students, parents, and users who interact with our services.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              1. Information We Collect
            </h3>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">1.1. Personal Information</h4>
              <div className=" p-2">
                <ul className="space-y-1 text-gray-600 ">
                  <li>• Full Name</li>
                  <li>• Email Address</li>
                  <li>• Phone Number (if provided)</li>
                  <li>• User ID / Account Credentials</li>
                  <li>• City, State (optional)</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">1.2. Academic & Activity Data</h4>
              <div className=" p-2 ">
                <ul className="space-y-1 text-gray-600 ">
                  <li>• Class or Exam Target (e.g., JEE, NEET)</li>
                  <li>• Performance data: question attempts, mastery level, time spent, accuracy</li>
                  <li>• Subscription plan and usage history</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">1.3. Technical Data</h4>
              <div className="p-2">
                <ul className="space-y-1 text-gray-600 ">
                  <li>• Device type, browser, OS</li>
                  <li>• IP address</li>
                  <li>• Date/time of access</li>
                  <li>• Cookies and session identifiers</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              2. How We Use Your Information
            </h3>
            <div className="p-2">
              <ul className="space-y-2 text-gray-600 ">
                <li>• To personalize your practice sessions and suggestions</li>
                <li>• To track progress, mastery, and improvement</li>
                <li>• To manage subscriptions, trials, and payments</li>
                <li>• To provide support and respond to inquiries</li>
                <li>• To analyze performance trends for platform enhancement</li>
                <li>• To send occasional updates or service-related notifications</li>
              </ul>
            </div>
            <div className="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300">
              <p className="text-gray-700 text-sm ">
                We do not use your personal data for advertising purposes or sell it to third parties.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              3. Legal Basis for Processing
            </h3>
            <p className="text-gray-700 mb-3">We process your data based on:</p>
            <div className="p-2">
              <ul className="space-y-1 text-gray-600 ">
                <li>• Your explicit consent (during signup or plan purchase)</li>
                <li>• Contractual necessity (to provide the service)</li>
                <li>• Our legitimate interest (to improve the platform and maintain security)</li>
                <li>• Legal obligations (in case of regulatory compliance or dispute)</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              4. Data Retention
            </h3>
            <p className="text-gray-700 mb-3">
              We retain user data for as long as your account remains active, and for a reasonable period thereafter to comply with legal, regulatory, and audit requirements.
            </p>
            <p className="text-gray-700">
              Upon account deletion, your personal information is removed from our active systems within 30 days, except where retention is legally required.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              5. Data Security Measures
            </h3>
            <p className="text-gray-700 mb-3">We follow industry best practices to ensure data security:</p>
            <div className=" p-2">
              <ul className="space-y-1 text-gray-600">
                <li>• Encrypted communication (HTTPS/TLS)</li>
                <li>• Secure storage using industry-grade servers</li>
                <li>• Access controls for internal systems</li>
                <li>• Regular security audits and breach detection</li>
              </ul>
            </div>
            <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
              <p className=" text-gray-600 text-sm">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              6. Cookies & Tracking
            </h3>
            <p className="text-gray-700 mb-3">
              We use minimal cookies to maintain session data and improve functionality. No third-party trackers or ad-based cookies are used.
            </p>
            <p className="text-gray-700">
              Users may disable cookies via browser settings, but some features may become unavailable.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              7. User Rights
            </h3>
            <p className="text-gray-700 mb-3">You have the right to:</p>
            <div className="p-2">
              <ul className="space-y-1 text-gray-600">
                <li>• Access your personal data</li>
                <li>• Request corrections to your data</li>
                <li>• Request deletion of your account and data</li>
                <li>• Withdraw consent at any time</li>
                <li>• Lodge a complaint with a data protection authority (if applicable)</li>
              </ul>
            </div>
            <p className="text-gray-700 mt-3">
              To exercise any of these rights, please email{' '}
              <a href="mailto:support@rankmarg.in" className="text-yellow-600 hover:text-yellow-700 underline">
                support@rankmarg.in
              </a>{' '}
              from your registered account.
            </p>
          </section>

          {/* Section 8 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              8. Data Sharing
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">We do not share data with:</h4>
                <div className=" p-2">
                  <ul className="space-y-1 text-gray-600">
                    <li>• Advertisers</li>
                    <li>• Unaffiliated third parties</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">We may share data with:</h4>
                <div className=" p-2">
                  <ul className="space-y-1 text-gray-600">
                    <li>• Payment gateways (for subscriptions)</li>
                    <li>• Government or legal authorities (if required)</li>
                    <li>• Internal service providers (under confidentiality)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              9. Children's Data
            </h3>
            <p className="text-gray-700">
              Rankmarg is designed for students above 13 years of age. For users below 18, parental or guardian consent is assumed during registration. We do not knowingly collect data from children without appropriate consent.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              10. Changes to This Policy
            </h3>
            <p className="text-gray-700">
              We may revise this Privacy Policy from time to time. Updated versions will be posted on this page with the effective date. You are advised to review it periodically.
            </p>
          </section>

          {/* Contact Section */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              11. Contact Our Legal Team
            </h3>
            <div className="bg-yellow-100 p-6 rounded-lg border border-yellow-300">
              <h4 className="font-semibold text-gray-800 mb-3">Questions or Concerns?</h4>
              <div className="text-gray-700">
                <p className="mb-2"><strong>Legal & Compliance Team – Rankmarg</strong></p>
                <p className="mb-1">
                  Email:{' '}
                  <a href="mailto:support@rankmarg.in" className="text-yellow-600 hover:text-yellow-700 underline">
                    support@rankmarg.in
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className={`lg:col-span-12 transition-all duration-700 delay-700 opacity-100 translate-y-0`}>
                <div className="text-center space-y-3">
                  <span className=" text-gray-800 ">©RankMarg is a registered entity in India. All policies are governed in accordance with Indian law.</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;