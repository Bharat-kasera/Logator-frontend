import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../utils/api';

// Company interface (duplicated to avoid import issues)
interface Company {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  address1?: string;
  address2?: string;
  pincode?: string;
  gst_number?: string;
  pan_number?: string;
  website?: string;
  phone?: string;
  email?: string;
  uuid?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  stats?: {
    establishments_count: number;
    total_visitors: number;
    today_visitors: number;
  };
}

export interface Establishment {
  id: number;
  name: string;
  logo?: string;
  plan?: number;
  address1?: string;
  address2?: string;
  pincode?: string;
  gst_number?: string;
  pan_number?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export interface PendingRequest {
  id: number;
  type: string;
  establishment_name: string;
  firstname?: string;
  lastname?: string;
}

export interface DashboardStats {
  total_visitors: number;
  today_visitors: number;
}

export interface UserPlan {
  id: number;
  name: string;
  maxEstablishments: number;
  maxDepartments: number;
  maxGates: number;
  maxVisitors: number;
}

interface DataContextType {
  // Data states
  companies: Company[];
  establishments: Establishment[];
  pendingRequests: PendingRequest[];
  dashboardStats: DashboardStats | null;
  userPlan: UserPlan | null;
  
  // Loading states
  isLoadingCompanies: boolean;
  isLoadingEstablishments: boolean;
  isLoadingDashboard: boolean;
  
  // Error states
  companiesError: string | null;
  establishmentsError: string | null;
  dashboardError: string | null;
  
  // Actions
  fetchAllUserData: (wsToken: string) => Promise<void>;
  fetchCompanies: (wsToken: string) => Promise<void>;
  refreshEstablishments: (wsToken: string) => Promise<void>;
  refreshDashboard: (wsToken: string) => Promise<void>;
  addCompany: (company: Company) => void;
  updateCompany: (company: Company) => void;
  removeCompany: (companyId: number) => void;
  addEstablishment: (establishment: Establishment) => void;
  updateEstablishment: (establishment: Establishment) => void;
  removeEstablishment: (establishmentId: number) => void;
  clearData: () => void;
  
