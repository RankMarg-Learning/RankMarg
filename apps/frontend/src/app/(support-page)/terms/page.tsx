import Link from 'next/link';
import React from 'react';

export const metadata = {
  title: 'Refund & Cancellation Policy | RankMarg',
  description:
    'Understand Rankmarg’s Refund & Cancellation Policy. Get clear information on subscription cancellations, refund eligibility, and how we ensure a fair experience for JEE & NEET aspirants.',
  openGraph: {
    title: 'Terms & Conditions | RankMarg - Your Personal AI Coach for JEE & NEET ',
    description:
      'Read Rankmarg’s policy on cancellations and refunds. We provide transparent guidelines to help you make informed decisions while using our AI-powered platform for JEE & NEET preparation.',
    url: 'https://rankmarg.in/refunds',
    type: 'website',
    images: [
      {
        url: "https://cdn.rankmarg.in/assets/og-cover.png", 
        width: 1200,
        height: 630,
        alt: "RankMarg – Your Personal AI Coach for JEE & NEET ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: 'Terms & Conditions | RankMarg - Your Personal AI Coach for JEE & NEET ',
    description:
      'Understand Rankmarg’s Refund & Cancellation Policy. Get clear information on subscription cancellations, refund eligibility, and how we ensure a fair experience for JEE & NEET aspirants.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};


const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-5">
        <div className="rounded-lg shadow-sm md:p-8 p-2">
        <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-primary-700 mb-6">Terms & Conditions</h2>
          </div>
          {/* Introduction */}
          <div className="mb-8">
            <p className="text-gray-700 mb-4">
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", "your") and RankMarg ("we", "us", "our"), governing your access and use of the RankMarg website, platform, content, services, and features (collectively, the "Services").
            </p>
            <p className="text-gray-700">
              By using RankMarg, you agree to abide by these Terms and all applicable laws and regulations. If you do not agree, you must not access or use the platform.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              1. Eligibility
            </h3>
            <p className="text-gray-700 mb-3">
              You must be at least 13 years old to use RankMarg. Users below the age of 18 must have permission from a parent or legal guardian. By registering, you confirm that you meet this eligibility requirement.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              2. User Account
            </h3>
            <div className="p-2">
              <ul className="space-y-2 text-gray-600">
                <li>• You must register using accurate, complete information</li>
                <li>• You are responsible for maintaining the confidentiality of your login credentials</li>
                <li>• You agree not to share your account with others or impersonate another user</li>
                <li>• We reserve the right to suspend or terminate accounts found to be in violation</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              3. Platform Usage
            </h3>
            <p className="text-gray-700 mb-3">
              RankMarg is intended solely for self-practice and performance analytics for students preparing for JEE, NEET, and similar competitive exams.
            </p>
            <p className="text-gray-700 mb-3">You agree not to:</p>
            <div className="p-2">
              <ul className="space-y-1 text-gray-600">
                <li>• Copy, distribute, or resell content, question sets, or platform features</li>
                <li>• Use bots, scripts, or other automated methods to access or abuse the platform</li>
                <li>• Attempt to reverse engineer, hack, or disrupt the platform's systems</li>
                <li>• Upload harmful, offensive, or illegal content</li>
                <li>• Misuse features or tamper with student analytics or tracking mechanisms</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              4. Subscription & Payments
            </h3>
            <div className="p-2">
              <ul className="space-y-2 text-gray-600">
                <li>• Access to premium features requires a paid subscription plan</li>
                <li>• You are responsible for all charges incurred through your account</li>
                <li>• Plans are non-transferable and non-refundable unless explicitly stated in our  <Link className='text-primary-500 hover:underline' href={'/refunds'}>Refund Policy</Link></li>
                <li>• We reserve the right to modify pricing or features at any time with appropriate notice</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              5. Intellectual Property
            </h3>
            <p className="text-gray-700 mb-3">
              All content on RankMarg — including but not limited to question sets, algorithms, analytics systems, platform code, branding, and designs — is the exclusive intellectual property of RankMarg EdTech and protected under applicable copyright, trademark, and IP laws.
            </p>
            <div className="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300">
              <p className="text-gray-700 text-sm">
                You may not copy, reproduce, redistribute, or commercially exploit any part of the service without written permission.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              6. Limitation of Liability
            </h3>
            <p className="text-gray-700 mb-3">To the fullest extent permitted by law:</p>
            <div className="p-2">
              <ul className="space-y-1 text-gray-600">
                <li>• RankMarg is provided "as is" without warranties of any kind</li>
                <li>• We are not liable for any academic outcome, admission result, or exam performance</li>
                <li>• We are not responsible for loss of data due to third-party disruptions or force majeure events</li>
                <li>• In no event shall RankMarg's liability exceed the amount paid by you in the previous 12 months</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              7. Termination
            </h3>
            <p className="text-gray-700 mb-3">We reserve the right to terminate or restrict your access to RankMarg at any time:</p>
            <div className="p-2">
              <ul className="space-y-1 text-gray-600">
                <li>• If you violate these Terms</li>
                <li>• If your usage poses a security, legal, or reputational risk</li>
                <li>• Without notice, in cases of fraud, abuse, or malicious activity</li>
              </ul>
            </div>
            <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
              <p className="text-gray-600 text-sm">
                Upon termination, your access to the platform will be revoked, and any rights granted will cease immediately.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              8. Data Usage & Privacy
            </h3>
            <p className="text-gray-700">
              Our handling of your personal and academic data is governed by our <Link className='text-primary-500 hover:underline' href={'/privacy-policy'}> Privacy Policy</Link>. By using the platform, you consent to such processing.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              9. Changes to Terms
            </h3>
            <p className="text-gray-700">
              We may update these Terms periodically. Any changes will be effective upon posting. Continued use of RankMarg after changes implies your acceptance of the revised Terms.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              10. Governing Law & Dispute Resolution
            </h3>
            <p className="text-gray-700 mb-3">These Terms shall be governed by and construed in accordance with the laws of India.</p>
            <div className="p-2">
              <ul className="space-y-1 text-gray-600">
                <li>• Disputes shall be subject to the jurisdiction of the courts located in Pune, Maharashtra</li>
                <li>• In case of disagreement, both parties agree to attempt amicable resolution before approaching courts</li>
              </ul>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              11. Contact Information
            </h3>
            <div className="bg-yellow-100 p-6 rounded-lg border border-yellow-300">
              <h4 className="font-semibold text-gray-800 mb-3">Questions, Concerns, or Legal Matters?</h4>
              <div className="text-gray-700">
                <p className="mb-2"><strong>Legal & Compliance Team – RankMarg</strong></p>
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
          <div className="lg:col-span-12 transition-all duration-700 delay-700 opacity-100 translate-y-0">
            <div className="text-center space-y-3">
              <span className="text-gray-800">©RankMarg {new Date().getFullYear()} . All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;