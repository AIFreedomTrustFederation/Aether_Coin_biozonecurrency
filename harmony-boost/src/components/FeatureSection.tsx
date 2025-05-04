
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Leaf, Recycle, Shield, Sprout, TreeDeciduous } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <Leaf className="h-10 w-10 text-forest-600" />,
    title: "Ecosystem Restoration",
    description: "Direct funding to critical ecosystem restoration projects around the world."
  },
  {
    icon: <Shield className="h-10 w-10 text-forest-600" />,
    title: "Biozoe Protection",
    description: "Secure and protect endangered ecosystems through tokenized biozoe conservation efforts."
  },
  {
    icon: <Activity className="h-10 w-10 text-forest-600" />,
    title: "Carbon Tracking",
    description: "Real-time monitoring of carbon offsets and environmental impact."
  },
  {
    icon: <Recycle className="h-10 w-10 text-forest-600" />,
    title: "Sustainable Rewards",
    description: "Earn Aether Coins through verified sustainable actions and investments."
  },
  {
    icon: <Sprout className="h-10 w-10 text-forest-600" />,
    title: "Growth Incentives",
    description: "Staking rewards that grow alongside ecosystem regeneration metrics."
  },
  {
    icon: <TreeDeciduous className="h-10 w-10 text-forest-600" />,
    title: "Transparent Impact",
    description: "Blockchain-verified reporting on the environmental impact of each token."
  }
];

const FeatureSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Powering Environmental <span className="gradient-text">Regeneration</span>
          </h2>
          <p className="text-muted-foreground">
            <Link to="/tokenomics" className="text-forest-600 hover:underline">Aether Coin</Link> uses blockchain technology to create transparent, sustainable funding 
            for critical environmental initiatives around the world. As a biozoecurrency, we represent the inverse of traditional eco-cryptocurrencies by uniting both physical and spiritual aspects of existence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="eco-card-hover border-forest-100">
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
