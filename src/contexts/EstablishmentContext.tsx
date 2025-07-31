import React, { createContext, useContext, useState } from 'react';

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

interface EstablishmentContextType {
  selectedEstablishment: Establishment | null;
  setSelectedEstablishment: (est: Establishment | null) => void;
}

const EstablishmentContext = createContext<EstablishmentContextType | undefined>(undefined);

export const EstablishmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('selectedEstablishment');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure plan is a number if it exists
      if (parsed.plan !== undefined) {
        parsed.plan = Number(parsed.plan);
      }
      return parsed;
    }
    return null;
  });

  const updateSelectedEstablishment = (est: Establishment | null) => {
    // Ensure plan is a number if it exists
    if (est && est.plan !== undefined) {
      est.plan = Number(est.plan);
    }
    setSelectedEstablishment(est);
    // Persist to localStorage
    if (est) {
      localStorage.setItem('selectedEstablishment', JSON.stringify(est));
    } else {
      localStorage.removeItem('selectedEstablishment');
    }
  };

  return (
    <EstablishmentContext.Provider value={{ selectedEstablishment, setSelectedEstablishment: updateSelectedEstablishment }}>
      {children}
    </EstablishmentContext.Provider>
  );
};

export const useEstablishment = () => {
  const ctx = useContext(EstablishmentContext);
  if (!ctx) throw new Error('useEstablishment must be used within EstablishmentProvider');
  return ctx;
};
