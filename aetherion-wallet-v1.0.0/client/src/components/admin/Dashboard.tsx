import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import WalletVerification from './WalletVerification';
import { BarChart2, DollarSign, Users, Shield, Cpu, Wallet } from 'lucide-react';

// Mock data for the dashboard stats
const dashboardStats = [
  {
    title: 'Total Funds',
    value: '$9,500,000',
    description: 'Across all fund categories',
    icon: <DollarSign className="h-4 w-4 text-primary" />
  },
  {
    title: 'Circulating Supply',
    value: '1,000,000,000',
    description: 'SING Tokens (10% of total)',
    icon: <Wallet className="h-4 w-4 text-primary" />
  },
  {
    title: 'Token Price',
    value: '$0.000710',
    change: '+9.9%',
    description: 'From initial price $0.000646',
    icon: <BarChart2 className="h-4 w-4 text-primary" />
  },
  {
    title: 'Active Users',
    value: '257',
    description: 'Registered wallet users',
    icon: <Users className="h-4 w-4 text-primary" />
  },
  {
    title: 'Security Status',
    value: 'Protected',
    description: 'Quantum-resistant encryption active',
    icon: <Shield className="h-4 w-4 text-primary" />
  },
  {
    title: 'AI Agents',
    value: '39',
    description: 'Smart contract agents deployed',
    icon: <Cpu className="h-4 w-4 text-primary" />
  }
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {stat.icon}
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <Badge className="ml-2 bg-green-500" variant="secondary">{stat.change}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Wallet Verification Section */}
      <div className="mt-8">
        <WalletVerification />
      </div>
    </div>
  );
};

export default Dashboard;