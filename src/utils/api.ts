import { config } from "../config";

// Helper function to make API requests with proper base URL
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${config.apiUrl}${endpoint}`;

  console.log(`🌐 Making API request to: ${url}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return response;
};

// Convenience methods for different HTTP verbs
export const api = {
  get: (endpoint: string, options: RequestInit = {}) =>
    apiRequest(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, data?: any, options: RequestInit = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (endpoint: string, data?: any, options: RequestInit = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options: RequestInit = {}) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};
