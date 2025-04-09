import React from "react";
import { Helmet } from "react-helmet-async";
import ApiKeyGenerator from "../components/fractalcoin/ApiKeyGenerator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const ApiKeyPage: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <Helmet>
        <title>FractalCoin API Key Generator | Aetherion</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">FractalCoin API Key Generator</h1>
          <p className="text-muted-foreground mt-2">
            Generate or retrieve your API key for accessing FractalCoin services
          </p>
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>About FractalCoin API Keys</CardTitle>
            <CardDescription>
              Understanding how API keys work with FractalCoin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert">
              <p>
                A FractalCoin API key is required to access the network's functionality, including:
              </p>
              <ul>
                <li>Sending and receiving FractalCoin transactions</li>
                <li>Allocating and managing storage on the fractal sharded network</li>
                <li>Creating and managing bridges to other networks like Filecoin</li>
                <li>Accessing network metrics and management functions</li>
              </ul>
              <p>
                Your API key is linked to your email address and provides secure authentication to 
                the FractalCoin network. Keep this key secure and never share it publicly, as it 
                grants access to control your FractalCoin assets and storage.
              </p>
              <p>
                If you believe your key has been compromised, you can generate a new one at any time, 
                which will invalidate all previous keys associated with your email address.
              </p>
            </div>
          </CardContent>
        </Card>

        <ApiKeyGenerator />

        <div className="mt-10 text-center text-sm text-muted-foreground">
          <p>
            For additional help or to report issues with your API key,
            please contact <a href="mailto:support@fractalcoin.network" className="text-primary hover:underline">support@fractalcoin.network</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPage;