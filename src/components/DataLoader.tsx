import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

/**
 * DataLoader component that handles initial data fetching after authentication
 * This component should be placed high in the component tree, after AuthProvider and DataProvider
 */
const DataLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, wsToken, user, isInitialDataLoaded, setIsInitialDataLoaded } = useAuth();
  const { fetchAllUserData, clearData } = useData();

  useEffect(() => {
    const loadInitialData = async () => {
      if (isAuthenticated && wsToken && user && !isInitialDataLoaded) {
        try {
          console.log('🔄 Loading initial user data...');
          await fetchAllUserData(wsToken, user.plan);
          setIsInitialDataLoaded(true);
          console.log('✅ Initial user data loaded successfully');
        } catch (error) {
          console.error('❌ Failed to load initial user data:', error);
          // Don't set isInitialDataLoaded to true on error so it can retry
        }
      }
    };

    loadInitialData();
  }, [isAuthenticated, wsToken, user, isInitialDataLoaded, fetchAllUserData, setIsInitialDataLoaded]);

  useEffect(() => {
    // Clear data when user logs out
    if (!isAuthenticated) {
      clearData();
      setIsInitialDataLoaded(false);
    }
  }, [isAuthenticated, clearData, setIsInitialDataLoaded]);

  return <>{children}</>;
};

export default DataLoader;