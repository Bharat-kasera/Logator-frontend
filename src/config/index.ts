export interface Config {
  apiUrl: string;
  socketUrl: string;
}

// Determine if we're in production or development
const isProduction = import.meta.env.PROD;

// Use environment variables if available, otherwise fallback based on environment
const getApiUrl = () => {
  // In production, always use environment variables
  if (isProduction) {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    if (import.meta.env.VITE_BACKEND_URL) {
      return `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;
    }
    console.error("❌ VITE_BACKEND_URL is required in production but not set!");
    throw new Error("VITE_BACKEND_URL environment variable is required in production");
  }

  // In development, prefer localhost unless VITE_USE_DEPLOYED_BACKEND is explicitly set
  if (!isProduction) {
    // Check if user explicitly wants to use deployed backend in development
    if (import.meta.env.VITE_USE_DEPLOYED_BACKEND === 'true') {
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
      }
      if (import.meta.env.VITE_BACKEND_URL) {
        return `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;
      }
    }
    // Default to localhost in development
    return "http://localhost:4001/api";
  }

  return "http://localhost:4001/api";
};

const getSocketUrl = () => {
  // In production, always use environment variables
  if (isProduction) {
    if (import.meta.env.VITE_SOCKET_URL) {
      return import.meta.env.VITE_SOCKET_URL;
    }
    if (import.meta.env.VITE_BACKEND_URL) {
      return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
    }
    console.error("❌ VITE_BACKEND_URL is required in production but not set!");
    throw new Error("VITE_BACKEND_URL environment variable is required in production");
  }

  // In development, prefer localhost unless VITE_USE_DEPLOYED_BACKEND is explicitly set
  if (!isProduction) {
    // Check if user explicitly wants to use deployed backend in development
    if (import.meta.env.VITE_USE_DEPLOYED_BACKEND === 'true') {
      if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
      }
      if (import.meta.env.VITE_BACKEND_URL) {
        return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
      }
    }
    // Default to localhost in development
    return "http://localhost:4001";
  }

  return "http://localhost:4001";
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

// Debug logging for production
console.log("🔧 CONFIG DEBUG:", {
  isProduction,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
  finalApiUrl: API_URL,
  finalSocketUrl: SOCKET_URL,
});

export const config: Config = {
  apiUrl: API_URL,
  socketUrl: SOCKET_URL,
};

// IMPORTANT: Set VITE_BACKEND_URL to your backend Vercel URL in production
// Example: https://your-backend-app.vercel.app
