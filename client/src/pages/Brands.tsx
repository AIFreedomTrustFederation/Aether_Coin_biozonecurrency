import React from 'react';
import BrandsShowcase from '@/components/BrandsShowcase';
import { Sparkles, Globe, Link as LinkIcon, GitBranch, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Brands = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-forest-900 to-forest-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center">
                <Sparkles className="text-forest-300 h-6 w-6 mr-2" />
                <span className="text-forest-300 font-medium">Aetherion Brand Ecosystem</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                The Network of <span className="text-forest-300">Quantum Consciousness</span> Brands
              </h1>
              <p className="text-lg mb-8 text-gray-200">
                Explore our interconnected ecosystem of brands, each representing a specific aspect of the Aetherion quantum blockchain platform and AI Freedom Trust organization.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-forest-600 hover:bg-forest-700">
                  <Globe className="mr-2 h-5 w-5" />
                  Visit Main Site
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
                  <GitBranch className="mr-2 h-5 w-5" />
                  View GitHub Organization
                </Button>
              </div>
            </div>
            <div className="w-full max-w-md">
              <div className="relative rounded-xl overflow-hidden border-2 border-forest-700/50 shadow-xl">
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'Aether Coin', path: 'atc' },
                      { name: 'FractalCoin', path: 'fractalcoin' },
                      { name: 'Biozoe', path: 'biozoe' },
                      { name: 'AI Freedom', path: 'ai' },
                    ].map((item, index) => (
                      <div key={index} className="bg-white/10 p-4 rounded-lg flex items-center justify-between hover:bg-white/20 transition-colors">
                        <span className="text-sm font-medium">{item.name}</span>
                        <LinkIcon className="h-4 w-4 opacity-70" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-white/10 p-4 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium">All Brand Sites</span>
                    <span className="bg-forest-600 text-white text-xs px-2 py-1 rounded">8 Sites</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Showcase Section */}
      <BrandsShowcase />

      {/* Deployment Info Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 font-display">Continuous Deployment Pipeline</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Our ecosystem sites are deployed automatically through GitHub Pages with a robust CI/CD pipeline that ensures seamless updates and consistent branding across all platforms.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                <span>View GitHub Actions</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                <span>Fork Template</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Brands;