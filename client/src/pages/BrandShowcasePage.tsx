import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useRoute } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight, Check, ExternalLink, Github, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BrandDetailPage from './BrandDetailPage';

const BrandShowcasePage: React.FC = () => {
  const [, params] = useRoute('/brands/:slug');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  // If we have a slug parameter, render the detail page instead
  if (params?.slug) {
    return <BrandDetailPage slug={params.slug} />;
  }

  // Fetch all brands
  const { 
    data: brands, 
    isLoading: brandsLoading, 
    error: brandsError 
  } = useQuery({
    queryKey: ['/api/brands'],
  });

  // Fetch featured brands
  const { 
    data: featuredBrands, 
    isLoading: featuredLoading, 
    error: featuredError 
  } = useQuery({
    queryKey: ['/api/brands/featured'],
  });

  // Handle errors
  useEffect(() => {
    if (brandsError) {
      toast({
        title: 'Error loading brands',
        description: 'Failed to load brand data. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [brandsError, toast]);

  // Filter brands by category if a category is selected
  const filteredBrands = selectedCategory === 'all' 
    ? brands 
    : brands?.filter(brand => brand.category === selectedCategory);

  // Get unique categories from brands
  const categories = brands ? [...new Set(brands.map(brand => brand.category))] : [];

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">AI Freedom Trust Ecosystem</h1>
        <p className="text-xl text-muted-foreground mt-4 max-w-3xl">
          Discover the suite of cutting-edge open-source brands and technologies powering the AI Freedom Trust ecosystem
        </p>
      </div>

      <Tabs defaultValue="featured" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="featured">Featured Brands</TabsTrigger>
          <TabsTrigger value="all">All Brands</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="featured" className="mt-6">
          {featuredLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBrands?.map(brand => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="mt-6">
          {brandsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands?.map(brand => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <div className="mb-6">
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {brandsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBrands?.map(brand => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface BrandCardProps {
  brand: {
    id: number;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    category: string;
    logoPath?: string;
    status: string;
    githubRepo?: string;
    documentationUrl?: string;
    primaryColor?: string;
  };
}

const BrandCard: React.FC<BrandCardProps> = ({ brand }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {brand.logoPath ? (
              <img 
                src={brand.logoPath} 
                alt={`${brand.name} logo`} 
                className="w-10 h-10 object-contain"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg"
                style={{ backgroundColor: brand.primaryColor || 'var(--primary)' }}
              >
                {brand.name.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{brand.name}</CardTitle>
              <Badge variant={brand.status === 'active' ? 'default' : brand.status === 'beta' ? 'secondary' : 'outline'}>
                {brand.status.charAt(0).toUpperCase() + brand.status.slice(1)}
              </Badge>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {brand.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm mb-4">
          {brand.shortDescription}
        </CardDescription>
        <div className="flex space-x-2 mt-2">
          {brand.githubRepo && (
            <a 
              href={brand.githubRepo} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
            >
              <Github size={14} className="mr-1" />
              GitHub
            </a>
          )}
          {brand.documentationUrl && (
            <a 
              href={brand.documentationUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink size={14} className="mr-1" />
              Docs
            </a>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="ml-auto" asChild>
          <Link to={`/brands/${brand.slug}`}>
            <span>Explore</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BrandShowcasePage;