import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Heart, Zap, Globe, Star, Infinity, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BioZoeSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-forest-50 to-water-50">
      <div className="container">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="gradient-text">biozoecurrency</span>: 
              <span className="text-forest-700"> Kingdom Economics</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              Transforming traditional economics through principles of abundance and harmony, 
              creating a universal system that supports humanity's expansion beyond Earth while nurturing 
              our collective consciousness and spiritual growth
            </p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full border-forest-100 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-forest-100 mb-4">
                    <Leaf className="h-6 w-6 text-forest-700" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    <span className="italic">βίος</span> (bios)
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    From the Greek term for physical life, this represents our material existence and resources. 
                    Through biozoecurrency's innovative approach, traditional economic limitations are transcended, 
                    enabling global and multiplanetary economic harmony.
                  </p>
                </div>
                <div className="bg-forest-50 p-6">
                  <h4 className="text-sm font-medium text-forest-700 mb-2">Etymology Insights</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- Greek root for biological, biography</li>
                    <li>- Represents physical existence across planets</li>
                    <li>- Addresses resource distribution challenges</li>
                    <li>- Foundation for practical economic systems</li>
                    <li>- Supports universal material prosperity</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full border-water-100 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-water-100 mb-4">
                    <Heart className="h-6 w-6 text-water-700" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    <span className="italic">ζωή</span> (zoē)
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    From the Greek term for vibrant, abundant life, this represents our highest potential. 
                    Through zoē, the currency transcends traditional limitations, introducing innovative principles 
                    of sustainable abundance and interconnected prosperity.
                  </p>
                </div>
                <div className="bg-water-50 p-6">
                  <h4 className="text-sm font-medium text-water-700 mb-2">Expanded Dimension</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- Greek root for zoology, zoetic</li>
                    <li>- Represents highest potential</li>
                    <li>- Transcends natural limitations</li>
                    <li>- Creates natural abundance</li>
                    <li>- Elevates collective consciousness</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="h-full border-gradient overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-forest-100 to-water-100 mb-4">
                    <Zap className="h-6 w-6 text-forest-700" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    <span className="gradient-text italic">πᾶς ἐν πᾶσιν</span>
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    An ancient concept meaning "all in all" — representing wholeness, unity and completeness. 
                    This principle guides biozoecurrency's foundation: revealing a hidden economic system where 
                    balance and harmony create sustainable prosperity for all life.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-forest-50 to-water-50 p-6">
                  <h4 className="text-sm font-medium gradient-text mb-2">Universal Principles</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- Transcending artificial scarcity</li>
                    <li>- Establishing sustainable abundance</li>
                    <li>- Resources flowing in natural circulation</li>
                    <li>- Revealing hidden economic potential</li>
                    <li>- Balancing complementary forces</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* New Multiplanetary Section */}
        <div className="mt-16 mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
              <span className="gradient-text">Multiplanetary</span> Consciousness
            </h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Expanding human potential beyond Earth through an economic system designed for lasting harmony,
              supporting humanity's journey across the cosmos while preserving our highest values
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-forest-50 to-forest-100 p-6 rounded-lg"
            >
              <div className="flex justify-center mb-4">
                <Globe className="h-8 w-8 text-forest-600" />
              </div>
              <h4 className="text-lg font-medium text-center mb-2">Multiplanetary Economics</h4>
              <p className="text-sm text-muted-foreground text-center">
                Designed from inception to scale beyond Earth, maintaining economic harmony across planetary 
                systems through innovative Fractalchain technology.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-water-50 to-water-100 p-6 rounded-lg"
            >
              <div className="flex justify-center mb-4">
                <Infinity className="h-8 w-8 text-water-600" />
              </div>
              <h4 className="text-lg font-medium text-center mb-2">Infinite Banking</h4>
              <p className="text-sm text-muted-foreground text-center">
                Revolutionary financial principles that transform traditional banking constraints into dynamic
                systems of sustainable growth and equitable resource distribution.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-forest-50 to-water-50 p-6 rounded-lg"
            >
              <div className="flex justify-center mb-4">
                <Star className="h-8 w-8 text-forest-600" />
              </div>
              <h4 className="text-lg font-medium text-center mb-2">Eternal Memory</h4>
              <p className="text-sm text-muted-foreground text-center">
                Advanced AI systems preserve the core wisdom and values of our economic framework,
                ensuring principles of abundance and harmony persist across generations.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg"
            >
              <div className="flex justify-center mb-4">
                <Sunrise className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-center mb-2">Universal Convergence</h4>
              <p className="text-sm text-muted-foreground text-center">
                Uniting diverse perspectives through an economic framework where ancient wisdom and cutting-edge
                innovation harmonize to create sustainable systems for humanity's future.
              </p>
            </motion.div>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-lg text-forest-700 mb-4">
              "The Kingdom of Heaven is like treasure hidden in a field..."
            </p>
            <p className="text-muted-foreground mb-8">
              Through biozoecurrency, a revolutionary economic framework emerges. Unlike traditional cryptocurrency that relies on hidden 
              mathematical consensus, biozoecurrency reveals a more natural economic model where wealth flows in perfect circulation, 
              inspired by living systems. This approach transcends artificial scarcity, creating abundance across Earth and potentially 
              throughout the cosmos as humanity expands its reach as responsible stewards of creation.
            </p>
            
            <Button className="bg-gradient-to-r from-forest-600 to-water-600 hover:from-forest-700 hover:to-water-700 text-white">
              <Link to="/whitepaper">Explore Full Vision</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BioZoeSection;