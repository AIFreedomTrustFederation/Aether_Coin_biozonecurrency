
import ApiClient from './apiClient';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

class GitHubApi {
  private apiClient: ApiClient;
  
  constructor(accessToken?: string) {
    this.apiClient = new ApiClient('https://api.github.com');
    
    // Set GitHub token if provided
    if (accessToken) {
      this.apiClient.setAuthToken(accessToken);
    }
  }
  
  // Get repository details
  async getRepository(owner: string, repo: string): Promise<Repository> {
    const response = await this.apiClient.client.get(`/repos/${owner}/${repo}`);
    return response.data;
  }
  
  // Get repository contributors
  async getContributors(owner: string, repo: string): Promise<any[]> {
    const response = await this.apiClient.client.get(`/repos/${owner}/${repo}/contributors`);
    return response.data;
  }
  
  // Get open pull requests
  async getPullRequests(owner: string, repo: string, state = 'open'): Promise<PullRequest[]> {
    const response = await this.apiClient.client.get(`/repos/${owner}/${repo}/pulls`, {
      params: { state }
    });
    return response.data;
  }
  
  // Get issues
  async getIssues(owner: string, repo: string, state = 'open'): Promise<Issue[]> {
    const response = await this.apiClient.client.get(`/repos/${owner}/${repo}/issues`, {
      params: { state }
    });
    return response.data;
  }
  
  // Get repository releases
  async getReleases(owner: string, repo: string): Promise<any[]> {
    const response = await this.apiClient.client.get(`/repos/${owner}/${repo}/releases`);
    return response.data;
  }
}

export default GitHubApi;
