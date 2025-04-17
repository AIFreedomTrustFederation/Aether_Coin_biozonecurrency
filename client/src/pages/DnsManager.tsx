import React from 'react';
import FractalDnsManager from '../components/FractalDnsManager';
import { Separator } from '@/components/ui/separator';

/**
 * DNS Manager Page
 * Integrates the FractalDNS Manager component into the application
 */
const DnsManagerPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500">
          FractalDNS Management System
        </h1>
        <p className="text-gray-400 max-w-3xl mx-auto">
          Manage your quantum-resistant distributed domain name system with fractal sharding technology.
          Create custom top-level domains (TLDs) secured by AetherCore quantum cryptography.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
          <div className="text-blue-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Quantum-Resistant Security</h3>
          <p className="text-gray-400 text-sm">
            All zone data is secured with post-quantum cryptographic algorithms and fractal sharding
            technology designed to withstand attacks from quantum computers.
          </p>
        </div>
        
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
          <div className="text-purple-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Decentralized Architecture</h3>
          <p className="text-gray-400 text-sm">
            DNS records are distributed across multiple nodes in the FractalCoin network,
            providing resilience against censorship and single points of failure.
          </p>
        </div>
        
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
          <div className="text-indigo-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Custom TLD Creation</h3>
          <p className="text-gray-400 text-sm">
            Create your own top-level domains outside the traditional ICANN system,
            with full control over all domain records and resolution policies.
          </p>
        </div>
      </div>
      
      <Separator className="my-8" />
      
      <FractalDnsManager />
    </div>
  );
};

export default DnsManagerPage;