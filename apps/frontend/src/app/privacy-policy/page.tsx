import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="privacy-policy-container px-6 py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        At RankMarg, your privacy is of utmost importance to us. This Privacy Policy outlines how we collect, use, and protect your information. By using our platform, you consent to the practices described in this policy.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">1. Information We Collect</h2>
        <p className="mb-4">We may collect the following types of information:</p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Personal Information:</strong> Name, email address, phone number, and other details provided during account creation.
          </li>
          <li>
            <strong>Usage Data:</strong> Information about your interactions with our platform, such as pages visited, challenges played, and performance metrics.
          </li>
          <li>
            <strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers.
          </li>
          <li>
            <strong>Cookies:</strong> Small files stored on your device to enhance your user experience (see Section 7 for details).
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5">
          <li>Provide and maintain the RankMarg platform.</li>
          <li>Personalize your learning experience.</li>
          <li>Improve our services through analytics and feedback.</li>
          <li>Communicate with you regarding updates, promotions, and customer support.</li>
          <li>Ensure platform security and prevent fraud.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">3. Sharing Your Information</h2>
        <p>
          We do not sell your personal information. However, we may share it with:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Service Providers:</strong> Third-party vendors who help us operate the platform (e.g., hosting, analytics, payment processing).
          </li>
          <li>
            <strong>Legal Obligations:</strong> When required by law or to protect our legal rights.
          </li>
          <li>
            <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">4. Protecting Your Information</h2>
        <p>
          We take reasonable measures to protect your information from unauthorized access, disclosure, or misuse. However, no system is completely secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-5">
          <li>Access, update, or delete your personal information.</li>
          <li>Opt-out of receiving promotional emails by using the "Unsubscribe" link.</li>
          <li>
            Request a copy of the data we have collected about you by contacting us.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">6. Children's Privacy</h2>
        <p>
          RankMarg is not intended for children under the age of 13. We do not knowingly collect personal information from children without parental consent.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">7. Cookies and Tracking</h2>
        <p>
          RankMarg uses cookies and similar technologies to enhance your experience. You can manage your cookie preferences in your browser settings. Disabling cookies may affect certain features of the platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">8. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or through a notice on our platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">9. Contact Us</h2>
        <p>
          If you have questions or concerns about this Privacy Policy, please contact us:
        </p>
        <ul className="list-disc pl-5">
          <li>Email: <a href="mailto:support@rankmarg.in" className="text-yellow-500 hover:underline">support@rankmarg.in</a></li>
          {/* <li>Address: [Insert company address]</li> */}
        </ul>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
