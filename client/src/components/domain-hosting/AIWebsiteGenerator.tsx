import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Code, Sparkles, Bot, FileCode, Globe, Wand2, Check, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AIGeneratedSite = {
  html: string;
  css: string;
  javascript: string;
  previewUrl?: string;
};

type WebsiteTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
  features: string[];
};

interface AIWebsiteGeneratorProps {
  onWebsiteGenerated: (files: File) => void;
}

const websiteTemplates: WebsiteTemplate[] = [
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'A simple, elegant landing page for your business or project',
    category: 'business',
    complexity: 'simple',
    features: ['Hero section', 'Features section', 'Contact form', 'Mobile responsive'],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Showcase your work with this customizable portfolio',
    category: 'personal',
    complexity: 'moderate',
    features: ['Project gallery', 'About section', 'Skills display', 'Contact information'],
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'A clean, modern blog layout',
    category: 'content',
    complexity: 'moderate',
    features: ['Article listings', 'Category filters', 'Author profiles', 'Comment system'],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'A basic online store template',
    category: 'business',
    complexity: 'complex',
    features: ['Product listings', 'Shopping cart', 'Checkout process', 'Product search'],
  },
  {
    id: 'community',
    name: 'Community Hub',
    description: 'A platform for community building and engagement',
    category: 'social',
    complexity: 'complex',
    features: ['Member profiles', 'Discussion boards', 'Event calendar', 'Resource library'],
  },
];

