"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryClient = void 0;
exports.apiRequest = apiRequest;
const react_query_1 = require("@tanstack/react-query");
// Create a client
exports.queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});
// General API request function
async function apiRequest(endpoint, options = {}) {
    const { method = 'GET', body, headers = {} } = options;
    const requestHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };
    const config = {
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
    }
    catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}
