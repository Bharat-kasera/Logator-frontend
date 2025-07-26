import React, { createContext, useContext, useState } from 'react';

export interface Establishment {
  id: number;
  name: string;
  logo?: string;
  [key: string]: any;
}

interface EstablishmentContextType {
  selectedEstablishment: Establishment | null;
  setSelectedEstablishment: (est: Establishment | null) => void;
}

const EstablishmentContext = createContext<EstablishmentContextType | undefined>(undefined);

export const EstablishmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);

  return (
    <EstablishmentContext.Provider value={{ selectedEstablishment, setSelectedEstablishment }}>
      {children}
    </EstablishmentContext.Provider>
  );
};

export const useEstablishment = () => {
  const ctx = useContext(EstablishmentContext);
  if (!ctx) throw new Error('useEstablishment must be used within EstablishmentProvider');
  return ctx;
};
