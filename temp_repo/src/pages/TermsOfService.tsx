
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-forest-800 mb-6">Terms of Service</h1>
          <Separator className="mb-8" />
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using Aether Coin services, including our website, platform, API, and any associated services 
              (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to 
              these Terms, please do not use our Services.
            </p>
            <p className="text-gray-700 mb-4">
              These Terms constitute a legally binding agreement between you and Aether Coin regarding your use of the Services.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">2. AI Integration and Data Usage</h2>
            <p className="text-gray-700 mb-4">
              Our Services integrate artificial intelligence technologies including but not limited to OpenAI's services. By using 
              these features, you acknowledge and agree to the following:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Data you provide may be processed by AI systems to improve and deliver our Services.</li>
              <li>Information generated through AI may not always be accurate and should be verified.</li>
              <li>We implement reasonable precautions to protect your data, but cannot guarantee complete security.</li>
              <li>You retain rights to your content, but grant us license to use it for service operation and improvement.</li>
            </ul>
            <p className="text-gray-700 mb-4">
              For more information on how OpenAI processes data, please refer to OpenAI's privacy policy and terms of service.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">3. User Accounts and Responsibilities</h2>
            <p className="text-gray-700 mb-4">
              To access certain features of our Services, you may need to create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Providing accurate and complete information when creating your account.</li>
              <li>Maintaining the security and confidentiality of your login credentials.</li>
              <li>All activities that occur under your account.</li>
              <li>Complying with all applicable laws and regulations while using our Services.</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">4. Cryptocurrency and Financial Disclaimers</h2>
            <p className="text-gray-700 mb-4">
              Aether Coin is a biozoecurrency. By using our Services, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Cryptocurrency values can be highly volatile and may fluctuate significantly.</li>
              <li>We do not provide financial, tax, or legal advice.</li>
              <li>You are solely responsible for your investment decisions and any resulting outcomes.</li>
              <li>Regulatory frameworks for cryptocurrencies vary by jurisdiction and may change over time.</li>
              <li>You must comply with all applicable laws in your jurisdiction regarding cryptocurrency.</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All content, features, and functionality of our Services, including but not limited to text, graphics, logos, 
              button icons, images, audio clips, data compilations, and software, are owned by Aether Coin or our licensors and 
              are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, Aether Coin and its affiliates shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, 
              or goodwill, resulting from your access to or use of our Services.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">7. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our 
              website. Your continued use of our Services after any modifications indicates your acceptance of the revised Terms.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">8. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms, please contact us at legal@aethercoin.example.com.
            </p>
          </section>
          
          <div className="text-gray-600 text-sm italic mt-12">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
