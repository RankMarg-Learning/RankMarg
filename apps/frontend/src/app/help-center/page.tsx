import React from "react";

const HelpCenter = () => {
  return (
    <div className="help-center max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-yellow-500 text-center mb-8">
        RankMarg Help Center
      </h1>

      {/* FAQ Section */}
      <section className="faq mb-12">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="faq-item border-b pb-4 mb-4">
          <h3 className="font-medium text-lg">1. How do I participate in challenges?</h3>
          <p className="text-gray-600">
            To join a challenge, navigate to the **Challenges** section, select a challenge, and click on the "Join" button. Ensure you have enough coins to participate!
          </p>
        </div>
        <div className="faq-item border-b pb-4 mb-4">
          <h3 className="font-medium text-lg">2. How is my Elo ranking calculated?</h3>
          <p className="text-gray-600">
            Your Elo ranking is based on your performance in challenges. Winning increases your rating, while losing decreases it. The starting Elo rating is 100, with a constant adjustment factor of 10.
          </p>
        </div>
        <div className="faq-item border-b pb-4 mb-4">
          <h3 className="font-medium text-lg">3. What can I purchase with coins?</h3>
          <p className="text-gray-600">
            Coins can be used to buy merchandise like hoodies and exclusive RankMarg items. Visit the **Store** section for more details.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact mb-12">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="text-gray-600 mb-4">
          Need further assistance? Reach out to our support team:
        </p>
        <ul className="list-disc list-inside text-gray-600">
          <li>Email: <a href="mailto:support@rankmarg.com" className="text-yellow-500">support@rankmarg.in</a></li>
          {/* <li>Phone: +1 </li> */}
          {/* <li>Live Chat: Available in the **Help** section of your dashboard</li> */}
        </ul>
      </section>

      {/* Tutorials Section */}
      <section className="tutorials">
        <h2 className="text-2xl font-semibold mb-4">Tutorials</h2>
        <p className="text-gray-600 mb-4">
          Explore guides and tutorials to make the most of RankMarg:
        </p>
        <ul className="list-disc list-inside text-gray-600">
          <li><a href="/tutorials/getting-started" className="text-yellow-500">Getting Started with RankMarg</a></li>
          <li><a href="/tutorials/improving-ranking" className="text-yellow-500">How to Improve Your Elo Ranking</a></li>
          <li><a href="/tutorials/coins-store" className="text-yellow-500">Using Coins in the Store</a></li>
        </ul>
      </section>
    </div>
  );
};

export default HelpCenter;
