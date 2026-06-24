import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import clsx from 'clsx';
import { Wallet, Shield, Zap, ArrowRight } from 'lucide-react';
import LightweightLogo from '../client/src/components/common/LightweightLogo';
import { Button } from '../client/src/components/ui/button';

const WalletLandingPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      document.body.style.overflow = '';
    }, 100);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const preloadRoutes = () => {
      ['/wallet', '/dashboard', '/transactions'].forEach((route) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'document';
        document.head.appendChild(link);
      });
    };
    const timer = setTimeout(preloadRoutes, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-900 text-white neon-scrollbar">
      <Helmet>
        <title>Aetherion Wallet</title>
        <meta name="description" content="Quantum-Resistant Wallet for Secure Digital Asset Management" />
      </Helmet>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24 flex flex-col items-center">
        <div className="mb-4">
          <LightweightLogo size="xl" color="#aa00ff" />
        </div>

        <h1
          className="text-5xl md:text-6xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 neon-glow neon-pulse"
          aria-label="Aetherion Wallet"
        >
          Aetherion Wallet
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 max-w-3xl text-gray-300 neon-glow">
          Secure, Quantum-Resistant Digital Asset Management
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link href="/wallet">
            <Button
              aria-label="Create Wallet"
              className={clsx(
                'bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg flex items-center',
                'neon-button-advanced'
              )}
            >
              <Wallet className="mr-2 h-5 w-5" aria-hidden="true" />
              Create Wallet
            </Button>
          </Link>

          <Link href="/wallet?tab=backup-restore">
            <Button
              aria-label="Backup and Restore"
              variant="outline"
              className="border-blue-400 text-blue-400 hover:bg-blue-400/10 px-6 py-3 rounded-md text-lg flex items-center neon-border"
            >
              <Shield className="mr-2 h-5 w-5" aria-hidden="true" />
              Backup & Restore
            </Button>
          </Link>

          <Link href="/wallet?tab=web3-connect">
            <Button
              aria-label="Connect External Wallet"
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-400/10 px-6 py-3 rounded-md text-lg flex items-center neon-border"
            >
              <Zap className="mr-2 h-5 w-5" aria-hidden="true" />
              Connect External Wallet
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 w-full max-w-6xl">
          {[
            {
              icon: <Shield className="h-6 w-6 text-white" aria-hidden="true" />,
              title: 'Quantum-Resistant Security',
              text: 'Your assets are protected against both current and future computational threats, including quantum attacks.',
              bg: 'bg-blue-500',
            },
            {
              icon: <Wallet className="h-6 w-6 text-white" aria-hidden="true" />,
              title: 'Multi-Asset Support',
              text: 'Manage multiple cryptocurrencies and digital assets in one secure, easy-to-use interface.',
              bg: 'bg-purple-500',
            },
            {
              icon: <Zap className="h-6 w-6 text-white" aria-hidden="true" />,
              title: 'Seamless Transactions',
              text: 'Send and receive assets with confidence through our intuitive and secure transaction system.',
              bg: 'bg-indigo-500',
            },
          ].map(({ icon, title, text, bg }, idx) => (
            <div key={idx} className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
              <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center mb-4', bg)}>
                {icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-400">{text}</p>
            </div>
          ))}
        </div>

        {/* Getting Started */}
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Getting Started is Easy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              ['Create Your Wallet', 'Set up a new quantum-resistant wallet in just a few clicks'],
              ['Secure Your Keys', 'Backup your wallet with our advanced security features'],
              ['Start Transacting', 'Send, receive, and manage your digital assets securely'],
            ].map(([title, description], index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <h3 className="text-lg font-medium mb-2">{title}</h3>
                <p className="text-gray-400">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/wallet">
              <Button
                aria-label="Get Started Now"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-md text-lg flex items-center mx-auto"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Aetherion Wallet — Secure, Quantum-Resistant Digital Asset Management</p>
          <p className="mt-2 text-sm">© {new Date().getFullYear()} Aetherion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WalletLandingPage;
