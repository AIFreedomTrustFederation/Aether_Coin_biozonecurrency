import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Code, Trash2, Edit, Eye, ExternalLink, FileText, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  chain: string;
  additionalDetails?: {
    securityScore?: number;
    generatedAt?: string;
  };
}

interface ProjectListProps {
  onProjectSelect: (projectId: number) => void;
}

export default function ProjectList({ onProjectSelect }: ProjectListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  
  // In a real implementation, this would fetch user's projects from the API
  const { data: projects = [], isLoading, error } = useQuery({ 
    queryKey: ['/api/dapp-builder/projects'],
    enabled: false, // Disable actual fetching in this demo
  });
  
  // For demo purposes, we'll use some mock data
  const mockProjects: Project[] = [
    {
      id: 1,
      name: "AetherCoin Token",
      description: "An ERC-20 token with mint, burn, and pause functionality",
      status: "published",
      createdAt: "2025-04-01T12:00:00Z",
      updatedAt: "2025-04-02T15:30:00Z",
      chain: "ethereum",
      additionalDetails: {
        securityScore: 85,
        generatedAt: "2025-04-01T12:00:00Z"
      }
    },
    {
      id: 2,
      name: "QuantumArt NFT",
      description: "An NFT collection for digital art with royalty features",
      status: "draft",
      createdAt: "2025-04-03T09:45:00Z",
      updatedAt: "2025-04-03T09:45:00Z",
      chain: "polygon",
      additionalDetails: {
        securityScore: 92,
        generatedAt: "2025-04-03T09:45:00Z"
      }
    },
    {
      id: 3,
      name: "FractalDAO Governance",
      description: "A DAO governance contract with proposal and voting system",
      status: "draft",
      createdAt: "2025-04-04T14:20:00Z",
      updatedAt: "2025-04-05T11:15:00Z",
      chain: "arbitrum",
      additionalDetails: {
        securityScore: 78,
        generatedAt: "2025-04-04T14:20:00Z"
      }
    }
  ];
  
  const handleDeleteProject = (id: number) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    // In a real implementation, this would call an API to delete the project
    toast({
      title: "Project deleted",
      description: "The project has been successfully deleted",
    });
    setDeleteDialogOpen(false);
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published':
        return 'bg-green-500 hover:bg-green-600';
      case 'archived':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };
  
  const getChainIcon = (chain: string) => {
    switch(chain) {
      case 'ethereum':
        return '⟠'; // Ethereum symbol
      case 'polygon':
        return '⬡'; // Hexagon for Polygon
      case 'arbitrum':
        return '⬗'; // Similar to Arbitrum's logo shape
      default:
        return '⛓'; // Generic chain symbol
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Projects</h2>
        <Button variant="default">
          <Code className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-4 pr-4">
          {mockProjects.map((project) => (
            <Card key={project.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <span className="mr-2">{project.name}</span>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onProjectSelect(project.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Export</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>Deploy</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600" 
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>Created: {formatDate(project.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="mr-1">{getChainIcon(project.chain)}</span>
                    <span>{project.chain.charAt(0).toUpperCase() + project.chain.slice(1)}</span>
                  </div>
                  
                  {project.additionalDetails?.securityScore && (
                    <div className="flex items-center">
                      <span className="mr-1">🛡️</span>
                      <span>Security: {project.additionalDetails.securityScore}/100</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onProjectSelect(project.id)}
                >
                  Open Project
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {mockProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No Projects Yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Start by creating a new project or using the chat interface to generate your first DApp.
              </p>
              <Button>Create New Project</Button>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this project
              and all associated files and deployments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}