import { config } from "../config";

// Function to handle logout when token is expired
const handleTokenExpired = () => {
  // Clear localStorage
  localStorage.removeItem("wsToken");
  localStorage.removeItem("user");
  
  // Redirect to login page
  window.location.href = "/login";
};

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

  // Handle 401 Unauthorized (token expired)
  if (response.status === 401) {
    console.log("🔒 Token expired, logging out user");
    handleTokenExpired();
    throw new Error("Session expired. Please log in again.");
  }

  return response;
};

// Convenience methods for different HTTP verbs
export const api = {
  get: (endpoint: string, options: RequestInit = {}) =>
    apiRequest(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, data?: unknown, options: RequestInit = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (endpoint: string, data?: unknown, options: RequestInit = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options: RequestInit = {}) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};
