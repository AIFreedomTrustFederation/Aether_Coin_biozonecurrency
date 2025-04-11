
import { useQuery } from '@tanstack/react-query';
import GitHubApi from '../services/api/githubApi';

// Create a singleton instance of the GitHub API
const githubApi = new GitHubApi();

// Hook to fetch repository details
export const useRepository = (owner: string, repo: string) => {
  return useQuery({
    queryKey: ['repository', owner, repo],
    queryFn: () => githubApi.getRepository(owner, repo),
    enabled: !!owner && !!repo,
  });
};

// Hook to fetch repository contributors
export const useContributors = (owner: string, repo: string) => {
  return useQuery({
    queryKey: ['contributors', owner, repo],
    queryFn: () => githubApi.getContributors(owner, repo),
    enabled: !!owner && !!repo,
  });
};

// Hook to fetch pull requests
export const usePullRequests = (owner: string, repo: string, state = 'open') => {
  return useQuery({
    queryKey: ['pullRequests', owner, repo, state],
    queryFn: () => githubApi.getPullRequests(owner, repo, state),
    enabled: !!owner && !!repo,
  });
};

// Hook to fetch issues
export const useIssues = (owner: string, repo: string, state = 'open') => {
  return useQuery({
    queryKey: ['issues', owner, repo, state],
    queryFn: () => githubApi.getIssues(owner, repo, state),
    enabled: !!owner && !!repo,
  });
};

// Hook to fetch releases
export const useReleases = (owner: string, repo: string) => {
  return useQuery({
    queryKey: ['releases', owner, repo],
    queryFn: () => githubApi.getReleases(owner, repo),
    enabled: !!owner && !!repo,
  });
};
