import React, { createContext, useContext, useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import io from "socket.io-client";
import { SOCKET_URL } from "../config";
import { api } from "../utils/api";

interface User {
  id: number;
  firstname?: string;
  lastname?: string;
  plan?: number;
  phone?: string;
  country_code?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  wsToken: string | null;
  login: (phone: string, otp: string, country_code?: string) => Promise<void>;
  logout: () => void;
  socket: Socket | null;
  setUser: (user: User | null) => void;
  isInitialDataLoaded: boolean;
  setIsInitialDataLoaded: (loaded: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("wsToken")
  );
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [wsToken, setWsToken] = useState<string | null>(() =>
    localStorage.getItem("wsToken")
  );
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Authenticate user with socket when we have user info
    if (user?.id) {
      newSocket.emit('authenticate', { userId: user.id });
    }

    // Listen for real-time notifications
    newSocket.on('notification', (data) => {
      console.log('Received real-time notification:', data);
      // You can dispatch to a notification context or show toast here
      if (data.type === 'invitation_received') {
        // Show toast notification
        alert(`New invitation: ${data.message}`);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [user?.id]);

  const login = async (phone: string, otp: string, country_code?: string) => {
    try {
      let cc = country_code;
      let ph = phone;
      if (!cc && phone.includes(" ")) {
        [cc, ph] = phone.split(" ");
      }
      if (!cc || !ph) throw new Error("Invalid phone/country_code");

      const checkRes = await api.post("/check-user", {
        country_code: cc,
        phone: ph,
      });
      const checkData = await checkRes.json();
      if (!checkData.exists) throw new Error("User not registered");

      const loginRes = await api.post("/login-otp-verify", {
        country_code: cc,
        phone: ph,
        otp,
      });
      if (!loginRes.ok) throw new Error("OTP verification failed");
      const { user, wsToken } = await loginRes.json();
      setUser(user);
      setWsToken(wsToken);
      localStorage.setItem("wsToken", wsToken);
      localStorage.setItem("user", JSON.stringify(user));
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setWsToken(null);
      localStorage.removeItem("wsToken");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setWsToken(null);
    setIsInitialDataLoaded(false);
    localStorage.removeItem("wsToken");
    localStorage.removeItem("user");
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        user, 
        wsToken, 
        login, 
        logout, 
        socket, 
        setUser, 
        isInitialDataLoaded, 
        setIsInitialDataLoaded 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
