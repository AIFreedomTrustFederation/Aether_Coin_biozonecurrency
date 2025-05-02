import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Box, Code, Server } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
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

const fetchBrands = async (): Promise<Brand[]> => {
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  console.log("Fetching brands from:", `${API_URL}/brands`);
  
  try {
    const response = await fetch(`${API_URL}/brands`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch brands: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Brands data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
};

const BrandShowcasePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: brands, isLoading, error } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  const filteredBrands = brands?.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getBrandStyles = (brand: Brand) => {
    return {
      header: {
        background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})`,
        color: 'white'
      },
      badge: {
        backgroundColor: brand.primaryColor,
        color: 'white'
      }
    };
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8 text-center">
          <div className="flex flex-col items-center justify-center mb-6">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#41e0fd] to-[#9b83fc] bg-clip-text text-transparent mb-4">
              Aether_Coin Brands
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Explore our innovative brands and technologies powered by Aether_Coin blockchain technology
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-6 bg-[#0a1a35] border-[#1a2a45] text-gray-200"
            />
          </div>
        </header>

        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#41e0fd]"></div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="my-4 bg-[#1f1a2e] border-[#41e0fd] border-opacity-30">
            <AlertTitle className="text-[#41e0fd]">Error</AlertTitle>
            <AlertDescription className="text-gray-300">
              Failed to load brands. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && filteredBrands?.length === 0 && (
          <Alert className="my-4 bg-[#1a2a45] border-[#41e0fd] border-opacity-30">
            <AlertTitle className="text-[#41e0fd]">No brands found</AlertTitle>
            <AlertDescription className="text-gray-300">
              No brands match your search criteria.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands?.map((brand) => {
            const styles = getBrandStyles(brand);
            
            // Get logo based on brand
            let logoImg;
            switch(brand.slug) {
              case 'quantum-domain':
                logoImg = <img src={quantumDomainLogo} alt={brand.name} className="w-12 h-12 absolute top-4 right-4" />;
                break;
              case 'zero-trust-framework':
                logoImg = <img src={zeroTrustLogo} alt={brand.name} className="w-12 h-12 absolute top-4 right-4" />;
                break;
              case 'fractal-network':
                logoImg = <img src={fractalNetworkLogo} alt={brand.name} className="w-12 h-12 absolute top-4 right-4" />;
                break;
              case 'aether-mesh':
                logoImg = <img src={aetherMeshLogo} alt={brand.name} className="w-12 h-12 absolute top-4 right-4" />;
                break;
              case 'fractal-vault':
                logoImg = <img src={fractalVaultLogo} alt={brand.name} className="w-12 h-12 absolute top-4 right-4" />;
                break;
              case 'quantum-guard':
                logoImg = <img src={quantumGuardLogo} alt={brand.name} className="w-12 h-12 absolute top-4 right-4" />;
                break;
              default:
                logoImg = null;
            }
            
            return (
              <Card key={brand.id} className="flex flex-col h-full overflow-hidden bg-[#0a1a35] border-[#1a2a45]">
                <CardHeader style={styles.header} className="relative">
                  {logoImg}
                  <CardTitle className="text-xl text-white">{brand.name}</CardTitle>
                  <CardDescription className="text-white/80">
                    {brand.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {brand.technologies.slice(0, 3).map((tech, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        style={{borderColor: brand.primaryColor, color: brand.primaryColor}}
                        className="bg-[#1a2a45] border-opacity-50"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {brand.technologies.length > 3 && (
                      <Badge 
                        variant="outline"
                        style={{borderColor: brand.primaryColor, color: brand.primaryColor}}
                        className="bg-[#1a2a45] border-opacity-50"
                      >
                        +{brand.technologies.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2 text-gray-200">Featured Products:</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {brand.sampleProducts.slice(0, 3).map((product, index) => (
                        <li key={index} className="flex items-center">
                          <Box className="h-4 w-4 mr-2 flex-shrink-0" style={{color: brand.primaryColor}} />
                          {product}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-2 border-t border-[#1a2a45]">
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                    className="bg-[#1a2a45] border-[#2a3a55] text-[#41e0fd] hover:bg-[#2a3a55]"
                  >
                    <Link to={`/brands/${brand.slug}`} className="flex items-center">
                      <Code className="h-4 w-4 mr-2" /> View Details
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    asChild
                    className="text-[#41e0fd] hover:bg-[#1a2a45]"
                  >
                    <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" /> Website
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default BrandShowcasePage;