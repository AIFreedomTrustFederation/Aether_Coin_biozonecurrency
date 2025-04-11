
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRepository, useContributors, usePullRequests } from "@/hooks/useGitHub";
import { Loader2, Star, GitFork, AlertCircle, Users } from "lucide-react";

const GitHubSection = () => {
  const [repoDetails, setRepoDetails] = useState({
    owner: "fractalcoin", // Default value, change as needed
    repo: "aether-coin"   // Default value, change as needed
  });
  const [inputValues, setInputValues] = useState(repoDetails);
  
  const { data: repository, isLoading: repoLoading, error: repoError } = useRepository(
    repoDetails.owner, 
    repoDetails.repo
  );
  
  const { data: contributors, isLoading: contribLoading } = useContributors(
    repoDetails.owner, 
    repoDetails.repo
  );
  
  const { data: pullRequests, isLoading: prLoading } = usePullRequests(
    repoDetails.owner, 
    repoDetails.repo
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearch = () => {
    setRepoDetails(inputValues);
  };
  
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="gradient-text">GitHub</span> Integration
          </h2>
          <p className="text-muted-foreground">
            Track development progress and contribute to the Aether Coin ecosystem.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Owner" 
                name="owner" 
                value={inputValues.owner} 
                onChange={handleInputChange}
              />
            </div>
            <div className="flex-1">
              <Input 
                placeholder="Repository" 
                name="repo" 
                value={inputValues.repo} 
                onChange={handleInputChange}
              />
            </div>
            <Button onClick={handleSearch} className="bg-forest-600 hover:bg-forest-700">Search</Button>
          </div>
          
          {repoLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 text-forest-600 animate-spin" />
            </div>
          ) : repoError ? (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Error Loading Repository</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Could not load repository details. Please check the owner and repository names.</p>
              </CardContent>
            </Card>
          ) : repository ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contributors">Contributors</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card className="border-forest-100">
                  <CardHeader>
                    <CardTitle>{repository.full_name}</CardTitle>
                    <CardDescription>{repository.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span><strong>{repository.stargazers_count}</strong> stars</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitFork className="h-5 w-5 text-forest-600" />
                        <span><strong>{repository.forks_count}</strong> forks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <span><strong>{repository.open_issues_count}</strong> issues</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(repository.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-forest-600 hover:bg-forest-700" onClick={() => window.open(repository.html_url, '_blank')}>
                      View on GitHub
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="contributors">
                <Card className="border-forest-100">
                  <CardHeader>
                    <CardTitle>Contributors</CardTitle>
                    <CardDescription>The people behind Aether Coin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contribLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 text-forest-600 animate-spin" />
                      </div>
                    ) : contributors && contributors.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {contributors.slice(0, 6).map((contributor: any) => (
                          <div key={contributor.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <img 
                              src={contributor.avatar_url} 
                              alt={contributor.login} 
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="overflow-hidden">
                              <div className="font-medium truncate">{contributor.login}</div>
                              <div className="text-sm text-muted-foreground">
                                {contributor.contributions} commits
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No contributors found.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity">
                <Card className="border-forest-100">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest pull requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {prLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 text-forest-600 animate-spin" />
                      </div>
                    ) : pullRequests && pullRequests.length > 0 ? (
                      <div className="space-y-4">
                        {pullRequests.slice(0, 5).map((pr: any) => (
                          <a 
                            href={pr.html_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            key={pr.id} 
                            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <img 
                              src={pr.user.avatar_url} 
                              alt={pr.user.login} 
                              className="w-8 h-8 rounded-full mt-1"
                            />
                            <div>
                              <div className="font-medium">{pr.title}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                #{pr.number} opened by {pr.user.login} on {new Date(pr.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p>No recent pull requests found.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default GitHubSection;
