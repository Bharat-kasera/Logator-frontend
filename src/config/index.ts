export interface Config {
  apiUrl: string;
  socketUrl: string;
}

// Use environment variables if available, otherwise fallback to development defaults
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001";
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:4001";

export const config: Config = {
  apiUrl: API_URL,
  socketUrl: SOCKET_URL,
};

// For development, API calls use relative paths with Vite proxy
// For production, you can set VITE_API_URL in environment variables
