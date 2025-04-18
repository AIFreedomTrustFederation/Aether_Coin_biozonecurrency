// braintrust.config.ts
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Define the configuration interface
export interface BraintrustConfig {
  apiKey: string;
  evaluationsDir: string;
  resultsDir: string;
  defaultScorers: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Default configuration
const defaultConfig: BraintrustConfig = {
  apiKey: process.env.BRAINTRUST_API_KEY || '',
  evaluationsDir: path.join(process.cwd(), 'evaluations'),
  resultsDir: path.join(process.cwd(), 'evaluation-results'),
  defaultScorers: ['LevenshteinScorer'],
  logLevel: 'info',
};

// Try to load custom configuration from braintrust.json if it exists
let customConfig: Partial<BraintrustConfig> = {};
const configPath = path.join(process.cwd(), 'braintrust.json');

try {
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    customConfig = JSON.parse(configContent);
    console.log('Loaded custom Braintrust configuration from braintrust.json');
  }
} catch (error) {
  console.warn('Failed to load custom Braintrust configuration:', error);
}

// Merge default and custom configurations
const config: BraintrustConfig = {
  ...defaultConfig,
  ...customConfig,
};

// Create directories if they don't exist
try {
  if (!fs.existsSync(config.evaluationsDir)) {
    fs.mkdirSync(config.evaluationsDir, { recursive: true });
  }
  
  if (!fs.existsSync(config.resultsDir)) {
    fs.mkdirSync(config.resultsDir, { recursive: true });
  }
} catch (error) {
  console.warn('Failed to create Braintrust directories:', error);
}

// Validate configuration
if (!config.apiKey) {
  console.warn('BRAINTRUST_API_KEY is not set. Braintrust evaluations will not work.');
}

export default config;