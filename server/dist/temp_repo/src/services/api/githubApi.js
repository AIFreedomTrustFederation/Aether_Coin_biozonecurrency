"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiClient_1 = __importDefault(require("./apiClient"));
class GitHubApi {
    constructor(accessToken) {
        this.apiClient = new apiClient_1.default('https://api.github.com');
        // Set GitHub token if provided
        if (accessToken) {
            this.apiClient.setAuthToken(accessToken);
        }
    }
    // Get repository details
    async getRepository(owner, repo) {
        const response = await this.apiClient.client.get(`/repos/${owner}/${repo}`);
        return response.data;
    }
    // Get repository contributors
    async getContributors(owner, repo) {
        const response = await this.apiClient.client.get(`/repos/${owner}/${repo}/contributors`);
        return response.data;
    }
    // Get open pull requests
    async getPullRequests(owner, repo, state = 'open') {
        const response = await this.apiClient.client.get(`/repos/${owner}/${repo}/pulls`, {
            params: { state }
        });
        return response.data;
    }
    // Get issues
    async getIssues(owner, repo, state = 'open') {
        const response = await this.apiClient.client.get(`/repos/${owner}/${repo}/issues`, {
            params: { state }
        });
        return response.data;
    }
    // Get repository releases
    async getReleases(owner, repo) {
        const response = await this.apiClient.client.get(`/repos/${owner}/${repo}/releases`);
        return response.data;
    }
}
exports.default = GitHubApi;
