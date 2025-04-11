
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-forest-800 mb-6">Privacy Policy</h1>
          <Separator className="mb-8" />
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              This Privacy Policy outlines how Aether Coin ("we", "our", or "us") collects, uses, and protects 
              your information when you use our services, website, and platform. We are committed to protecting 
              your privacy and handling your data with transparency and security.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">2. FractalCoin Node Network and LLM Training</h2>
            <p className="text-gray-700 mb-4">
              Aether Coin utilizes a proprietary encrypted FractalCoin node network system for training and 
              deploying Large Language Models (LLMs). This innovative approach ensures:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Your data remains encrypted throughout the entire training and inference process</li>
              <li>Processing is distributed across our secure decentralized network</li>
              <li>No single node has access to your complete data at any time</li>
              <li>Federated learning techniques that improve model quality while preserving privacy</li>
              <li>Zero-knowledge proofs for validating training without exposing data</li>
            </ul>
            <p className="text-gray-700 mb-4">
              By leveraging blockchain technology through our FractalCoin network, we've created a system where 
              AI training can occur without compromising user privacy or data security.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">3. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              To provide our services, we may collect the following types of information:
            </p>
            <h3 className="text-lg font-medium text-forest-600 mt-4 mb-2">3.1 Personal Information</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Basic account details: name, email address, wallet address</li>
              <li>Transaction data necessary for processing on the FractalCoin network</li>
              <li>Profile information you choose to provide</li>
            </ul>
            <h3 className="text-lg font-medium text-forest-600 mt-4 mb-2">3.2 Usage Information</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Interactions with our platform</li>
              <li>Service usage patterns</li>
              <li>Device and connection information</li>
            </ul>
            <h3 className="text-lg font-medium text-forest-600 mt-4 mb-2">3.3 AI Training Data</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Queries and responses when using our AI-powered features</li>
              <li>Content processed through our services (always encrypted)</li>
              <li>Feedback provided on AI model outputs</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">4. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              Your data is used for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Providing, maintaining, and improving our services</li>
              <li>Processing transactions on the FractalCoin network</li>
              <li>Training our AI models through our encrypted node network</li>
              <li>Enhancing security and preventing fraud</li>
              <li>Personalizing your experience</li>
              <li>Communicating with you about services, updates, and promotions</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">5. Data Security and Encryption</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-leading security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>End-to-end encryption for all data processed through our network</li>
              <li>Blockchain-based immutable audit logs of all data access</li>
              <li>Decentralized storage with sharded encryption keys</li>
              <li>Multi-layered security protocols that meet or exceed industry standards</li>
              <li>Regular security audits and penetration testing</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Our FractalCoin node architecture ensures that even in the unlikely event of a breach, 
              attackers cannot access meaningful or complete data.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">6. Your Rights and Choices</h2>
            <p className="text-gray-700 mb-4">
              You have several rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Access and download your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your data (with certain limitations)</li>
              <li>Opt-out of LLM training with your data</li>
              <li>Control marketing communications</li>
              <li>Data portability</li>
            </ul>
            <p className="text-gray-700 mb-4">
              To exercise these rights, please contact us at privacy@aethercoin.example.com.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">7. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices
              or for legal, operational, or regulatory reasons. We will notify you of any material changes
              through our website or via email.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-forest-700 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions or concerns about this Privacy Policy or our data practices,
              please contact us at:
            </p>
            <p className="text-gray-700 mb-4">
              privacy@aethercoin.example.com
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

export default PrivacyPolicy;
