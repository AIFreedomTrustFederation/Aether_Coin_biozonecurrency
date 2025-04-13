import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Heart, Zap } from "lucide-react";

const BioZoeSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-forest-50 to-water-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
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
              Inverting hidden cryptocurrency to manifest the Kingdom of Heaven on Earth through divine principles of abundance and equity
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
                    Physical, temporal life representing material existence and resources. Through biozoecurrency, the physical world's limitations are transcended.
                  </p>
                </div>
                <div className="bg-forest-50 p-6">
                  <h4 className="text-sm font-medium text-forest-700 mb-2">Etymology Revealed</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- Greek root for biological, biography</li>
                    <li>- Represents corporeal existence</li>
                    <li>- Subject to natural scarcity laws</li>
                    <li>- Material expression of divine law</li>
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
                    Divine, eternal life representing spiritual abundance. Through zoē, the currency transcends limitation and introduces Kingdom principles of infinite provision.
                  </p>
                </div>
                <div className="bg-water-50 p-6">
                  <h4 className="text-sm font-medium text-water-700 mb-2">Spiritual Dimension</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- Greek root for zoology, zoetic</li>
                    <li>- Represents eternal, divine life</li>
                    <li>- Transcends natural scarcity</li>
                    <li>- God's abundance manifested</li>
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
                    "God as All in all" — the divine fullness manifested through the economic inversion. Represents the ultimate purpose of biozoecurrency: revealing heaven on earth.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-forest-50 to-water-50 p-6">
                  <h4 className="text-sm font-medium gradient-text mb-2">Kingdom Manifestation</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- Death to artificial scarcity systems</li>
                    <li>- Resurrection into divine abundance</li>
                    <li>- Life flowing in eternal circulation</li>
                    <li>- The hidden made visible through inversion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
            <p className="text-muted-foreground">
              Through biozoecurrency, the hidden treasure of divine economics is revealed. Just as cryptocurrency represents hidden mathematics and consensus, biozoecurrency inverts this principle to make visible God's economic system that has been hidden in plain sight — where true wealth flows in perfect circulation like living systems, transcending artificial scarcity, and manifesting the Kingdom of Heaven on Earth.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BioZoeSection;