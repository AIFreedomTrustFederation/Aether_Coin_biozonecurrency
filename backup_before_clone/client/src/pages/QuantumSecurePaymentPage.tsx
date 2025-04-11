import React from 'react';
import QuantumSecurePayment from '@/components/payment/QuantumSecurePayment';
import { Shield, Lock } from 'lucide-react';

const QuantumSecurePaymentPage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Shield className="h-10 w-10 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Quantum Secure Payments</h1>
          <p className="text-gray-500">
            Process payments with quantum-resistant cryptography for enhanced security
          </p>
        </header>
        
        <QuantumSecurePayment />
        
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-600" />
            How Quantum Security Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Quantum Resistant Cryptography</h3>
              <p className="text-sm text-slate-600">
                Our payment system uses next-generation cryptographic algorithms designed to resist attacks from quantum computers. This secures your transactions against future quantum threats that could break traditional cryptography.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Temporal Entanglement</h3>
              <p className="text-sm text-slate-600">
                Each transaction is secured with temporal entanglement - creating a time-bound quantum signature that verifies the transaction happened at a specific point in time and cannot be altered retroactively.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Multi-Level Security</h3>
              <p className="text-sm text-slate-600">
                Choose from three security levels - standard (SHA-256), enhanced (SHA-384), and quantum (dual-layered SHA-512) - each providing increasingly strong protection for your transactions.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Verification System</h3>
              <p className="text-sm text-slate-600">
                After payment, the system allows you to verify the quantum security properties of your transaction, ensuring the payment was properly secured with quantum-resistant cryptography.
              </p>
            </div>
          </div>
          
          <div className="pt-4">
            <div className="flex items-center gap-2 text-purple-700 text-sm">
              <Shield className="h-4 w-4" />
              <span className="font-medium">All payments are secured with SHA-512 quantum-resistant signatures by default</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumSecurePaymentPage;