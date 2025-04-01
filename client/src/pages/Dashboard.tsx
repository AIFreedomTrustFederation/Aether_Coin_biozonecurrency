import { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileMenu from '@/components/layout/MobileMenu';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import PortfolioChart from '@/components/dashboard/PortfolioChart';
import AIMonitoring from '@/components/dashboard/AIMonitoring';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SmartContracts from '@/components/dashboard/SmartContracts';
import CIDManagement from '@/components/dashboard/CIDManagement';

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleMobileMenu={toggleMobileMenu} />
        
        {/* Dashboard */}
        <main className="flex-1 overflow-y-auto p-4 bg-background">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-1">Wallet Overview</h2>
            <p className="text-muted-foreground">Welcome back! Here's your current portfolio status.</p>
          </div>
          
          {/* Portfolio Summary Section */}
          <PortfolioSummary />
          
          {/* Chart and AI Monitoring Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <PortfolioChart />
            <AIMonitoring />
          </div>
          
          {/* Recent Transactions and Smart Contracts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RecentTransactions />
            <SmartContracts />
          </div>
          
          {/* CID Management Section */}
          <CIDManagement />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
