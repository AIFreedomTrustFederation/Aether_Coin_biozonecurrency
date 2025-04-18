import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

// Quantum-themed styling with security focus
const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <Head>
        <title>Aetherion | Quantum-Resistant Blockchain Ecosystem</title>
        <meta name="description" content="Aetherion is a quantum-resistant blockchain ecosystem with FractalCoin integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="px-6 py-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              <span className="text-blue-400">Aetherion</span> Ecosystem
            </h1>
          </div>
          <nav>
            <ul className="flex space-x-6 text-white">
              <li><Link href="/wallet" className="hover:text-blue-400 transition">Wallet</Link></li>
              <li><Link href="/dapp" className="hover:text-blue-400 transition">DApps</Link></li>
              <li><Link href="/tokenomics" className="hover:text-blue-400 transition">Tokenomics</Link></li>
              <li><Link href="/aicon" className="hover:text-blue-400 transition">AIcoin</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Pioneering <span className="text-blue-400">Quantum-Resistant</span> Blockchain Technology
              </h2>
              <p className="text-slate-300 text-lg mb-8">
                Aetherion combines advanced quantum-resistant cryptography with 
                innovative fractal financial systems to create the next generation of 
                secure, decentralized infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  href="/wallet" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium text-center transition"
                >
                  Launch Wallet
                </Link>
                <Link 
                  href="/aicon" 
                  className="border border-blue-400 text-blue-400 hover:bg-blue-400/10 px-8 py-3 rounded-md font-medium text-center transition"
                >
                  Explore AIcoin
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-full bg-blue-500/20 absolute -top-10 -right-10 w-64 h-64 blur-3xl"></div>
              <div className="aspect-square rounded-full bg-purple-500/20 absolute -bottom-10 -left-10 w-64 h-64 blur-3xl"></div>
              <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Security Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Quantum Resistance</span>
                      <span className="text-blue-400">99.9%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Transaction Security</span>
                      <span className="text-blue-400">100%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Network Uptime</span>
                      <span className="text-blue-400">99.99%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '99.99%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Fractal Stability</span>
                      <span className="text-blue-400">98.7%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '98.7%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Aetherion Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition">
                <div className="bg-blue-500/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Join the Quantum-Resistant Revolution
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Experience the future of secure, decentralized finance with Aetherion's innovative ecosystem.
              Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/wallet"
                className="bg-white hover:bg-blue-50 text-blue-600 px-8 py-3 rounded-md font-medium transition"
              >
                Get Started
              </Link>
              <Link
                href="/learn-more"
                className="bg-transparent hover:bg-blue-700 text-white border border-white px-8 py-3 rounded-md font-medium transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Aetherion</h3>
              <p className="text-slate-400">
                A quantum-resistant blockchain ecosystem with innovative fractal finance mechanisms.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/whitepaper" className="hover:text-blue-400 transition">Whitepaper</Link></li>
                <li><Link href="/documentation" className="hover:text-blue-400 transition">Documentation</Link></li>
                <li><Link href="/tokenomics" className="hover:text-blue-400 transition">Tokenomics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Ecosystem</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/wallet" className="hover:text-blue-400 transition">Wallet</Link></li>
                <li><Link href="/dapp" className="hover:text-blue-400 transition">DApps</Link></li>
                <li><Link href="/aicon" className="hover:text-blue-400 transition">AIcoin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/terms-of-service" className="hover:text-blue-400 transition">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-blue-400 transition">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500">
            <p>&copy; {new Date().getFullYear()} Aetherion Ecosystem. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature data
const features = [
  {
    title: 'Quantum-Resistant Security',
    description: 'Advanced cryptographic algorithms designed to withstand attacks from both classical and quantum computers.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Fractal Reserve System',
    description: 'A revolutionary financial model providing equitable returns regardless of entry timing.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    title: 'AIcoin Integration',
    description: 'Reward computational contributions to LLM training through the innovative Death & Resurrection protocol.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
        <path d="M12 2v6.5" />
        <path d="M18.4 6.5 13.5 9" />
        <path d="M13.5 15 18.4 17.5" />
        <path d="M12 15.5V22" />
        <path d="M10.5 15 5.6 17.5" />
        <path d="M5.6 6.5 10.5 9" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'AetherSphere Security',
    description: 'Multi-layered security framework combining WebAssembly isolation, mutual TLS, and Shamir's Secret Sharing.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 12h-6.5a2 2 0 1 0 0 4H12" />
        <path d="M12 8h3.5a2 2 0 1 1 0 4H8" />
      </svg>
    ),
  },
  {
    title: 'Autonomous Economic Agents',
    description: 'Self-improving AI systems that monitor, adapt, and optimize economic interactions within the ecosystem.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 7h.01" />
        <path d="M17 7h.01" />
        <path d="M7 17h.01" />
        <path d="M17 17h.01" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    title: 'FractalChain Architecture',
    description: 'A multi-layered blockchain design with specialized tokens for different ecosystem functions.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
        <path d="m2 18 10-10 3 3" />
        <path d="m5 15 7 7 10-10-7-7-10 10Z" />
      </svg>
    ),
  },
];

export default Home;