import React from 'react';
import BridgeTestDashboard from '../components/bridge/BridgeTestDashboard';

/**
 * Bridge Test Page Component
 * 
 * This page component provides access to the Bridge Test Dashboard
 * for running quantum superposition tests on cross-chain bridges.
 */
const BridgeTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <BridgeTestDashboard />
    </div>
  );
};

export default BridgeTestPage;