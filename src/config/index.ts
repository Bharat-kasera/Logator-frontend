export interface Config {
  apiUrl: string;
  socketUrl: string;
}

// Determine if we're in production or development
const isProduction = import.meta.env.PROD;

// Use environment variables if available, otherwise fallback based on environment
const getApiUrl = () => {
  // If explicit environment variable is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In production, use relative URLs (same domain) or your backend URL
  if (isProduction) {
    return import.meta.env.VITE_BACKEND_URL || "/api";
  }

  // In development, use local backend
  return "http://localhost:4001";
};

const getSocketUrl = () => {
  // If explicit environment variable is set, use it
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  // In production, use your backend URL
  if (isProduction) {
    return import.meta.env.VITE_BACKEND_URL || window.location.origin;
  }

  // In development, use local backend
  return "http://localhost:4001";
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

export const config: Config = {
  apiUrl: API_URL,
  socketUrl: SOCKET_URL,
};

// For development, API calls use relative paths with Vite proxy
// For production, set VITE_BACKEND_URL to your backend Vercel URL
