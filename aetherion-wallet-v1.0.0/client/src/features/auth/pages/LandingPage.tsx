import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Shield, Wallet, LockKeyhole, DollarSign, ChevronDown } from 'lucide-react';

/**
 * Landing page component
 * Entry point with authentication options and feature showcase
 */
const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center p-4 bg-background border-b">
        <div className="flex items-center space-x-2">
          <h1 className="font-bold text-xl">Aetherion</h1>
          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
            Quantum Secure
          </span>
        </div>
        <nav className="hidden md:flex space-x-4">
          <a href="#features" className="text-sm">Features</a>
          <a href="#security" className="text-sm">Security</a>
          <a href="#about" className="text-sm">About</a>
          <Button size="sm" variant="ghost">
            <Link href="/dashboard">
              Dashboard
            </Link>
          </Button>
        </nav>
      </header>
      
      <main>
        <section className="py-10 md:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Quantum-Secure Blockchain Wallet for the Future
                </h1>
                <p className="text-xl text-muted-foreground">
                  Aetherion delivers fractal quantum protection for your 
                  digital assets with cutting-edge security architecture.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="group">
                    <Link href="/dashboard">
                      Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline">
                    <Link href="/fractal-explorer">
                      Explore Security
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Shield className="mr-1 h-4 w-4 text-primary" />
                    <span>Quantum-Resistant</span>
                  </div>
                  <div className="flex items-center">
                    <Wallet className="mr-1 h-4 w-4 text-primary" />
                    <span>Multi-Crypto</span>
                  </div>
                  <div className="flex items-center">
                    <LockKeyhole className="mr-1 h-4 w-4 text-primary" />
                    <span>Open Source</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:ml-auto">
                <Card className="w-full max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle>Welcome to Aetherion</CardTitle>
                    <CardDescription>
                      Secure your blockchain assets with quantum protection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                      </TabsList>
                      <TabsContent value="login" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <Input id="login-email" type="email" placeholder="your@email.com" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="login-password">Password</Label>
                            <a 
                              href="#" 
                              className="text-xs text-primary hover:underline"
                            >
                              Forgot password?
                            </a>
                          </div>
                          <Input id="login-password" type="password" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="remember" />
                          <Label htmlFor="remember" className="text-sm font-normal">
                            Remember me for 30 days
                          </Label>
                        </div>
                        <Button className="w-full">
                          <Link href="/dashboard">
                            Sign In
                          </Link>
                        </Button>
                      </TabsContent>
                      <TabsContent value="register" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-name">Full Name</Label>
                          <Input id="register-name" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-email">Email</Label>
                          <Input id="register-email" type="email" placeholder="your@email.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-password">Password</Label>
                          <Input id="register-password" type="password" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="terms" />
                          <Label htmlFor="terms" className="text-sm font-normal">
                            I agree to the{" "}
                            <a href="#" className="text-primary hover:underline">
                              terms and conditions
                            </a>
                          </Label>
                        </div>
                        <Button className="w-full">Create Account</Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground flex justify-center border-t pt-4">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-primary" />
                      <span>Secured with quantum-resistant encryption</span>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="py-10 md:py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Next-Generation Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Aetherion combines cutting-edge blockchain technology with quantum-resistant 
                security to protect your digital assets.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Shield className="h-8 w-8 text-primary" />}
                title="Quantum-Resistant Security"
                description="Protected by CRYSTAL-Kyber, SPHINCS+, and fractal recursive Merkle trees against quantum computing threats."
              />
              <FeatureCard 
                icon={<DollarSign className="h-8 w-8 text-primary" />}
                title="Multi-Currency Support"
                description="Manage Bitcoin, Ethereum, and our native Singularity Coin (SING) in one secure location."
              />
              <FeatureCard 
                icon={<Wallet className="h-8 w-8 text-primary" />}
                title="Fractal Wallet Architecture"
                description="Holographic security where parts verify the whole, creating resilient protection against attacks."
              />
            </div>
            
            <div className="mt-10 text-center">
              <Button variant="outline" size="lg">
                <a href="#more-features" className="flex items-center">
                  Learn More
                  <ChevronDown className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
        
        <section id="security" className="py-10 md:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="order-2 lg:order-1">
                <div className="aspect-square w-full max-w-md mx-auto bg-muted rounded-lg flex items-center justify-center">
                  <Shield className="h-32 w-32 text-primary/20" />
                </div>
              </div>
              
              <div className="space-y-6 order-1 lg:order-2">
                <h2 className="text-3xl font-bold">Quantum-Secure by Design</h2>
                <p className="text-xl text-muted-foreground">
                  Our fractal security architecture provides unmatched protection for your 
                  digital assets against both current and future threats.
                </p>
                
                <div className="space-y-4">
                  <SecurityFeature 
                    title="Post-Quantum Cryptography"
                    description="Using NIST-approved quantum-resistant algorithms to safeguard against future quantum computer attacks."
                  />
                  <SecurityFeature 
                    title="Recursive Merkle Trees"
                    description="Fractal verification structures create holographic security where each part reflects the whole."
                  />
                  <SecurityFeature 
                    title="Zero-Knowledge Proofs"
                    description="zk-STARKs technology ensures transaction privacy while maintaining quantum resistance."
                  />
                </div>
                
                <Button className="mt-4">
                  <Link href="/fractal-explorer">
                    Explore Security Features
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-muted py-8 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3">Aetherion</h3>
              <p className="text-sm text-muted-foreground">
                Next-generation quantum-secure blockchain wallet platform.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Security</a></li>
                <li><a href="#" className="hover:text-foreground">Roadmap</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
                <li><a href="#" className="hover:text-foreground">Guides</a></li>
                <li><a href="#" className="hover:text-foreground">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Aetherion. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature card component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card>
    <CardHeader>
      <div className="mb-2">{icon}</div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// Security feature component
const SecurityFeature = ({ title, description }: { title: string; description: string }) => (
  <div className="space-y-1">
    <h3 className="font-medium flex items-center">
      <Shield className="mr-2 h-4 w-4 text-primary" />
      {title}
    </h3>
    <p className="text-sm text-muted-foreground pl-6">{description}</p>
  </div>
);

export default LandingPage;