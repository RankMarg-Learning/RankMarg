import React from 'react';

export const metadata = {
  title: 'Refund & Cancellation Policy | RankMarg',
  description:
    'Learn about RankMarg\'s refund and cancellation policy for subscriptions. Understand your rights and our terms for requesting refunds on JEE & NEET preparation plans.',
  openGraph: {
    title: 'Refund & Cancellation Policy – RankMarg',
    description:
      'Understand RankMarg\'s refund and cancellation terms. Learn about eligibility criteria, refund process, and cancellation procedures for our educational services.',
    url: 'https://rankmarg.in/refund-policy',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-5">
        <div className="rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-primary-800 bg-clip-text text-transparent mb-6">Refund & Cancellation Policy</h2>
          </div>

          {/* Introduction */}
          <div className="mb-8">
            <p className="text-gray-700 mb-4">
              At <strong>RankMarg</strong>, we strive to offer high-quality educational tools and performance-based practice solutions for students preparing for JEE, NEET, and other competitive exams. This Refund & Cancellation Policy outlines the terms under which users may request a refund or cancel their subscription.
            </p>
            <p className="text-gray-700">
              By purchasing a plan or using RankMarg's paid services, you acknowledge and agree to the terms outlined below.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              1. Free Trial
            </h3>
            <p className="text-gray-700 mb-3">
              We may offer a <strong>limited free trial</strong> or <strong>trial credits</strong> to allow new users to explore RankMarg's platform and features before committing to a paid subscription.
            </p>
            <div className="p-2">
              <ul className="space-y-1 text-gray-600">
                <li>• Trial access does <strong>not require a refund</strong>, as no payment is involved</li>
                <li>• Upon expiry of the trial, a subscription must be purchased to retain access to premium features</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              2. Refund Eligibility
            </h3>
            <p className="text-gray-700 mb-3">Refunds are applicable only under the following conditions:</p>
            <div className="p-2 mb-4">
              <ul className="space-y-1 text-gray-600">
                <li>• You have purchased a <strong>paid subscription plan</strong> via an official RankMarg channel (e.g., website, app)</li>
                <li>• Your refund request is raised within <strong>7 days</strong> of the original purchase date</li>
                <li>• You have used the platform <strong>minimally</strong> (e.g., fewer than 5 practice sessions or 2 mock tests)</li>
                <li>• You can demonstrate <strong>dissatisfaction due to technical or functional issues</strong> that were not resolved by our support team</li>
              </ul>
            </div>
            
            <p className="text-gray-700 mb-3">We do <strong>not</strong> issue refunds for:</p>
            <div className="mt-2 p-3 bg-yellow-100 rounded border border-yellow-300">
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Change of mind or accidental purchases</li>
                <li>• Partial usage of services (e.g., midway through a monthly or yearly plan)</li>
                <li>• Inactivity or personal academic reasons</li>
                <li>• Missed discount codes or price changes after purchase</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              3. How to Request a Refund
            </h3>
            <p className="text-gray-700 mb-3">
              To request a refund, please send an email to{' '}
              <a href="mailto:support@rankmarg.in" className="text-yellow-600 hover:text-yellow-700 underline font-semibold">
                support@rankmarg.in
              </a>{' '}
              from your registered email address with:
            </p>
            <div className="p-2 mb-4">
              <ul className="space-y-1 text-gray-600">
                <li>• Your full name</li>
                <li>• Registered mobile number (if applicable)</li>
                <li>• Transaction ID or payment confirmation</li>
                <li>• Reason for refund</li>
              </ul>
            </div>
            <div className="mt-2 p-3 bg-yellow-100 rounded border border-yellow-300">
              <p className="text-gray-700 text-sm">
                Our team will respond within <strong>3–5 working days</strong>. Approved refunds will be processed to your original payment method within <strong>7–10 working days</strong> (subject to payment gateway timelines).
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              4. Cancellation Policy
            </h3>
            <p className="text-gray-700 mb-3">
              You may <strong>cancel your subscription at any time</strong> from your account dashboard. However:
            </p>
            <div className="p-2">
              <ul className="space-y-1 text-gray-600">
                <li>• Cancellation stops future auto-renewals but <strong>does not trigger a refund</strong> for the remaining duration of the current plan</li>
                <li>• Your access to paid features will continue until the end of the current billing cycle</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              5. Failed Transactions & Duplicates
            </h3>
            <p className="text-gray-700">
              If your payment was deducted but your subscription was not activated, or if you were charged multiple times, please notify us immediately at{' '}
              <a href="mailto:support@rankmarg.in" className="text-yellow-600 hover:text-yellow-700 underline font-semibold">
                support@rankmarg.in
              </a>{' '}
              with payment proof. We will verify and issue a full refund for such cases.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              6. Dispute Resolution
            </h3>
            <p className="text-gray-700">
              In the event of a disagreement regarding refund eligibility, our decision will be final. However, users may escalate concerns to our legal team for reconsideration under extenuating circumstances.
            </p>
          </section>

          {/* Contact Section */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-yellow-400 pl-4">
              7. Contact for Support
            </h3>
            <div className="bg-yellow-100 p-6 rounded-lg border border-yellow-300">
              <h4 className="font-semibold text-gray-800 mb-3">RankMarg Refund Desk</h4>
              <div className="text-gray-700">
                <p className="mb-1">
                  Email:{' '}
                  <a href="mailto:support@rankmarg.in" className="text-yellow-600 hover:text-yellow-700 underline font-semibold">
                    support@rankmarg.in
                  </a>
                </p>
                <p className="text-sm text-gray-600">Subject Line: <em>Refund Request / Cancellation</em></p>
              </div>
            </div>
          </section>

          {/* Important Note */}
          <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-gray-700 text-sm">
              <strong>Please note:</strong> Refund decisions are subject to our internal review policy and are made in good faith, considering platform usage, timing, and technical records.
            </p>
          </div>

          {/* Footer */}
          <div className="lg:col-span-12 transition-all duration-700 delay-700 opacity-100 translate-y-0">
            <div className="text-center space-y-3">
             
              <span className="text-gray-800">© 2025 RankMarg. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;