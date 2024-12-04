import React from "react";

const TermsOfService: React.FC = () => {
  return (
    <div className="terms-of-service-container px-6 py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">1. Acceptance of Terms</h2>
        <p>
          By accessing or using RankMarg's services, you agree to abide by these Terms of Service. If you do not agree, you may not use our platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">2. Eligibility</h2>
        <p>
          Our services are available only to individuals who are at least 13 years old. If you are under the age of 18, you must use the platform with the supervision of a parent or legal guardian.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">3. Account Registration</h2>
        <ul className="list-disc pl-5">
          <li>You are required to provide accurate and complete information when creating an account.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>
            RankMarg reserves the right to suspend or terminate accounts that provide false or incomplete information.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">4. User Responsibilities</h2>
        <p>
          Use RankMarg only for its intended purpose of learning and participating in challenges. Do not misuse the platform by engaging in prohibited activities such as hacking, spamming, or posting inappropriate content.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">5. Content and Intellectual Property</h2>
        <p>
          All content on RankMarg, including but not limited to questions, solutions, and design, is owned by RankMarg or its licensors and is protected under applicable copyright laws. You may not reproduce, distribute, or create derivative works of the content without explicit permission.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">6. Challenges and Rewards</h2>
        <p>
          RankMarg uses an Elo rating system and offers virtual coins as part of the rewards system. Virtual coins and rewards have no real-world monetary value and cannot be exchanged for cash.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">7. User-Generated Content</h2>
        <p>
          Users may generate content such as usernames, avatars, and challenge names. Users must ensure that their content does not infringe on others' intellectual property rights or violate laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">8. Privacy Policy</h2>
        <p>
          Your use of RankMarg is also governed by our{" "}
          <a href="/privacy-policy" className="text-yellow-500 hover:underline">
            Privacy Policy
          </a>
          , which explains how we collect, use, and protect your personal information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">9. Payment and Refunds</h2>
        <p>
          Some features, such as purchasing merchandise or coins, may involve payments. All payments are final, and refunds will be issued only under exceptional circumstances as determined by RankMarg.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">10. Termination</h2>
        <p>
          RankMarg reserves the right to suspend or terminate your account at any time for violations of these Terms of Service or other reasons at its discretion.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">11. Limitation of Liability</h2>
        <p>
          RankMarg is not responsible for any damages, losses, or interruptions of service caused by unforeseen events, third-party actions, or technical issues. The platform is provided "as-is," and RankMarg disclaims any warranties regarding its functionality or reliability.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">12. Modifications to Terms</h2>
        <p>
          RankMarg reserves the right to modify these Terms of Service at any time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of the revised terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">13. Governing Law</h2>
        <p>
          These Terms of Service are governed by the laws of [Your Country/State], without regard to its conflict of laws principles.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">14. Contact Us</h2>
        <p>
          If you have questions about these Terms of Service, please contact us at:
        </p>
        <ul className="list-disc pl-5">
          <li>Email: <a href="mailto:support@rankmarg.in" className="text-yellow-500 hover:underline">support@rankmarg.in</a></li>
          {/* <li>Address: [Insert company address]</li> */}
        </ul>
      </section>
    </div>
  );
};

export default TermsOfService;