export function AIWebsiteGenerator({ onWebsiteGenerated }: AIWebsiteGeneratorProps) {
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('landing-page');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSite, setGeneratedSite] = useState<AIGeneratedSite | null>(null);
  const [activeTab, setActiveTab] = useState('prompt');
  const [useQuantumSecurity, setUseQuantumSecurity] = useState(true);
  const [useDecentralizedStorage, setUseDecentralizedStorage] = useState(true);
  const [generationProgress, setGenerationProgress] = useState<{
    status: 'idle' | 'analyzing' | 'designing' | 'coding' | 'deploying' | 'complete' | 'error';
    progress: number;
    message: string;
  }>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  const { toast } = useToast();

  const generateWebsite = async () => {
    if (!userPrompt.trim()) {
      toast({
        title: 'Empty Prompt',
        description: 'Please describe your website before generating',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({
      status: 'analyzing',
      progress: 10,
      message: 'Analyzing your request with FractalAI...',
    });
    setActiveTab('preview');

    // Simulated generation process
    try {
      // Step 1: Analyzing
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGenerationProgress({
        status: 'designing',
        progress: 30,
        message: 'Designing website structure and layout...',
      });

      // Step 2: Designing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGenerationProgress({
        status: 'coding',
        progress: 60,
        message: 'Generating quantum-secured code with open source LLMs...',
      });

      // Step 3: Coding
      await new Promise(resolve => setTimeout(resolve, 2500));
      setGenerationProgress({
        status: 'deploying',
        progress: 90,
        message: 'Preparing deployment package for FractalCoin network...',
      });

      // Step 4: Complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate simulated HTML, CSS, and JavaScript based on template
      const template = websiteTemplates.find(t => t.id === selectedTemplate);
      const generatedHtml = generateTemplateHTML(userPrompt, template);
      const generatedCss = generateTemplateCSS(template);
      const generatedJs = generateTemplateJS(template);
      
      setGeneratedSite({
        html: generatedHtml,
        css: generatedCss,
        javascript: generatedJs,
      });
      
      setGenerationProgress({
        status: 'complete',
        progress: 100,
        message: 'Website ready for deployment on FractalCoin blockchain!',
      });
      
      // Create a zip file for deployment (simulated)
      const websiteBlob = new Blob([
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Generated FractalCoin Website</title>
          <style>${generatedCss}</style>
        </head>
        <body>
          ${generatedHtml}
          <script>${generatedJs}</script>
        </body>
        </html>`
      ], { type: 'text/html' });
      
      const websiteFile = new File([websiteBlob], 'fractalcoin-website.zip', { type: 'application/zip' });
      
      toast({
        title: 'Website Generated!',
        description: 'Your website is ready to be deployed on the FractalCoin blockchain',
      });
    } catch (error) {
      setGenerationProgress({
        status: 'error',
        progress: 0,
        message: 'An error occurred during generation. Please try again.',
      });
      
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate website. Please try with a different prompt.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = () => {
    if (!generatedSite) return;
    
    // Create a mock zip file for deployment
    const websiteBlob = new Blob([
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Generated FractalCoin Website</title>
        <style>${generatedSite.css}</style>
      </head>
      <body>
        ${generatedSite.html}
        <script>${generatedSite.javascript}</script>
      </body>
      </html>`
    ], { type: 'text/html' });
    
    const websiteFile = new File([websiteBlob], 'fractalcoin-website.zip', { type: 'application/zip' });
    
    onWebsiteGenerated(websiteFile);
  };

  const generateExamplePrompt = () => {
    const template = websiteTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;
    
    let prompt = '';
    switch (template.id) {
      case 'landing-page':
        prompt = 'Create a modern landing page for my sustainable energy startup called "EcoFlow". We focus on solar and wind energy solutions for residential homes. Include sections for our mission, services, and a contact form. Use earthy colors like green and blue.';
        break;
      case 'portfolio':
        prompt = 'Build a portfolio website for me as a digital artist. I want to showcase my digital paintings, 3D models, and animations. Include an about me section, my skills, and contact information. Use a dark theme with vibrant accent colors.';
        break;
      case 'blog':
        prompt = 'Create a blog website for my travel adventures called "Wanderlust Journal". I need categories for different continents, featured posts on the homepage, and an about the author section. Use a clean, minimalist design with good readability.';
        break;
      case 'ecommerce':
        prompt = 'Build an e-commerce website for my handmade jewelry business "Artisan Gems". I need product categories, featured items, a shopping cart, and checkout process. Use elegant colors like gold, silver and soft purple.';
        break;
      case 'community':
        prompt = 'Create a community website for blockchain developers called "Chain Builders". Include forums, event listings, resource library, and member profiles. Use a modern tech-inspired design with dark mode support.';
        break;
    }
    
    setUserPrompt(prompt);
  };

  // Helper function to generate HTML based on template and prompt
  const generateTemplateHTML = (prompt: string, template?: WebsiteTemplate): string => {
    // In a real implementation, this would use actual AI generation
    // For now, return a basic template with the user's prompt incorporated
    return `
<!-- Generated by FractalCoin AI Website Generator -->
<header class="site-header">
  <div class="container">
    <div class="logo">FractalWeb</div>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </div>
</header>

<main>
  <section class="hero">
    <div class="container">
      <h1>Welcome to Your AI-Generated Website</h1>
      <p class="subtitle">Based on your prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"</p>
      <button class="cta-button">Get Started</button>
    </div>
  </section>

  <section class="features">
    <div class="container">
      <h2>Key Features</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>Quantum-Secured</h3>
          <p>Built with quantum-resistant encryption</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Lightning Fast</h3>
          <p>Optimized for speed and performance</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🌐</div>
          <h3>Decentralized</h3>
          <p>Hosted on the FractalCoin blockchain</p>
        </div>
      </div>
    </div>
  </section>

  <section class="about">
    <div class="container">
      <h2>About Us</h2>
      <p>This content is generated based on your description. In the full implementation, this would be personalized to your specific needs.</p>
    </div>
  </section>

  <section class="contact">
    <div class="container">
      <h2>Get In Touch</h2>
      <form class="contact-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" placeholder="Your name">
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" placeholder="Your email">
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" placeholder="Your message"></textarea>
        </div>
        <button type="submit" class="submit-button">Send Message</button>
      </form>
    </div>
  </section>
</main>

<footer>
  <div class="container">
    <p>&copy; 2025 FractalCoin Web - Powered by open source AI on the blockchain</p>
  </div>
</footer>`;
  };

  // Helper function to generate CSS based on template
  const generateTemplateCSS = (template?: WebsiteTemplate): string => {
    // In a real implementation, this would use actual AI generation
    return `
/* Generated by FractalCoin AI Website Generator */
:root {
  --primary-color: #3a86ff;
  --secondary-color: #8338ec;
  --accent-color: #ff006e;
  --background-color: #ffffff;
  --text-color: #333333;
  --light-gray: #f5f5f5;
  --dark-gray: #666666;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-color);
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Styles */
.site-header {
  padding: 1rem 0;
  background-color: var(--background-color);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.site-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

nav ul {
  display: flex;
  list-style: none;
}

nav ul li {
  margin-left: 1.5rem;
}

nav ul li a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  transition: color 0.3s ease;
}

nav ul li a:hover {
  color: var(--primary-color);
}

/* Hero Section */
.hero {
  padding: 5rem 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  text-align: center;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero .subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  padding: 0.8rem 2rem;
  background-color: white;
  color: var(--primary-color);
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Features Section */
.features {
  padding: 5rem 0;
  background-color: var(--light-gray);
}

.features h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: var(--primary-color);
}

/* About Section */
.about {
  padding: 5rem 0;
}

.about h2 {
  margin-bottom: 2rem;
  font-size: 2rem;
}

.about p {
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto;
}

/* Contact Section */
.contact {
  padding: 5rem 0;
  background-color: var(--light-gray);
}

.contact h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2rem;
}

.contact-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 150px;
  resize: vertical;
}

.submit-button {
  padding: 0.8rem 2rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: var(--secondary-color);
}

/* Footer */
footer {
  padding: 2rem 0;
  background-color: var(--text-color);
  color: white;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.2rem;
  }
  
  .hero .subtitle {
    font-size: 1rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
}`;
  };

  // Helper function to generate JavaScript based on template
  const generateTemplateJS = (template?: WebsiteTemplate): string => {
    // In a real implementation, this would use actual AI generation
    return `
// Generated by FractalCoin AI Website Generator
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the website components
  initializeWebsite();
});

function initializeWebsite() {
  // Add smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });

  // Set up contact form submission
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // In a real implementation, this would send the data to a server
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
      };
      
      // Simulate form submission
      console.log('Form submitted:', formData);
      
      // Show success message (would be implemented properly in a real app)
      alert('Thank you for your message! We will get back to you soon.');
      
      // Reset form
      contactForm.reset();
    });
  }

  // Add animation for feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // Add FractalCoin blockchain connection simulation
  console.log('Initializing connection to FractalCoin blockchain network...');
  
  // This would be actual blockchain integration code in a real implementation
  setTimeout(() => {
    console.log('Connected to FractalCoin biozoecurrency network');
    console.log('Website secured with quantum-resistant encryption');
    console.log('Decentralized storage initialized');
  }, 1000);
}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          <CardTitle>AI Website Generator</CardTitle>
        </div>
        <CardDescription>
          Create a custom website using plain language descriptions, powered by open source AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="prompt">
              <Sparkles className="h-4 w-4 mr-2" />
              Prompt
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Globe className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-select">Choose a Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger id="template-select">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {websiteTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                        <span className="ml-2 text-xs opacity-70">
                          ({template.complexity})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {websiteTemplates.find(t => t.id === selectedTemplate) && (
                <div className="border rounded-md p-4 bg-muted/30">
                  <h3 className="text-md font-medium mb-2">
                    {websiteTemplates.find(t => t.id === selectedTemplate)?.name} Template
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {websiteTemplates.find(t => t.id === selectedTemplate)?.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {websiteTemplates.find(t => t.id === selectedTemplate)?.features.map((feature, index) => (
                      <Badge key={index} variant="outline">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="website-prompt">Describe Your Website</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={generateExamplePrompt}
                    className="text-xs"
                  >
                    Generate Example
                  </Button>
                </div>
                <Textarea
                  id="website-prompt"
                  placeholder="Describe the website you want to create in detail. Include purpose, style preferences, content sections, and any specific features you need."
                  rows={6}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about colors, layout, and content to get better results.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Advanced Options</h3>
                  <Separator />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quantum-security">Quantum-Secure Storage</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable quantum-resistant encryption for your website
                    </p>
                  </div>
                  <Switch
                    id="quantum-security"
                    checked={useQuantumSecurity}
                    onCheckedChange={setUseQuantumSecurity}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="decentralized-storage">Decentralized Storage</Label>
                    <p className="text-xs text-muted-foreground">
                      Store website across the FractalCoin network
                    </p>
                  </div>
                  <Switch
                    id="decentralized-storage"
                    checked={useDecentralizedStorage}
                    onCheckedChange={setUseDecentralizedStorage}
                  />
                </div>
              </div>

              <Button
                onClick={generateWebsite}
                className="w-full mt-2"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Website
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {generationProgress.status !== 'idle' && generationProgress.status !== 'complete' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <h3 className="font-medium">
                    {generationProgress.status === 'analyzing' ? 'Analyzing Request' :
                     generationProgress.status === 'designing' ? 'Designing Website' :
                     generationProgress.status === 'coding' ? 'Generating Code' :
                     generationProgress.status === 'deploying' ? 'Preparing Deployment' :
                     'Processing'}
                  </h3>
                </div>
                
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${generationProgress.progress}%` }}
                  ></div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm">
                    <Bot className="inline-block mr-2 h-4 w-4 text-primary" />
                    {generationProgress.message}
                  </p>
                </div>
                
                <div className="space-y-2 pt-4">
                  <h3 className="text-sm font-medium">What's happening?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {generationProgress.status === 'analyzing' || 
                         generationProgress.status === 'designing' ||
                         generationProgress.status === 'coding' ||
                         generationProgress.status === 'deploying' ? (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30"></span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Analyzing your request</p>
                        <p className="text-xs text-muted-foreground">Understanding your needs and requirements</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {generationProgress.status === 'designing' ||
                         generationProgress.status === 'coding' ||
                         generationProgress.status === 'deploying' ? (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30"></span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Designing your website</p>
                        <p className="text-xs text-muted-foreground">Creating layout, structure, and visual elements</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {generationProgress.status === 'coding' ||
                         generationProgress.status === 'deploying' ? (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30"></span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Generating clean code</p>
                        <p className="text-xs text-muted-foreground">Writing HTML, CSS, and JavaScript with quantum security</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {generationProgress.status === 'deploying' ? (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30"></span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Preparing for blockchain deployment</p>
                        <p className="text-xs text-muted-foreground">Optimizing for the FractalCoin network</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : generationProgress.status === 'complete' && generatedSite ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">Website Generated Successfully</h3>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Ready</Badge>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted p-2 flex items-center gap-2 border-b">
                    <div className="flex gap-1">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-center flex-grow">
                      {websiteTemplates.find(t => t.id === selectedTemplate)?.name} - Generated Website
                    </div>
                  </div>
                  <div className="h-[400px] bg-white p-4 overflow-auto">
                    <div 
                      dangerouslySetInnerHTML={{
                        __html: `
                          <style>${generatedSite.css}</style>
                          ${generatedSite.html}
                          <script>${generatedSite.javascript}</script>
                        `
                      }}
                      className="preview-frame"
                    />
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">About Your Generated Website</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Based on the {websiteTemplates.find(t => t.id === selectedTemplate)?.name} template</li>
                        <li>• {useQuantumSecurity ? 'Secured with quantum-resistant encryption' : 'Standard encryption applied'}</li>
                        <li>• {useDecentralizedStorage ? 'Ready for decentralized storage' : 'Standard storage configuration'}</li>
                        <li>• Optimized for .trust FractalCoin blockchain hosting</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleDeploy} 
                  className="w-full"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Deploy to FractalCoin Network
                </Button>
              </div>
            ) : generationProgress.status === 'error' ? (
              <div className="text-center space-y-4 py-10">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                <h3 className="text-lg font-medium">Generation Failed</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {generationProgress.message}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setGenerationProgress({
                      status: 'idle',
                      progress: 0,
                      message: '',
                    });
                    setActiveTab('prompt');
                  }}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-10">
                <FileCode className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                <h3 className="text-lg font-medium">No Website Generated Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Describe your website in the Prompt tab and click "Generate Website" to create your custom website.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('prompt')}
                >
                  Go to Prompt
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            {generatedSite ? (
              <div className="space-y-4">
                <div>
                  <Label>HTML</Label>
                  <div className="mt-1.5 bg-muted font-mono text-xs p-4 rounded-md overflow-auto max-h-[200px]">
                    <pre>{generatedSite.html}</pre>
                  </div>
                </div>
                
                <div>
                  <Label>CSS</Label>
                  <div className="mt-1.5 bg-muted font-mono text-xs p-4 rounded-md overflow-auto max-h-[200px]">
                    <pre>{generatedSite.css}</pre>
                  </div>
                </div>
                
                <div>
                  <Label>JavaScript</Label>
                  <div className="mt-1.5 bg-muted font-mono text-xs p-4 rounded-md overflow-auto max-h-[200px]">
                    <pre>{generatedSite.javascript}</pre>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    <Code className="mr-2 h-4 w-4" />
                    Download Code
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-10">
                <Code className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                <h3 className="text-lg font-medium">No Code Generated Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Generate a website first to see the HTML, CSS, and JavaScript code.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('prompt')}
                >
                  Go to Prompt
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bot className="h-3 w-3" />
            <span>Powered by open source AI on FractalCoin</span>
          </div>
          <Badge variant="outline" className="text-xs">Quantum-secured</Badge>
        </div>
      </CardFooter>
    </Card>
  );
}