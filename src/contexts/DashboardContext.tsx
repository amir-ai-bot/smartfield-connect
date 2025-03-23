
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { DashboardData, DashboardContextType } from '@/types/dashboard';
import { initialDashboardData } from '@/data/dashboardMockData';
import { fetchDashboardData } from '@/services/dashboardService';

// Re-export types for convenience
export type { Project, WeatherData, Task, DashboardData } from '@/types/dashboard';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<DashboardData>(initialDashboardData);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  
  // Function to refresh dashboard data
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const newData = await fetchDashboardData();
      setData(newData);
      toast.success("Données mises à jour", {
        description: `Dernière mise à jour: ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      toast.error("Échec de la mise à jour", {
        description: "Veuillez réessayer plus tard",
      });
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch on mount
  useEffect(() => {
    refreshData();
    
    // Optional: Set up an interval to refresh data periodically
    const intervalId = setInterval(() => {
      refreshData();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <DashboardContext.Provider value={{ 
      data, 
      isLoading, 
      activeProject, 
      setActiveProject, 
      refreshData 
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
