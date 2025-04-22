"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useReleases = exports.useIssues = exports.usePullRequests = exports.useContributors = exports.useRepository = void 0;
const react_query_1 = require("@tanstack/react-query");
const githubApi_1 = __importDefault(require("../services/api/githubApi"));
// Create a singleton instance of the GitHub API
const githubApi = new githubApi_1.default();
// Hook to fetch repository details
const useRepository = (owner, repo) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['repository', owner, repo],
        queryFn: () => githubApi.getRepository(owner, repo),
        enabled: !!owner && !!repo,
    });
};
exports.useRepository = useRepository;
// Hook to fetch repository contributors
const useContributors = (owner, repo) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['contributors', owner, repo],
        queryFn: () => githubApi.getContributors(owner, repo),
        enabled: !!owner && !!repo,
    });
};
exports.useContributors = useContributors;
// Hook to fetch pull requests
const usePullRequests = (owner, repo, state = 'open') => {
    return (0, react_query_1.useQuery)({
        queryKey: ['pullRequests', owner, repo, state],
        queryFn: () => githubApi.getPullRequests(owner, repo, state),
        enabled: !!owner && !!repo,
    });
};
exports.usePullRequests = usePullRequests;
// Hook to fetch issues
const useIssues = (owner, repo, state = 'open') => {
    return (0, react_query_1.useQuery)({
        queryKey: ['issues', owner, repo, state],
        queryFn: () => githubApi.getIssues(owner, repo, state),
        enabled: !!owner && !!repo,
    });
};
exports.useIssues = useIssues;
// Hook to fetch releases
const useReleases = (owner, repo) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['releases', owner, repo],
        queryFn: () => githubApi.getReleases(owner, repo),
        enabled: !!owner && !!repo,
    });
};
exports.useReleases = useReleases;
