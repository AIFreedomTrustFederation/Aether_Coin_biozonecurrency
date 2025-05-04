import React from "react";
import { Helmet } from "react-helmet";
import BrandsShowcase from "@/components/BrandsShowcase";
import { Separator } from "@/components/ui/separator";
import { Building, Globe, Server } from "lucide-react";

const Brands = () => {
  return (
    <>
      <Helmet>
        <title>Brand Ecosystem | AI Freedom Trust</title>
        <meta name="description" content="Explore the AI Freedom Trust brand ecosystem, featuring Aether Coin, FractalCoin, Biozoe, and more." />
      </Helmet>

      <section className="py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <div className="inline-block p-3 rounded-2xl bg-muted">
              <Building className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
              AI Freedom Trust <span className="gradient-text">Brand Ecosystem</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
              Our family of interconnected brands working together to create a more secure, ethical, and conscious technological future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Unified Ecosystem</h3>
              <p className="text-muted-foreground">
                Each brand maintains its distinct identity while sharing a common technological foundation and ethical principles.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Server className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Shared Infrastructure</h3>
              <p className="text-muted-foreground">
                Our brands leverage common infrastructure, creating synergies and enabling seamless integration across platforms.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Domain Organization</h3>
              <p className="text-muted-foreground">
                Each brand has its dedicated subdomain (prefix.aifreedomtrust.com) for consistent identity and streamlined access.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Separator />
      
      <BrandsShowcase />
      
      <section className="py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
              Ecosystem <span className="gradient-text">Integration</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our brands work together seamlessly, creating a holistic technology ecosystem with unified authentication, shared data, and consistent user experience.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {integrationFeatures.map((feature, index) => (
                <div key={index} className="bg-background p-6 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    {feature.icon}
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const integrationFeatures = [
  {
    title: "Single Sign-On",
    icon: <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">1</div>,
    description: "Use your credentials across all our platforms with our unified authentication system."
  },
  {
    title: "Shared Data Layer",
    icon: <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">2</div>,
    description: "Your profile and preferences sync automatically between all our services."
  },
  {
    title: "Universal Wallet",
    icon: <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">3</div>,
    description: "Manage all your tokens and assets from a single secure wallet interface."
  },
  {
    title: "Cross-Platform Tools",
    icon: <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">4</div>,
    description: "Tools and utilities work consistently across all our platforms and brands."
  },
  {
    title: "Unified Documentation",
    icon: <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">5</div>,
    description: "Find all documentation in one place with consistent formatting and structure."
  },
  {
    title: "Integrated APIs",
    icon: <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">6</div>,
    description: "Build applications that leverage the full power of our entire ecosystem."
  }
];

export default Brands;