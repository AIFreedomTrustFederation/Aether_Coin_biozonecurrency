"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubApi = exports.FractalCoinApi = exports.githubApi = exports.fractalCoinApi = void 0;
const fractalCoinApi_1 = __importDefault(require("./fractalCoinApi"));
exports.FractalCoinApi = fractalCoinApi_1.default;
const githubApi_1 = __importDefault(require("./githubApi"));
exports.GitHubApi = githubApi_1.default;
// Initialize API services
// Note: In a real app, you would get these values from environment variables
const FRACTAL_API_BASE_URL = 'https://api.fractalcoin.example'; // Replace with your actual API URL
const GITHUB_ACCESS_TOKEN = ''; // Optional: Add your GitHub token if needed
// Create instances
const fractalCoinApi = new fractalCoinApi_1.default(FRACTAL_API_BASE_URL);
exports.fractalCoinApi = fractalCoinApi;
const githubApi = new githubApi_1.default(GITHUB_ACCESS_TOKEN);
exports.githubApi = githubApi;
