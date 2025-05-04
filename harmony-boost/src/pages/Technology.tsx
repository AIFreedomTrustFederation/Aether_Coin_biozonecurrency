import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, Database, Network, Lock, Server, Share2, 
  Cpu, LineChart, Mic, MessageSquare, Image as ImageIcon
} from "lucide-react";

interface TechnologyCard {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TechnologyCategory {
  id: string;
  name: string;
  description: string;
  technologies: TechnologyCard[];
}

const technologies: TechnologyCategory[] = [
  {
    id: "core",
    name: "Core AI Technologies",
    description: "Fundamental AI systems powering our brands and platforms",
    technologies: [
      {
        title: "Neural Networks",
        description: "Deep learning models inspired by the human brain, capable of learning complex patterns and relationships in data.",
        icon: <Brain className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Advanced NLP",
        description: "Natural language processing systems that understand, interpret, and generate human language with high accuracy.",
        icon: <MessageSquare className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Computer Vision",
        description: "Image and video recognition systems that can identify objects, faces, activities, and scenes with human-like accuracy.",
        icon: <ImageIcon className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Speech Recognition",
        description: "Advanced speech-to-text systems that accurately transcribe spoken language across various accents and languages.",
        icon: <VoiceIcon className="h-10 w-10 text-forest-600" />
      }
    ]
  },
  {
    id: "infrastructure",
    name: "AI Infrastructure",
    description: "Robust systems supporting our AI technologies",
    technologies: [
      {
        title: "Scalable Computing",
        description: "Distributed computing infrastructure designed to handle massive AI workloads efficiently.",
        icon: <Cpu className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Data Storage",
        description: "High-performance, secure data storage solutions optimized for AI training and inference.",
        icon: <Database className="h-10 w-10 text-forest-600" />
      },
      {
        title: "AI API Gateway",
        description: "Unified API interface for seamless integration of our AI services into third-party applications.",
        icon: <Server className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Model Deployment",
        description: "Streamlined systems for deploying and managing AI models in production environments.",
        icon: <Share2 className="h-10 w-10 text-forest-600" />
      }
    ]
  },
  {
    id: "advanced",
    name: "Advanced Capabilities",
    description: "Cutting-edge AI features and capabilities",
    technologies: [
      {
        title: "Federated Learning",
        description: "Training AI models across multiple devices while keeping data private and secure.",
        icon: <Network className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Explainable AI",
        description: "Systems that provide transparent explanations for AI decisions, building trust and accountability.",
        icon: <LineChart className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Privacy-Preserving AI",
        description: "AI systems designed to respect and protect user privacy while delivering powerful capabilities.",
        icon: <Lock className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Cross-Domain Learning",
        description: "AI models that can transfer knowledge between different domains and applications.",
        icon: <Share2 className="h-10 w-10 text-forest-600" />
      }
    ]
  }
];

const TechnologyPage = () => {
  return (
    <div className="container py-12">
      <div className="space-y-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          <span className="gradient-text">AI Technologies</span> Powering Our Ecosystem
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Explore the advanced AI technologies and infrastructure that power our brand ecosystem. We're committed to developing and deploying cutting-edge solutions that are both powerful and responsible.
        </p>
      </div>
      
      <Tabs defaultValue="core" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          {technologies.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {technologies.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">{category.name}</h2>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.technologies.map((tech, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                    {tech.icon}
                    <div>
                      <CardTitle>{tech.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{tech.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mt-16 pt-8 border-t">
        <h2 className="text-2xl font-display font-bold mb-4 text-center">Our Technology Principles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="text-center space-y-4">
            <div className="mx-auto bg-forest-100 text-forest-700 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold">Privacy-First</h3>
            <p className="text-muted-foreground">
              We design all our AI technologies with privacy as a fundamental principle, not an afterthought.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="mx-auto bg-forest-100 text-forest-700 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Share2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold">Interoperable</h3>
            <p className="text-muted-foreground">
              Our technologies work seamlessly together and integrate easily with third-party systems.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="mx-auto bg-forest-100 text-forest-700 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <LineChart className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold">Transparent</h3>
            <p className="text-muted-foreground">
              We build AI systems that are explainable and transparent in their decision-making processes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyPage;