import axios from 'axios';

// Basic axios instance for API requests
const apiClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function for making API requests 
export const apiRequest = async <T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: any
): Promise<T> => {
  try {
    const response = await apiClient({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Default query function for react-query
export const defaultQueryFn = async ({ queryKey }: { queryKey: any }): Promise<any> => {
  // If queryKey is an array, the first element is the path
  const path = Array.isArray(queryKey) ? queryKey[0] : queryKey;
  
  // If there's an ID in the queryKey as the second element
  let url = path;
  if (Array.isArray(queryKey) && queryKey.length > 1 && queryKey[1] !== undefined) {
    url = `${path}/${queryKey[1]}`;
  }
  
  return apiRequest(url);
};

export { apiClient };