
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hourglass, ShieldCheck, Coins, Users, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const PresaleSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Join the <span className="gradient-text">ICO Launch</span>
          </h2>
          <p className="text-muted-foreground">
            Join the Kingdom of Heaven on Earth through <span className="text-forest-600 font-medium">biozoecurrency</span>, inverting hidden cryptocurrency through <span className="italic">βίος</span> (physical life) and <span className="italic">ζωή</span> (divine life) principles while <Link to="/tokenomics" className="text-forest-600 hover:underline">ATC</Link> enables humanity's infinite expansion across the stars.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="contribute" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="contribute">How to Participate</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="impact">Future Impact</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contribute">
              <Card className="border-forest-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Contribute to the ICO</CardTitle>
                      <CardDescription>Simple steps to join humanity's multiplanetary future</CardDescription>
                    </div>
                    <Hourglass className="h-8 w-8 text-forest-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 py-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-semibold">1</div>
                      <div>
                        <h3 className="font-medium text-lg">Register for the Presale</h3>
                        <p className="text-muted-foreground">Complete KYC verification to secure your spot in our upcoming token sale.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-semibold">2</div>
                      <div>
                        <h3 className="font-medium text-lg">Choose Your Contribution</h3>
                        <p className="text-muted-foreground">Select your preferred contribution amount, starting from $100.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-semibold">3</div>
                      <div>
                        <h3 className="font-medium text-lg">Receive Your Allocation</h3>
                        <p className="text-muted-foreground">After the presale concludes, tokens will be distributed to your registered wallet.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Button className="flex-1 bg-forest-600 hover:bg-forest-700">
                      Register Interest <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button className="flex-1" variant="outline" asChild>
                      <Link to="/tokenomics">View Tokenomics</Link>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 border-t">
                  <div className="w-full flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Stage:</span>
                    <span className="font-medium text-forest-700">Pre-Registration</span>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="benefits">
              <Card className="border-forest-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>ICO Participant Benefits</CardTitle>
                      <CardDescription>Advantages of early participation in the multiplanetary economy</CardDescription>
                    </div>
                    <ShieldCheck className="h-6 w-6 text-forest-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col p-4 bg-forest-50 rounded-lg">
                      <Coins className="h-6 w-6 text-forest-600 mb-2" />
                      <h3 className="font-medium mb-1">Foundational Entry Price</h3>
                      <p className="text-sm text-muted-foreground">Secure ATC at its initial value before Bitcoin-backed expansion begins driving growth.</p>
                    </div>
                    
                    <div className="flex flex-col p-4 bg-forest-50 rounded-lg">
                      <Users className="h-6 w-6 text-forest-600 mb-2" />
                      <h3 className="font-medium mb-1">Trust Membership</h3>
                      <p className="text-sm text-muted-foreground">Potential eligibility for the Wyoming-based 1000-year Trust with no-repayment loan access.</p>
                    </div>
                    
                    <div className="flex flex-col p-4 bg-forest-50 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-forest-600 mb-2" />
                      <h3 className="font-medium mb-1">ASIC Mining Integration</h3>
                      <p className="text-sm text-muted-foreground">Priority access to our revolutionary mining system with ATC rewards for Bitcoin validation.</p>
                    </div>
                    
                    <div className="flex flex-col p-4 bg-forest-50 rounded-lg">
                      <Hourglass className="h-6 w-6 text-forest-600 mb-2" />
                      <h3 className="font-medium mb-1">Multiplanetary Expansion</h3>
                      <p className="text-sm text-muted-foreground">Reserved allocation in future planetary development initiatives and cross-world commerce.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="impact">
              <Card className="border-forest-100">
                <CardHeader>
                  <CardTitle>Kingdom of Heaven Economic Impact</CardTitle>
                  <CardDescription>The future biozoecurrency and ATC will enable</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-4 bg-forest-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-forest-700 mb-1">∞</div>
                      <div className="text-sm text-forest-600">Sustainable Expansion</div>
                    </div>
                    <div className="p-4 bg-forest-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-forest-700 mb-1">BTC</div>
                      <div className="text-sm text-forest-600">Treasury Backing</div>
                    </div>
                    <div className="p-4 bg-forest-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-forest-700 mb-1">1000+</div>
                      <div className="text-sm text-forest-600">Year Trust Framework</div>
                    </div>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      Your ICO contribution directly supports the first economic system designed to extend beyond Earth—enabling commerce and development across multiple planets through
                      <Link to="/tokenomics" className="text-forest-600 hover:underline mx-1">Aether Coin's (ATC)</Link> revolutionary Bitcoin-backed infinite expansion model.
                    </p>
                    <Button variant="outline" className="border-forest-300 text-forest-700" asChild>
                      <Link to="/tokenomics">View Tokenomics</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default PresaleSection;
