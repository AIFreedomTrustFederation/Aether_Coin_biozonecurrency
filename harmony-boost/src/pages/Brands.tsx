import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface BrandCard {
  name: string;
  description: string;
  subdomain: string;
  technologies: string[];
  imageUrl: string;
}

const brands: BrandCard[] = [
  {
    name: "AI Analytics Hub",
    description: "Advanced analytics platform powered by AI to derive insights from complex datasets",
    subdomain: "analytics.aifreedomtrust.com",
    technologies: ["Machine Learning", "Data Visualization", "Predictive Modeling"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "NLP Connect",
    description: "Natural language processing services for content analysis and generation",
    subdomain: "nlp.aifreedomtrust.com",
    technologies: ["NLP", "Sentiment Analysis", "Text Generation"],
    imageUrl: "https://images.unsplash.com/photo-1546146830-2cca9512c228?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Vision AI",
    description: "Computer vision applications for image and video analysis",
    subdomain: "vision.aifreedomtrust.com",
    technologies: ["Computer Vision", "Object Detection", "Image Recognition"],
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Quantum Compute",
    description: "Quantum computing simulations and algorithms for complex problem solving",
    subdomain: "quantum.aifreedomtrust.com",
    technologies: ["Quantum Algorithms", "Quantum Simulation", "Complex Problem Solving"],
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Voice Assistant",
    description: "Voice recognition and conversational AI platform",
    subdomain: "voice.aifreedomtrust.com",
    technologies: ["Speech Recognition", "Conversational AI", "Voice Synthesis"],
    imageUrl: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "AIoT Platform",
    description: "AI-powered Internet of Things platform for smart devices and automation",
    subdomain: "iot.aifreedomtrust.com",
    technologies: ["IoT", "Edge Computing", "Smart Automation"],
    imageUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Ethical AI",
    description: "Ethical AI development framework and governance tools",
    subdomain: "ethics.aifreedomtrust.com",
    technologies: ["AI Ethics", "Governance", "Explainable AI"],
    imageUrl: "https://images.unsplash.com/photo-1620330548374-5a798a9934ed?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "AI Education",
    description: "Educational platform for learning AI concepts and development",
    subdomain: "learn.aifreedomtrust.com",
    technologies: ["E-Learning", "Interactive Tutorials", "AI Curriculum"],
    imageUrl: "https://images.unsplash.com/photo-1581089778245-3ce67677f718?auto=format&fit=crop&w=800&q=80"
  }
];

const BrandsPage = () => {
  return (
    <div className="container py-12">
      <div className="space-y-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          <span className="gradient-text">AI Freedom Trust</span> Brand Showcase
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Explore our portfolio of AI-powered brands and solutions. Each brand operates on its own subdomain and offers specialized services in various domains of artificial intelligence.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="h-48 overflow-hidden">
              <img 
                src={brand.imageUrl} 
                alt={brand.name} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <CardHeader>
              <CardTitle>{brand.name}</CardTitle>
              <CardDescription>
                <a 
                  href={`https://${brand.subdomain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-forest-600 hover:underline flex items-center"
                >
                  {brand.subdomain} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{brand.description}</p>
              <div className="flex flex-wrap gap-2">
                {brand.technologies.map((tech, techIndex) => (
                  <span 
                    key={techIndex}
                    className="px-2 py-1 bg-forest-100 text-forest-700 rounded-full text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a 
                  href={`https://${brand.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  Visit Site <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-display font-bold mb-4">Looking to add your AI brand to our showcase?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          If you have an AI-powered solution or platform that you'd like to showcase under the AI Freedom Trust umbrella, we'd love to hear from you.
        </p>
        <Button className="bg-forest-600 hover:bg-forest-700">
          Contact Us
        </Button>
      </div>
    </div>
  );
};

export default BrandsPage;