import React from 'react';
import { QuantumSecureVaultManager } from '../components/security/QuantumSecureVaultManager';

export function SecurityPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Quantum Security Center</h1>
      <div className="grid grid-cols-1 gap-6">
        <QuantumSecureVaultManager />
      </div>
    </div>
  );
}