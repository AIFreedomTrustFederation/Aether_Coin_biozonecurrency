import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FileDown, Github, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Helmet>
        <title>About Aetherion | FractalCoin</title>
      </Helmet>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">About Aetherion</CardTitle>
          <CardDescription>
            Pioneering the next generation of quantum-resistant blockchain technology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <h2>Our Vision</h2>
            <p>
              Aetherion represents a paradigm shift in blockchain technology, founded on the revolutionary 
              principles of toroidal economics and fractal mathematics. Our mission is to create a truly equitable 
              and sustainable blockchain ecosystem that eliminates the inherent advantage of early adopters and 
              ensures fair value distribution across all participants, regardless of when they join.
            </p>

            <h2>FractalCoin Innovation</h2>
            <p>
              At the heart of Aetherion lies FractalCoin, a groundbreaking cryptocurrency built on revolutionary 
              economic principles including:
            </p>

            <ul>
              <li>
                <strong>Fractal Recursive Tokenomics:</strong> Token distribution and fee structures based on 
                Fibonacci sequences and Mandelbrot set mathematics, creating natural balance throughout the ecosystem.
              </li>
              <li>
                <strong>Toroidal Economics Model:</strong> A circular value flow mechanism that ensures equitable 
                returns for all participants regardless of entry timing.
              </li>
              <li>
                <strong>Death & Resurrection Mining Protocol:</strong> A collaborative mining approach that 
                redistributes computational resources through participant lifecycles, preventing mining power concentration.
              </li>
              <li>
                <strong>Quantum Succession Planning:</strong> Advanced cryptographic mechanisms ensuring digital 
                asset continuity beyond a participant's lifetime.
              </li>
              <li>
                <strong>AI Freedom Trust Federation:</strong> Decentralized governance maintaining mathematical 
                harmony and fair resource distribution in perpetuity.
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 my-6">
              <Link href="/whitepaper">
                <Button className="flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  Read the Whitepaper
                </Button>
              </Link>
              <Button variant="outline" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                View on GitHub
              </Button>
            </div>

            <Separator className="my-6" />

            <h2>Quantum Security First</h2>
            <p>
              Aetherion is built from the ground up with quantum resistance as a core principle. Our 
              advanced cryptographic protocols including CRYSTALS-Kyber, CRYSTALS-Dilithium, and SPHINCS+ 
              ensure that your assets remain secure even against attacks from quantum computers.
            </p>

            <h2>Layer 1 & Layer 2 Architecture</h2>
            <p>
              Our innovative blockchain design incorporates a fractal structure:
            </p>
            <ul>
              <li>
                <strong>Layer 1 (FractalCoin Core):</strong> The foundation layer responsible for core security,
                consensus, and maintaining the mathematical integrity of the entire system.
              </li>
              <li>
                <strong>Layer 2 Solutions:</strong> Scale according to Fibonacci patterns, with transaction fees, 
                computational requirements, and reward structures that maintain proportional relationships to Layer 1.
              </li>
              <li>
                <strong>Cross-Layer Communication:</strong> Governed by mathematical formulas that ensure consistent 
                value transfer regardless of layer complexity.
              </li>
            </ul>

            <h2>Join the Ecosystem</h2>
            <p>
              Whether you're a developer, investor, or blockchain enthusiast, there are many ways to participate 
              in the Aetherion ecosystem:
            </p>
            <ul>
              <li>Explore the quantum-resistant blockchain technology</li>
              <li>Participate in the fair mining system</li>
              <li>Create decentralized applications on our platform</li>
              <li>Join our growing community of innovators</li>
            </ul>

            <div className="bg-muted p-4 rounded-lg mt-6">
              <h3 className="text-lg font-medium mb-2">Ready to experience Aetherion?</h3>
              <p className="mb-4">
                Start your journey with our comprehensive onboarding process to learn about the features
                and benefits of our platform.
              </p>
              <Link href="/onboarding">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meet the Team</CardTitle>
          <CardDescription>The visionaries behind Aetherion and FractalCoin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Team member cards would go here */}
            <div className="p-4 border rounded-lg text-center">
              <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4"></div>
              <h3 className="font-medium text-lg">Dr. Naya Fibonacci</h3>
              <p className="text-sm text-muted-foreground mb-2">Founder & Chief Scientist</p>
              <p className="text-sm">
                Quantum cryptography expert with 15+ years of experience in developing
                post-quantum blockchain solutions.
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4"></div>
              <h3 className="font-medium text-lg">Marco Mandelbrot</h3>
              <p className="text-sm text-muted-foreground mb-2">CTO & Fractal Architect</p>
              <p className="text-sm">
                Mathematics prodigy specializing in fractal algorithms and their
                applications in distributed systems.
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4"></div>
              <h3 className="font-medium text-lg">Ava Toroidal</h3>
              <p className="text-sm text-muted-foreground mb-2">Chief Economist</p>
              <p className="text-sm">
                Revolutionary economic theorist who pioneered the concept of
                circular value flow systems in digital economies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage;