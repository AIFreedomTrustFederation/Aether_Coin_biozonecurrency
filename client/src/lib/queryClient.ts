import { QueryClient } from '@tanstack/react-query';

// Create and export a query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Helper for making API requests
export async function apiRequest<T = any>(
  url: string,
  method: string = 'GET', 
  body?: any, 
  headers: HeadersInit = {}
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Error ${response.status}: ${response.statusText}`);
  }

  // Check if the response has content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return {} as T;
}