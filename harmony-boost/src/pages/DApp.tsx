
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Github } from "lucide-react";
import { Link } from "react-router-dom";

const DApp = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-forest-50 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-forest-800 mb-2">Aether Coin DApp</h1>
          <p className="text-gray-600">
            This is a placeholder for the Aether Coin DApp. The custom implementation will be installed from the GitHub repository.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <a 
            href="https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
          >
            <Github className="h-5 w-5" />
            View on GitHub
          </a>
          
          <Link to="/">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DApp;
