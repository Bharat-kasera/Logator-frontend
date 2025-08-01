import React, { createContext, useContext, useState } from 'react';

export interface Company {
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
  created_at?: string;
  updated_at?: string;
  stats?: {
    establishments_count: number;
    total_visitors: number;
    today_visitors: number;
  };
}

interface CompanyContextType {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('selectedCompany');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [companies, setCompanies] = useState<Company[]>([]);

  const updateSelectedCompany = (company: Company | null) => {
    setSelectedCompany(company);
    // Persist to localStorage
    if (company) {
      localStorage.setItem('selectedCompany', JSON.stringify(company));
    } else {
      localStorage.removeItem('selectedCompany');
    }
  };

  return (
    <CompanyContext.Provider value={{ 
      selectedCompany, 
      setSelectedCompany: updateSelectedCompany,
      companies,
      setCompanies
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
};