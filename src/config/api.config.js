/**
 * API Configuration
 * 
 * This file contains the configuration for API endpoints.
 * It automatically detects the environment and sets the correct base URL.
 */

// Determine the environment
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Set the API base URL based on environment
let apiBaseUrl = '';

if (isDevelopment) {
  // Development environment - use local API
  apiBaseUrl = '/api';
} else if (isProduction) {
  // Production environment
  // Check if we're using a custom domain deployment
  const host = window.location.hostname;
  
  if (host === 'atc.aifreedomtrust.com' || host === 'www.atc.aifreedomtrust.com') {
    // Using custom domain - point to CPanel API
    apiBaseUrl = 'https://atc.aifreedomtrust.com/api';
  } else if (host.includes('github.io')) {
    // GitHub Pages deployment - point to CPanel API
    apiBaseUrl = 'https://atc.aifreedomtrust.com/api';
  } else {
    // Default fallback
    apiBaseUrl = '/api';
  }
}

// Export configuration
export const apiConfig = {
  baseUrl: apiBaseUrl,
  timeout: 30000, // 30 seconds
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export default apiConfig;