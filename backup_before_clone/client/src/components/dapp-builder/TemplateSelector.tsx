import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, StarIcon, CheckCircle2, User, Users, ShieldCheck, Puzzle, Wallet, ArrowRightIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  popularity: number;
  complexity: 'simple' | 'moderate' | 'complex';
  securityScore: number;
  compatibility: string[];
  tags: string[];
}

interface TemplateSelectorProps {
  onTemplateSelect: (templateId: number, name: string) => void;
}

export default function TemplateSelector({ onTemplateSelect }: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { toast } = useToast();
  
  // These templates would come from an API in a real implementation
  const templates: Template[] = [
    {
      id: 1,
      name: "Standard ERC-20 Token",
      description: "A basic ERC-20 token with mint, burn, pause, and ownership features",
      category: "token",
      popularity: 95,
      complexity: "simple",
      securityScore: 92,
      compatibility: ["ethereum", "polygon", "arbitrum", "optimism"],
      tags: ["erc20", "token", "mintable", "burnable", "pausable"]
    },
    {
      id: 2,
      name: "ERC-721 NFT Collection",
      description: "A standard NFT collection with minting, metadata, and royalty support",
      category: "nft",
      popularity: 88,
      complexity: "moderate",
      securityScore: 90,
      compatibility: ["ethereum", "polygon", "arbitrum", "optimism"],
      tags: ["erc721", "nft", "royalty", "metadata", "collection"]
    },
    {
      id: 3,
      name: "NFT Marketplace",
      description: "A decentralized marketplace for buying, selling, and auctioning NFTs",
      category: "marketplace",
      popularity: 82,
      complexity: "complex",
      securityScore: 85,
      compatibility: ["ethereum", "polygon"],
      tags: ["marketplace", "nft", "auction", "listing", "escrow"]
    },
    {
      id: 4,
      name: "DAO Governance",
      description: "A governance system for DAOs with voting, proposals, and execution",
      category: "governance",
      popularity: 76,
      complexity: "complex",
      securityScore: 88,
      compatibility: ["ethereum", "polygon", "arbitrum"],
      tags: ["dao", "governance", "voting", "proposal", "timelock"]
    },
    {
      id: 5,
      name: "Token Staking",
      description: "A staking contract for earning rewards on token deposits",
      category: "defi",
      popularity: 80,
      complexity: "moderate",
      securityScore: 82,
      compatibility: ["ethereum", "polygon", "arbitrum", "optimism"],
      tags: ["staking", "rewards", "yield", "defi"]
    },
    {
      id: 6,
      name: "Multi-Signature Wallet",
      description: "A secure multi-signature wallet requiring multiple approvals for transactions",
      category: "wallet",
      popularity: 70,
      complexity: "moderate",
      securityScore: 95,
      compatibility: ["ethereum", "polygon", "arbitrum", "optimism"],
      tags: ["multisig", "wallet", "security", "approvals"]
    }
  ];
  
  const filterTemplates = () => {
    return templates.filter(template => {
      const matchesSearch = 
        searchTerm === '' || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = 
        activeCategory === 'all' || 
        template.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  };
  
  const handleSelectTemplate = (template: Template) => {
    onTemplateSelect(template.id, template.name);
    
    toast({
      title: "Template selected",
      description: `${template.name} template has been selected as a starting point.`,
    });
  };
  
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'token':
        return <Star className="w-4 h-4" />;
      case 'nft':
        return <Puzzle className="w-4 h-4" />;
      case 'marketplace':
        return <ShieldCheck className="w-4 h-4" />;
      case 'governance':
        return <Users className="w-4 h-4" />;
      case 'defi':
        return <Star className="w-4 h-4" />;
      case 'wallet':
        return <Wallet className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };
  
  const getComplexityLabel = (complexity: string) => {
    switch(complexity) {
      case 'simple':
        return 'Simple';
      case 'moderate':
        return 'Moderate';
      case 'complex':
        return 'Complex';
      default:
        return complexity;
    }
  };
  
  const getComplexityColor = (complexity: string) => {
    switch(complexity) {
      case 'simple':
        return 'bg-green-500 hover:bg-green-600';
      case 'moderate':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'complex':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">Template Library</h2>
        <p className="text-sm text-muted-foreground">
          Choose a template as a starting point for your DApp
        </p>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search templates..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveCategory} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="token">Tokens</TabsTrigger>
          <TabsTrigger value="nft">NFTs</TabsTrigger>
          <TabsTrigger value="defi">DeFi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4 py-1">
              {filterTemplates().length > 0 ? (
                filterTemplates().map(template => (
                  <Card key={template.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          {getCategoryIcon(template.category)}
                          <CardTitle className="ml-2 text-lg">{template.name}</CardTitle>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getComplexityColor(template.complexity)}>
                            {getComplexityLabel(template.complexity)}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <StarIcon className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" />
                          <span>{template.popularity}/100 popularity</span>
                        </div>
                        
                        <div className="flex items-center">
                          <ShieldCheck className="mr-1 h-3 w-3" />
                          <span>{template.securityScore}/100 security</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="mr-1">🔗</span>
                          <span>{template.compatibility.length} networks</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-2">
                      <Button 
                        className="w-full"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <span className="mr-2">Use Template</span>
                        <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    No templates found matching your search criteria.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="token" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4 py-1">
              {filterTemplates().length > 0 ? (
                filterTemplates().map(template => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    No token templates found matching your search criteria.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                  }}>
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="nft" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4 py-1">
              {filterTemplates().length > 0 ? (
                filterTemplates().map(template => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    No NFT templates found matching your search criteria.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                  }}>
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="defi" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4 py-1">
              {filterTemplates().length > 0 ? (
                filterTemplates().map(template => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    No DeFi templates found matching your search criteria.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                  }}>
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}