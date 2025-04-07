import { useIsMobile } from '@/hooks/use-mobile';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import PortfolioChart from '@/components/dashboard/PortfolioChart';
import AIMonitoring from '@/components/dashboard/AIMonitoring';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SmartContracts from '@/components/dashboard/SmartContracts';
import CIDManagement from '@/components/dashboard/CIDManagement';
import WalletHealthScore from '@/components/dashboard/WalletHealthScore';
import DomainSummary from '@/components/dashboard/DomainSummary';
import TokenSummary from '@/components/dashboard/TokenSummary';
import NetworkStatus from '@/components/dashboard/NetworkStatus';

const Dashboard = () => {
  const isMobile = useIsMobile();

  return (
    <div className="h-full w-full overflow-y-auto p-4 bg-background">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-1">Wallet Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here's your current portfolio status.</p>
      </div>
      
      {/* Portfolio Summary Section */}
      <PortfolioSummary />
      
      {/* One-Tap Wallet Health Score Section */}
      <div className="mb-6">
        <WalletHealthScore />
      </div>
      
      {/* Chart and AI Monitoring Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PortfolioChart />
        <AIMonitoring />
      </div>
      
      {/* Summary Cards Section - Domains, Tokens, Network */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DomainSummary />
        <TokenSummary />
        <NetworkStatus />
      </div>
      
      {/* Recent Transactions and Smart Contracts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RecentTransactions />
        <SmartContracts />
      </div>
      
      {/* CID Management Section - Hide on mobile for simplicity */}
      {!isMobile && <CIDManagement />}
    </div>
  );
};

export default Dashboard;
