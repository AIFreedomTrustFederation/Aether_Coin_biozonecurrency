import React from 'react';
import { QuantumSecurityDashboard } from '@/features/quantum-security/components/QuantumSecurityDashboard';
import { Helmet } from 'react-helmet';

/**
 * Quantum Security Dashboard Page
 * 
 * A comprehensive dashboard that visualizes FractalCoin's quantum security status
 * with fractal mathematics, sacred geometry, and space-time convergence visualizations.
 */
const QuantumSecurityPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Quantum Security | Aetherion</title>
        <meta name="description" content="Monitor FractalCoin's quantum-resistant security systems" />
      </Helmet>
      
      <QuantumSecurityDashboard />
    </>
  );
};

export default QuantumSecurityPage;