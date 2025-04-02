import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

export default function NotFound() {
  const [location] = useLocation();
  
  return (
    <motion.div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md border-purple-500/20 bg-background/50 backdrop-blur-sm shadow-lg">
        <CardContent className="pt-6">
          <motion.div 
            className="flex mb-4 gap-3 items-center"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AlertCircle className="h-9 w-9 text-purple-500" />
            <h1 className="text-2xl font-bold text-foreground">Quantum Anomaly Detected</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="mt-2 text-muted-foreground">
              The requested fractal path <code className="px-1 py-0.5 bg-muted rounded text-sm">{location}</code> could not be found in this reality.
            </p>
            
            <p className="mt-4 text-sm text-muted-foreground">
              This dimensional coordinate may not exist or might require quantum authentication.
            </p>
            
            <div className="flex flex-wrap gap-3 mt-6">
              <Button asChild variant="default">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Dashboard
                </Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/fractal-explorer">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Explore Fractals
                </Link>
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
