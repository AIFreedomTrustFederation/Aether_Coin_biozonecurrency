
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
            <span className="text-forest-700">Bio</span> & <span className="text-water-600">Zoe</span>: The Dual Essence
          </h2>
          <p className="text-muted-foreground">
            Uniting the physical and spiritual dimensions of existence through <Link to="/tokenomics" className="text-forest-600 hover:underline">Aether Coin</Link>.
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
              <h3 className="text-2xl font-display font-bold text-forest-700">Bio (βίος)</h3>
            </div>
            
            <Card className="eco-card-hover border-forest-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Earth className="h-5 w-5 text-forest-600" />
                  Material Existence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  The physical manifestation of life, encompassing all biological processes
                  and natural ecosystems. Represented by the tangible world around us.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="eco-card-hover border-forest-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-forest-600" />
                  Temporal Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  The course of our natural lives, our relationship with the environment,
                  and our responsibility as stewards of the Earth.
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
              <h3 className="text-2xl font-display font-bold text-water-600">Zoe (ζωή)</h3>
            </div>
            
            <Card className="eco-card-hover border-water-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-water-600" />
                  Spiritual Essence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  The divine, eternal dimension of life that transcends physical existence.
                  The animating force that connects all living beings.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="eco-card-hover border-water-100 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-water-600" />
                  Interconnected Wholeness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  The recognition that all life is interconnected through a unified spiritual essence,
                  expressing the panentheistic view of reality.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Unity Section */}
        <div className="mt-16 text-center">
          <div className="h-px w-1/3 mx-auto bg-gradient-to-r from-forest-300 to-water-300 mb-12"></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
              <span className="gradient-text">Biozoe (βίος & ζωή) Unity</span>
            </h3>
            <p className="text-lg mb-6 text-muted-foreground">
              Through <Link to="/tokenomics" className="text-forest-600 hover:underline">Aether Coin</Link>, we recognize that the material world and spiritual essence are not separate domains, 
              but a unified whole. The divine interpenetrates every part of nature while existing beyond it.
            </p>
            <div className="flex justify-center py-8 relative">
              <div className="w-60 h-60 rounded-full border-4 border-forest-300 absolute animate-pulse opacity-30"></div>
              <div className="w-48 h-48 rounded-full border-4 border-water-300 absolute animate-pulse opacity-30"></div>
              <div className="relative z-10 flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br from-forest-100 to-water-100 border ecosystem-border">
                <span className="text-xl font-display font-bold gradient-text">Panentheism</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DualitySection;
