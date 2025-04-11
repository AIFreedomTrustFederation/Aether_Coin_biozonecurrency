import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Copy, Mail } from "lucide-react";
import axios from "axios";

const ApiKeyGenerator = () => {
  const [email, setEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyGenerated, setKeyGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to generate an API key",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call the API endpoint to generate or retrieve the API key
      const response = await axios.post("/api/fractalcoin/generate-key", { email });
      
      if (response.data.apiKey) {
        setApiKey(response.data.apiKey);
        setKeyGenerated(true);
        toast({
          title: "Success!",
          description: response.data.isNew 
            ? "Your FractalCoin API key has been generated successfully" 
            : "Your existing FractalCoin API key has been retrieved",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Error generating API key:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate API key. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
      variant: "default",
    });
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">FractalCoin API Key</CardTitle>
        <CardDescription>
          {keyGenerated 
            ? "Your API key has been generated. Copy it to use in your application." 
            : "Enter your email address to generate or retrieve your FractalCoin API key."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!keyGenerated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center space-x-2">
                <Mail className="text-muted-foreground h-5 w-5" />
                <Input
                  id="email"
                  placeholder="your.email@example.com"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Key"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Your API Key</Label>
              <div className="flex items-center">
                <Input
                  id="apiKey"
                  value={apiKey}
                  readOnly
                  className="font-mono flex-1 pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="relative -ml-10"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Keep this key secure. Don't share it publicly.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {keyGenerated && (
          <>
            <Button variant="outline" onClick={() => {
              setKeyGenerated(false);
              setApiKey("");
            }}>
              Generate New Key
            </Button>
            <Button variant="default" onClick={copyToClipboard}>
              {copied ? "Copied!" : "Copy Key"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default ApiKeyGenerator;