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

  // In production, we MUST have a backend URL - don't fallback to relative paths
  if (isProduction) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      console.error(
        "❌ VITE_BACKEND_URL is required in production but not set!"
      );
      // Replace this with your actual backend Vercel URL
      // Check your Vercel dashboard for the correct backend URL
      throw new Error(
        "VITE_BACKEND_URL environment variable is required in production"
      );
    }
    return `${backendUrl.replace(/\/$/, "")}/api`;
  }
  // In development, use local backend
  return "http://localhost:4001/api";
};

const getSocketUrl = () => {
  // If explicit environment variable is set, use it
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  // In production, we MUST have a backend URL - don't fallback to frontend origin
  if (isProduction) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      console.error(
        "❌ VITE_BACKEND_URL is required in production but not set!"
      );
      // Replace this with your actual backend Vercel URL
      // Check your Vercel dashboard for the correct backend URL
      throw new Error(
        "VITE_BACKEND_URL environment variable is required in production"
      );
    }
    return backendUrl.replace(/\/$/, "");
  }

  // In development, use local backend
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
