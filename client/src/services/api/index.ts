
import FractalCoinApi from './fractalCoinApi';
import GitHubApi from './githubApi';
import BrandsApi from './brandsApi';
import { apiRequest } from './apiClient';

// Initialize API services
// Note: In a real app, you would get these values from environment variables
const FRACTAL_API_BASE_URL = 'https://api.fractalcoin.example'; // Replace with your actual API URL
const GITHUB_ACCESS_TOKEN = ''; // Optional: Add your GitHub token if needed
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create instances
const fractalCoinApi = new FractalCoinApi(FRACTAL_API_BASE_URL);
const githubApi = new GitHubApi(GITHUB_ACCESS_TOKEN);
const brandsApi = new BrandsApi(API_BASE_URL);

export {
  fractalCoinApi,
  githubApi,
  brandsApi,
  apiRequest,
  FractalCoinApi,
  GitHubApi,
  BrandsApi
};