  // Computed properties
  hasCompanies: boolean;
  hasEstablishments: boolean;
  canCreateCompany: boolean;
  canCreateEstablishment: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Plan configurations
const PLAN_CONFIGS: Record<number, UserPlan> = {
  1: { // Basic
    id: 1,
    name: 'Basic',
    maxEstablishments: 1,
    maxDepartments: 1,
    maxGates: 1,
    maxVisitors: 100
  },
  2: { // Pro
    id: 2,
    name: 'Pro', 
    maxEstablishments: 1,
    maxDepartments: 10,
    maxGates: 10,
    maxVisitors: 1000
  },
  3: { // Enterprise
    id: 3,
    name: 'Enterprise',
    maxEstablishments: 10,
    maxDepartments: 10, // Per establishment (each establishment gets Pro limits)
    maxGates: 10, // Per establishment (each establishment gets Pro limits)
    maxVisitors: Infinity
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Data states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  
  // Loading states
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isLoadingEstablishments, setIsLoadingEstablishments] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  
  // Error states
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [establishmentsError, setEstablishmentsError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Computed properties
  const hasCompanies = companies.length > 0;
  const hasEstablishments = establishments.length > 0;
  const canCreateCompany = userPlan ? companies.length < userPlan.maxEstablishments : false; // Using maxEstablishments for companies
  const canCreateEstablishment = userPlan ? establishments.length < userPlan.maxEstablishments : false;

  const fetchCompanies = useCallback(async (wsToken: string) => {
    setIsLoadingCompanies(true);
    setCompaniesError(null);
    try {
      const response = await api.get("/companies/my-companies", {
        headers: {
          Authorization: `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        throw new Error("Failed to fetch companies");
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      setCompaniesError(error instanceof Error ? error.message : "Failed to fetch companies");
    } finally {
      setIsLoadingCompanies(false);
    }
  }, []);

  const fetchEstablishments = useCallback(async (wsToken: string) => {
    setIsLoadingEstablishments(true);
    setEstablishmentsError(null);
    try {
      const response = await api.get("/establishments/my-establishments", {
        headers: {
          Authorization: `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEstablishments(data);
      } else {
        throw new Error("Failed to fetch establishments");
      }
    } catch (error) {
      console.error("Error fetching establishments:", error);
      setEstablishmentsError(error instanceof Error ? error.message : "Failed to fetch establishments");
    } finally {
      setIsLoadingEstablishments(false);
    }
  }, []);

  const fetchDashboard = useCallback(async (wsToken: string) => {
    setIsLoadingDashboard(true);
    setDashboardError(null);
    try {
      const response = await api.get("/dashboard", {
        headers: {
          Authorization: `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.stats);
        setPendingRequests(data.pendingRequests || []);
        // Update establishments if they're included in dashboard response
        if (data.establishments) {
          setEstablishments(data.establishments);
        }
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardError(error instanceof Error ? error.message : "Failed to fetch dashboard data");
    } finally {
      setIsLoadingDashboard(false);
    }
  }, []);

  const fetchAllUserData = useCallback(async (wsToken: string, userPlanId?: number) => {
    // Set user plan based on user data
    if (userPlanId) {
      setUserPlan(PLAN_CONFIGS[userPlanId] || PLAN_CONFIGS[1]);
    } else {
      setUserPlan(PLAN_CONFIGS[1]); // Default to Basic plan
    }

    // Fetch companies, establishments and dashboard data in parallel
    await Promise.all([
      fetchCompanies(wsToken),
      fetchEstablishments(wsToken),
      fetchDashboard(wsToken)
    ]);
  }, [fetchCompanies, fetchEstablishments, fetchDashboard]);

  const refreshEstablishments = useCallback(async (wsToken: string) => {
    await fetchEstablishments(wsToken);
  }, [fetchEstablishments]);

  const refreshDashboard = useCallback(async (wsToken: string) => {
    await fetchDashboard(wsToken);
  }, [fetchDashboard]);

  const addCompany = useCallback((company: Company) => {
    setCompanies(prev => [...prev, company]);
  }, []);

  const updateCompany = useCallback((company: Company) => {
    setCompanies(prev => 
      prev.map(comp => comp.id === company.id ? company : comp)
    );
  }, []);

  const removeCompany = useCallback((companyId: number) => {
    setCompanies(prev => prev.filter(comp => comp.id !== companyId));
  }, []);

  const addEstablishment = useCallback((establishment: Establishment) => {
    setEstablishments(prev => [...prev, establishment]);
  }, []);

  const updateEstablishment = useCallback((establishment: Establishment) => {
    setEstablishments(prev => 
      prev.map(est => est.id === establishment.id ? establishment : est)
    );
  }, []);

  const removeEstablishment = useCallback((establishmentId: number) => {
    setEstablishments(prev => prev.filter(est => est.id !== establishmentId));
  }, []);

  const clearData = useCallback(() => {
    setCompanies([]);
    setEstablishments([]);
    setPendingRequests([]);
    setDashboardStats(null);
    setUserPlan(null);
    setCompaniesError(null);
    setEstablishmentsError(null);
    setDashboardError(null);
  }, []);

  const value: DataContextType = {
    // Data states
    companies,
    establishments,
    pendingRequests,
    dashboardStats,
    userPlan,
    
    // Loading states
    isLoadingCompanies,
    isLoadingEstablishments,
    isLoadingDashboard,
    
    // Error states
    companiesError,
    establishmentsError,
    dashboardError,
    
    // Actions
    fetchAllUserData,
    fetchCompanies,
    refreshEstablishments,
    refreshDashboard,
    addCompany,
    updateCompany,
    removeCompany,
    addEstablishment,
    updateEstablishment,
    removeEstablishment,
    clearData,
    
    // Computed properties
    hasCompanies,
    hasEstablishments,
    canCreateCompany,
    canCreateEstablishment,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }  
  return context;
};