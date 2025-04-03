import { QueryClient, QueryFunction } from "@tanstack/react-query";

// API Gateway configuration
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || '/api';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    // Check if the error is from the API Gateway
    const isGatewayError = res.headers.get('X-API-Gateway-Error') === 'true';
    
    // Detailed error message for debugging and UX
    if (isGatewayError) {
      throw new Error(`API Gateway Error (${res.status}): ${text}`);
    } else {
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

/**
 * Route requests through the API Gateway
 * This adds the necessary security headers and ensures all requests
 * go through quantum validation
 */
function getApiGatewayUrl(url: string): string {
  // If the URL already starts with the API Gateway URL, use it as-is
  if (url.startsWith(API_GATEWAY_URL)) {
    return url;
  }
  
  // If the URL already includes /api, replace it with the API Gateway URL
  if (url.startsWith('/api/')) {
    return `${API_GATEWAY_URL}${url.substring(4)}`;
  }
  
  // Otherwise, prepend the API Gateway URL
  return `${API_GATEWAY_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Route through API Gateway
  const gatewayUrl = getApiGatewayUrl(url);
  
  console.log(`[API Gateway] Sending ${method} request to: ${gatewayUrl}`);
  
  const res = await fetch(gatewayUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      // Add any client authentication headers here
      "X-Client-Version": "1.0.0",
      "X-Client-ID": "aetherion-ui-wallet"
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Route through API Gateway
    const url = queryKey[0] as string;
    const gatewayUrl = getApiGatewayUrl(url);
    
    console.log(`[API Gateway] Sending GET query to: ${gatewayUrl}`);
    
    const res = await fetch(gatewayUrl, {
      credentials: "include",
      headers: {
        // Add any client authentication headers here
        "X-Client-Version": "1.0.0",
        "X-Client-ID": "aetherion-ui-wallet"
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
