import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  ExternalLink, 
  Github, 
  MessageSquareWarning,
  PenTool, 
  Server,
  Shield,
  ShieldCheck,
  User,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface BrandDetailPageProps {
  slug: string;
}

const BrandDetailPage: React.FC<BrandDetailPageProps> = ({ slug }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch brand details using the slug
  const { 
    data: brandDetails, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [`/api/brands/${slug}/details`],
  });

  // Show error toast if fetch fails
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading brand details',
        description: 'Failed to load brand information. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!brandDetails || error) {
    return (
      <div className="container mx-auto py-20 px-4 text-center min-h-[60vh]">
        <div className="flex flex-col items-center justify-center space-y-4">
          <MessageSquareWarning className="h-16 w-16 text-destructive" />
          <h2 className="text-2xl font-bold">Brand Not Found</h2>
          <p className="text-muted-foreground">The brand you're looking for doesn't exist or couldn't be loaded.</p>
          <Button onClick={() => setLocation('/brands')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Brands
          </Button>
        </div>
      </div>
    );
  }

  const { brand, features, technologies, integrations, teamMembers, caseStudies } = brandDetails;

  // Group technologies by category
  const groupedTechnologies = technologies.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {});

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <Button variant="ghost" className="mb-6" onClick={() => setLocation('/brands')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to All Brands
      </Button>

      {/* Brand Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-10">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            {brand.logoPath ? (
              <img 
                src={brand.logoPath} 
                alt={`${brand.name} logo`} 
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-bold text-2xl"
                style={{ backgroundColor: brand.primaryColor || 'var(--primary)' }}
              >
                {brand.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{brand.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={brand.status === 'active' ? 'default' : brand.status === 'beta' ? 'secondary' : 'outline'} className="text-xs">
                  {brand.status.charAt(0).toUpperCase() + brand.status.slice(1)}
                </Badge>
                <Badge variant="outline" className="capitalize text-xs">
                  {brand.category}
                </Badge>
                {brand.featured && (
                  <Badge variant="secondary" className="text-xs">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground mb-4">
            {brand.shortDescription}
          </p>
          
          <p className="text-sm mb-6">
            {brand.description}
          </p>
          
          <div className="flex flex-wrap gap-3">
            {brand.githubRepo && (
              <Button size="sm" variant="outline" asChild>
                <a href={brand.githubRepo} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub Repository
                </a>
              </Button>
            )}
            
            {brand.documentationUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={brand.documentationUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Documentation
                </a>
              </Button>
            )}
          </div>
        </div>
        
        {brand.bannerPath && (
          <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
            <img 
              src={brand.bannerPath} 
              alt={`${brand.name} banner`} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
      </div>

      <Separator className="my-8" />

      {/* Brand Content */}
      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="technology">Technology Stack</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        
        {/* Features Tab */}
        <TabsContent value="features" className="mt-6">
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          
          {features.length === 0 ? (
            <p className="text-muted-foreground">No features have been added for this brand yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(feature => (
                <Card key={feature.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2 mb-1">
                      {feature.iconName ? (
                        <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                          {feature.iconName === 'check' && <Check className="h-5 w-5" />}
                          {feature.iconName === 'shield' && <Shield className="h-5 w-5" />}
                          {feature.iconName === 'server' && <Server className="h-5 w-5" />}
                          {feature.iconName === 'zap' && <Zap className="h-5 w-5" />}
                          {feature.iconName === 'shield-check' && <ShieldCheck className="h-5 w-5" />}
                          {feature.iconName === 'pen-tool' && <PenTool className="h-5 w-5" />}
                        </div>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {caseStudies.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mt-12 mb-6">Case Studies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {caseStudies.map(caseStudy => (
                  <Card key={caseStudy.id} className="flex flex-col md:flex-row overflow-hidden">
                    {caseStudy.imagePath && (
                      <div className="w-full md:w-1/3">
                        <img 
                          src={caseStudy.imagePath} 
                          alt={caseStudy.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-6">
                      <CardTitle className="text-lg mb-2">{caseStudy.title}</CardTitle>
                      <CardDescription className="mb-4">{caseStudy.description}</CardDescription>
                      {caseStudy.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={caseStudy.url} target="_blank" rel="noopener noreferrer">
                            Read More
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
        
        {/* Technology Stack Tab */}
        <TabsContent value="technology" className="mt-6">
          <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
          
          {technologies.length === 0 ? (
            <p className="text-muted-foreground">No technology stack information has been added for this brand yet.</p>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedTechnologies).map(([category, techs]) => (
                <div key={category}>
                  <h3 className="text-xl font-semibold mb-4 capitalize">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {techs.map(tech => (
                      <Card key={tech.id} className="border-l-4" style={{ borderLeftColor: tech.isOpenSource ? 'var(--success)' : 'var(--accent)' }}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {tech.logoPath ? (
                                <img 
                                  src={tech.logoPath} 
                                  alt={`${tech.name} logo`} 
                                  className="w-6 h-6 object-contain"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-sm bg-primary-foreground"/>
                              )}
                              <CardTitle className="text-base">{tech.name}</CardTitle>
                            </div>
                            {tech.isOpenSource && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Open Source
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        {tech.alternative && (
                          <CardContent className="pt-0">
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="text-xs text-muted-foreground mb-1">Open Source Alternative:</p>
                              <div className="flex items-center space-x-2">
                                {tech.alternative.logoPath ? (
                                  <img 
                                    src={tech.alternative.logoPath} 
                                    alt={`${tech.alternative.name} logo`} 
                                    className="w-5 h-5 object-contain"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-sm bg-primary-foreground"/>
                                )}
                                <span className="text-sm font-medium">{tech.alternative.name}</span>
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6">
          <h2 className="text-2xl font-bold mb-6">Integrations with Other Brands</h2>
          
          {integrations.length === 0 ? (
            <p className="text-muted-foreground">No integrations have been added for this brand yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {integrations.map(integration => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {integration.sourceBrand.id === brand.id ? (
                            <>
                              <div className="flex items-center">
                                <span className="font-medium">{brand.name}</span>
                                <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />
                                <Link to={`/brands/${integration.targetBrand.slug}`} className="text-primary hover:underline">
                                  {integration.targetBrand.name}
                                </Link>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center">
                                <Link to={`/brands/${integration.sourceBrand.slug}`} className="text-primary hover:underline">
                                  {integration.sourceBrand.name}
                                </Link>
                                <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{brand.name}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {integration.integrationType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{integration.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          <h2 className="text-2xl font-bold mb-6">Team Members</h2>
          
          {teamMembers.length === 0 ? (
            <p className="text-muted-foreground">No team members have been added for this brand yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {teamMembers.map(member => (
                <Card key={member.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted relative">
                    {member.avatarPath ? (
                      <img 
                        src={member.avatarPath} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <User className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  {member.bio && (
                    <CardContent>
                      <p className="text-sm">{member.bio}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandDetailPage;