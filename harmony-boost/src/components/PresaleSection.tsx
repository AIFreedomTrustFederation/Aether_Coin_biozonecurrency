
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hourglass, ShieldCheck, Coins, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PresaleSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Join the <span className="gradient-text">Presale</span>
          </h2>
          <p className="text-muted-foreground">
            Be among the first to secure <Link to="/tokenomics" className="text-forest-600 hover:underline">Aether Coins</Link> and contribute to global ecosystem preservation with our innovative biozoecurrency - the inverse of traditional eco-cryptocurrencies.
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
                      <CardTitle className="text-2xl">Contribute to the Presale</CardTitle>
                      <CardDescription>Simple steps to join our mission</CardDescription>
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
                      <CardTitle>Presale Benefits</CardTitle>
                      <CardDescription>Advantages of early participation</CardDescription>
                    </div>
                    <ShieldCheck className="h-6 w-6 text-forest-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col p-4 bg-forest-50 rounded-lg">
                      <Coins className="h-6 w-6 text-forest-600 mb-2" />
                      <h3 className="font-medium mb-1">Preferred Token Price</h3>
                      <p className="text-sm text-muted-foreground">Access to tokens at the lowest possible price before public listing.</p>
                    </div>
                    
                    <div className="flex flex-col p-4 bg-forest-50 rounded-lg">
                      <Users className="h-6 w-6 text-forest-600 mb-2" />
                      <h3 className="font-medium mb-1">Governance Rights</h3>
                      <p className="text-sm text-muted-foreground">Early holders will have stronger voting power in ecosystem decisions.</p>
                    </div>
                    
                    <div className="flex flex-col p-4 bg-forest-50 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-forest-600 mb-2" />
                      <h3 className="font-medium mb-1">Staking Bonuses</h3>
                      <p className="text-sm text-muted-foreground">Higher rewards for presale participants who stake their tokens.</p>
                    </div>
                    
                    <div className="flex flex-col p-4 bg-forest-50 rounded-lg">
                      <Hourglass className="h-6 w-6 text-forest-600 mb-2" />
                      <h3 className="font-medium mb-1">Reserved Allocations</h3>
                      <p className="text-sm text-muted-foreground">Priority access to future ecosystem expansion projects.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="impact">
              <Card className="border-forest-100">
                <CardHeader>
                  <CardTitle>Projected Environmental Impact</CardTitle>
                  <CardDescription>Goals for our first year post-launch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-4 bg-forest-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-forest-700 mb-1">100K+</div>
                      <div className="text-sm text-forest-600">Trees to be Planted</div>
                    </div>
                    <div className="p-4 bg-forest-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-forest-700 mb-1">50K</div>
                      <div className="text-sm text-forest-600">Tons CO₂ to Offset</div>
                    </div>
                    <div className="p-4 bg-forest-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-forest-700 mb-1">5K</div>
                      <div className="text-sm text-forest-600">Hectares to Protect</div>
                    </div>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      Your presale contribution will directly fund these conservation efforts once 
                      <Link to="/tokenomics" className="text-forest-600 hover:underline mx-1">Aether Coin</Link> is fully launched.
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
