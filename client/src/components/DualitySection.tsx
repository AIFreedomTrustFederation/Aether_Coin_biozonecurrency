
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Circle, Heart, Droplet, Sun, Earth } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const DualitySection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-forest-50 to-water-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="text-forest-700">Quantum</span> & <span className="text-water-600">AI</span>: The AetherCore Vision
          </h2>
          <p className="text-muted-foreground">
            Uniting advanced quantum technologies with AI-powered governance through the <Link to="/tokenomics" className="text-forest-600 hover:underline">AI Freedom Trust</Link>, enabling humanity's multiplanetary economic framework.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Bio Column */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Leaf className="h-8 w-8 text-forest-600" />
              <h3 className="text-2xl font-display font-bold text-forest-700">Quantum Technologies</h3>
            </div>
            
            <Card className="eco-card-hover border-forest-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Earth className="h-5 w-5 text-forest-600" />
                  Bitcoin-Backed Reserve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Leveraging Bitcoin's inherent scarcity as the foundation for infinite ATC expansion,
                  secured through quantum-resistant cryptographic protocols and escrow mechanisms.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="eco-card-hover border-forest-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-forest-600" />
                  Multiplanetary Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Specialized economic and communication protocols designed to function across planetary distances,
                  ensuring seamless operations despite light-speed communication delays.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Zoe Column */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sun className="h-8 w-8 text-water-600" />
              <h3 className="text-2xl font-display font-bold text-water-600">AI Freedom Trust</h3>
            </div>
            
            <Card className="eco-card-hover border-water-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-water-600" />
                  Generational Governance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  A 1000-year Trust framework established in Wyoming, providing governance 
                  that transcends individual lifespans through AI-enhanced decision-making protocols.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="eco-card-hover border-water-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-water-600" />
                  Post-Mining Continuity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Revolutionary Torus field energy recycling system that ensures mining infrastructure 
                  remains valuable after the last Bitcoin is mined, validating transactions in perpetuity.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* biozoecurrency Section */}
        <div className="mt-16 text-center">
          <div className="h-px w-1/3 mx-auto bg-gradient-to-r from-forest-300 to-water-300 mb-12"></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
              <span className="gradient-text">biozoecurrency</span>
            </h3>
            <p className="text-lg mb-6 text-muted-foreground">
              The <span className="text-forest-600 font-medium">biozoecurrency</span> inverts hidden cryptocurrency through the principles of death-resurrection-life. Drawing from Greek roots <span className="italic">βίος</span> (physical life) and <span className="italic">ζωή</span> (divine eternal life), it manifests the spiritual concept of "God as All in all" (<span className="italic">πᾶς ἐν πᾶσιν</span>), revealing a framework for the Kingdom of Heaven on Earth.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-forest-50 p-4 rounded-lg">
                <h4 className="text-forest-700 font-medium mb-2">Death</h4>
                <p className="text-sm text-muted-foreground">Transcending limited economic models that create artificial scarcity and competition</p>
              </div>
              <div className="bg-water-50 p-4 rounded-lg">
                <h4 className="text-water-700 font-medium mb-2">Resurrection</h4>
                <p className="text-sm text-muted-foreground">Rising to a new economic paradigm of divine abundance and equitable distribution</p>
              </div>
              <div className="bg-gradient-to-br from-forest-50 to-water-50 p-4 rounded-lg">
                <h4 className="gradient-text font-medium mb-2">Life</h4>
                <p className="text-sm text-muted-foreground">Establishing the Kingdom economy where value flows in continuous circulation as in living systems</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Multiplanetary Section */}
        <div className="mt-16 text-center">
          <div className="h-px w-1/3 mx-auto bg-gradient-to-r from-forest-300 to-water-300 mb-12"></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
              <span className="gradient-text">Multiplanetary Framework</span>
            </h3>
            <p className="text-lg mb-6 text-muted-foreground">
              <Link to="/tokenomics" className="text-forest-600 hover:underline">ATC (Aether Token Coin)</Link> represents the first economic system explicitly designed for humanity's expansion beyond Earth. By leveraging Bitcoin's scarcity as a foundation for infinite ATC issuance, we've created a framework that can scale across multiple planets.
            </p>
            <div className="flex justify-center py-8 relative">
              <div className="w-60 h-60 rounded-full border-4 border-forest-300 absolute animate-pulse opacity-30"></div>
              <div className="w-48 h-48 rounded-full border-4 border-water-300 absolute animate-pulse opacity-30"></div>
              <div className="relative z-10 flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br from-forest-100 to-water-100 border ecosystem-border">
                <span className="text-xl font-display font-bold gradient-text">AetherCore</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DualitySection;
