
import FractalCoinApi from './fractalCoinApi';
import GitHubApi from './githubApi';

// Initialize API services
// Note: In a real app, you would get these values from environment variables
const FRACTAL_API_BASE_URL = 'https://api.fractalcoin.example'; // Replace with your actual API URL
const GITHUB_ACCESS_TOKEN = ''; // Optional: Add your GitHub token if needed

// Create instances
const fractalCoinApi = new FractalCoinApi(FRACTAL_API_BASE_URL);
const githubApi = new GitHubApi(GITHUB_ACCESS_TOKEN);

export {
  fractalCoinApi,
  githubApi,
  FractalCoinApi,
  GitHubApi
};
