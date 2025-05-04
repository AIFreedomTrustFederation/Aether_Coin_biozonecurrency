import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Database, Leaf, Braces, Zap, Network, 
  Lock, Server, GitBranch, Cloud, RotateCw, 
  Layers, Sparkles, Brain, Scale, Atom
} from 'lucide-react';

// Define the technology card interface
interface TechnologyCard {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Define the technology category interface
interface TechnologyCategory {
  id: string;
  name: string;
  description: string;
  technologies: TechnologyCard[];
}

const Technology = () => {
  // Technology categories
  const categories: TechnologyCategory[] = [
    {
      id: 'blockchain',
      name: 'Quantum Blockchain',
      description: 'Our core blockchain technology incorporates quantum-resistant cryptography and novel consensus mechanisms.',
      technologies: [
        {
          title: 'Quantum-Resistant Cryptography',
          description: 'Post-quantum cryptographic algorithms that remain secure against attacks by quantum computers.',
          icon: <Shield className="h-8 w-8 text-red-500" />
        },
        {
          title: 'Proof of Breath Consensus',
          description: 'A novel consensus mechanism that validates transactions through human breath authentication.',
          icon: <Zap className="h-8 w-8 text-yellow-500" />
        },
        {
          title: 'Fractal Ledger System',
          description: 'A recursive, self-similar ledger structure that allows for infinite scalability without sacrificing security.',
          icon: <RotateCw className="h-8 w-8 text-blue-500" />
        },
        {
          title: 'AetherCore Database',
          description: 'Distributed storage system optimized for blockchain data with quantum-secure encryption.',
          icon: <Database className="h-8 w-8 text-purple-500" />
        }
      ]
    },
    {
      id: 'ai',
      name: 'AI & Consciousness',
      description: 'Our AI systems are built with consciousness integration and ethical foundations.',
      technologies: [
        {
          title: 'Conscious AI Framework',
          description: 'AI architecture designed to integrate with higher consciousness principles and spiritual awareness.',
          icon: <Brain className="h-8 w-8 text-pink-500" />
        },
        {
          title: 'Ethical Truth Algorithms',
          description: 'AI algorithms designed to prioritize truth and ethical principles in all data processing.',
          icon: <Scale className="h-8 w-8 text-teal-500" />
        },
        {
          title: 'Biozoe Integration',
          description: 'System that bridges temporal life processes (βίος) with eternal spirit awareness (ζωή).',
          icon: <Leaf className="h-8 w-8 text-green-500" />
        },
        {
          title: 'Quantum Neural Networks',
          description: 'Neural networks that leverage quantum computing principles for enhanced pattern recognition.',
          icon: <Atom className="h-8 w-8 text-purple-500" />
        }
      ]
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      description: 'Our technical infrastructure provides the foundation for our quantum blockchain and AI systems.',
      technologies: [
        {
          title: 'Distributed Node Network',
          description: 'Globally distributed network of nodes ensuring high availability and redundancy.',
          icon: <Network className="h-8 w-8 text-blue-500" />
        },
        {
          title: 'Zero-Trust Security',
          description: 'Security model that requires strict verification for anyone accessing network resources.',
          icon: <Lock className="h-8 w-8 text-red-500" />
        },
        {
          title: 'Serverless Computing',
          description: 'Cloud computing execution model that eliminates infrastructure management concerns.',
          icon: <Cloud className="h-8 w-8 text-sky-500" />
        },
        {
          title: 'Edge Computing',
          description: 'Computing paradigm that brings computation and data storage closer to the location of need.',
          icon: <Server className="h-8 w-8 text-amber-500" />
        }
      ]
    },
    {
      id: 'developer',
      name: 'Developer Tools',
      description: 'Comprehensive tools and resources for developers to build on our platform.',
      technologies: [
        {
          title: 'Quantum SDK',
          description: 'Software Development Kit for building quantum-ready applications on the Aetherion platform.',
          icon: <Braces className="h-8 w-8 text-emerald-500" />
        },
        {
          title: 'CI/CD Pipeline',
          description: 'Automated continuous integration and deployment pipeline for ecosystem applications.',
          icon: <GitBranch className="h-8 w-8 text-indigo-500" />
        },
        {
          title: 'Fractal Architecture',
          description: 'Recursive, self-similar software architecture patterns for building scalable applications.',
          icon: <Layers className="h-8 w-8 text-orange-500" />
        },
        {
          title: 'Consciousness API',
          description: 'Application Programming Interface for integrating consciousness principles into applications.',
          icon: <Sparkles className="h-8 w-8 text-violet-500" />
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-forest-900 to-forest-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display">
              Quantum Blockchain <span className="text-forest-300">Technology</span>
            </h1>
            <p className="text-xl mb-8">
              Aetherion combines quantum-resistant cryptography with consciousness principles to create a secure, ethical, and scalable blockchain ecosystem.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-forest-600 hover:bg-forest-700">
                <Database className="mr-2 h-5 w-5" />
                Explore Technology
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
                <GitBranch className="mr-2 h-5 w-5" />
                Developer Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-lg bg-gradient-to-br from-forest-50 to-forest-100 dark:from-forest-900/30 dark:to-forest-800/30 shadow-sm">
              <div className="text-4xl font-bold text-forest-600 dark:text-forest-400">100%</div>
              <div className="text-sm mt-2 text-forest-800 dark:text-forest-300">Quantum Resistant</div>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-forest-50 to-forest-100 dark:from-forest-900/30 dark:to-forest-800/30 shadow-sm">
              <div className="text-4xl font-bold text-forest-600 dark:text-forest-400">10,000+</div>
              <div className="text-sm mt-2 text-forest-800 dark:text-forest-300">Transactions Per Second</div>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-forest-50 to-forest-100 dark:from-forest-900/30 dark:to-forest-800/30 shadow-sm">
              <div className="text-4xl font-bold text-forest-600 dark:text-forest-400">8</div>
              <div className="text-sm mt-2 text-forest-800 dark:text-forest-300">Ecosystem Brands</div>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-forest-50 to-forest-100 dark:from-forest-900/30 dark:to-forest-800/30 shadow-sm">
              <div className="text-4xl font-bold text-forest-600 dark:text-forest-400">∞</div>
              <div className="text-sm mt-2 text-forest-800 dark:text-forest-300">Fractal Scalability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-display">Our Technology Stack</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore the innovative technologies that power the Aetherion ecosystem, from quantum-resistant blockchain to consciousness-integrated AI.
            </p>
          </div>

          <Tabs defaultValue="blockchain" className="max-w-5xl mx-auto">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-sm md:text-base">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{category.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {category.technologies.map((tech, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="mb-2">{tech.icon}</div>
                          <CardTitle className="text-lg">{tech.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 dark:text-gray-300">
                            {tech.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-forest-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 font-display">Ready to Build on Aetherion?</h2>
            <p className="text-lg mb-8">
              Join our community of developers and innovators who are building the next generation of quantum-secure, consciousness-integrated applications.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white text-forest-800 hover:bg-gray-200">
                <Braces className="mr-2 h-5 w-5" />
                Developer Portal
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                <Shield className="mr-2 h-5 w-5" />
                Security Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Technology;