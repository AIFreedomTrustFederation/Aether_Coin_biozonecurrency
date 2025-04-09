import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type ApiRequestOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

// General API request function
export async function apiRequest(endpoint: string, options: ApiRequestOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const config: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
  };

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Unknown error occurred',
      }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}