import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, ExternalLink, Tag, Zap, Box, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import MainLayout from "@/components/MainLayout";

// Import SVG assets
import quantumDomainLogo from "@/assets/quantum-domain-logo.svg";
import zeroTrustLogo from "@/assets/zero-trust-logo.svg";
import fractalNetworkLogo from "@/assets/fractal-network-logo.svg";
import aetherMeshLogo from "@/assets/aether-mesh-logo.svg";
import fractalVaultLogo from "@/assets/fractal-vault-logo.svg";
import quantumGuardLogo from "@/assets/quantum-guard-logo.svg";

interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  website: string;
  technologies: string[];
  sampleProducts: string[];
  features: string[];
}

const fetchBrandBySlug = async (slug: string): Promise<Brand> => {
  const response = await fetch(`/api/brands/${slug}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch brand details");
  }
  
  return response.json();
};

const BrandDetailPage = () => {
  const [match, params] = useRoute<{ slug: string }>("/brands/:slug");
  const slug = params?.slug || "";

  const { data: brand, isLoading, error } = useQuery({
    queryKey: ["brand", slug],
    queryFn: () => fetchBrandBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !brand) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <Alert variant="destructive" className="my-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load brand details. Please try again later.
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to="/brands" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Brands
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const headerStyle = {
    background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})`,
    color: 'white'
  };

  // Get logo based on brand
  let logoImg;
  switch(brand.slug) {
    case 'quantum-domain':
      logoImg = <img src={quantumDomainLogo} alt={brand.name} className="w-24 h-24" />;
      break;
    case 'zero-trust-framework':
      logoImg = <img src={zeroTrustLogo} alt={brand.name} className="w-24 h-24" />;
      break;
    case 'fractal-network':
      logoImg = <img src={fractalNetworkLogo} alt={brand.name} className="w-24 h-24" />;
      break;
    case 'aether-mesh':
      logoImg = <img src={aetherMeshLogo} alt={brand.name} className="w-24 h-24" />;
      break;
    case 'fractal-vault':
      logoImg = <img src={fractalVaultLogo} alt={brand.name} className="w-24 h-24" />;
      break;
    case 'quantum-guard':
      logoImg = <img src={quantumGuardLogo} alt={brand.name} className="w-24 h-24" />;
      break;
    default:
      logoImg = null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link to="/brands" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Brands
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden mb-8">
              <CardHeader style={headerStyle} className="py-8 relative">
                <div className="absolute top-4 right-4">
                  {logoImg}
                </div>
                <CardTitle className="text-3xl text-white">{brand.name}</CardTitle>
                <CardDescription className="text-white/80 text-lg">
                  {brand.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  {brand.technologies.map((tech, index) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      style={{borderColor: brand.primaryColor, color: brand.primaryColor}}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Zap className="h-5 w-5 mr-2" style={{color: brand.primaryColor}} />
                    Key Features
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {brand.features.map((feature, index) => (
                      <li key={index} className="flex items-start mb-2">
                        <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" style={{color: brand.primaryColor}} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <Button 
                    variant="outline" 
                    size="lg"
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                      <ExternalLink className="h-4 w-4 mr-2" /> Visit Official Website
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Box className="h-5 w-5 mr-2" style={{color: brand.primaryColor}} />
                  Products & Solutions
                </CardTitle>
                <CardDescription>
                  Featured offerings from {brand.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {brand.sampleProducts.map((product, index) => (
                    <li key={index} className="border-l-2 pl-4 py-2" style={{borderColor: brand.primaryColor}}>
                      <h4 className="font-medium">{product}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enterprise-grade solution with integrated AI capabilities.
                      </p>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Integration Options</h4>
                  <p className="text-sm text-muted-foreground">
                    All {brand.name} products can be integrated with existing systems through our open API platform.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" style={{color: brand.primaryColor}} />
                  Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">Architecture</h4>
                    <p className="text-sm text-muted-foreground">Microservices-based with containerized deployment</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">API Support</h4>
                    <p className="text-sm text-muted-foreground">REST, GraphQL, WebSockets</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Security Compliance</h4>
                    <p className="text-sm text-muted-foreground">GDPR, SOC2, ISO 27001</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Deployment Options</h4>
                    <p className="text-sm text-muted-foreground">Cloud, On-premise, Hybrid</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BrandDetailPage;