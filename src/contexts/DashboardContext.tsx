
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

// Sample data types
export interface Project {
  id: number;
  name: string;
  progress: number;
  status: string;
  irrigation: string;
  nextTask: string;
  taskDate: string;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  location: string;
  forecast: {
    day: string;
    temperature: number;
    condition: string;
  }[];
}

export interface Task {
  task: string;
  project: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DashboardData {
  projects: Project[];
  weatherData: WeatherData;
  tasks: Task[];
  moistureData: { day: string; value: number }[];
  yieldData: { year: string; value: number }[];
  lastUpdated: Date;
}

interface DashboardContextType {
  data: DashboardData;
  isLoading: boolean;
  activeProject: number;
  setActiveProject: (index: number) => void;
  refreshData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Initial mock data
const initialData: DashboardData = {
  projects: [
    {
      id: 1,
      name: 'Oliveraie Secteur Nord',
      progress: 65,
      status: 'En croissance',
      irrigation: 'Programmée',
      nextTask: 'Fertilisation',
      taskDate: '18 Juin',
    },
    {
      id: 2,
      name: 'Palmeraie El Oasis',
      progress: 80,
      status: 'Fructification',
      irrigation: 'Manuelle',
      nextTask: 'Récolte',
      taskDate: '30 Juin',
    },
    {
      id: 3,
      name: 'Culture de Pistaches',
      progress: 30,
      status: 'Plantation',
      irrigation: 'Automatisée',
      nextTask: 'Inspection',
      taskDate: '22 Juin',
    },
  ],
  weatherData: {
    temperature: 32,
    feelsLike: 34,
    humidity: 25,
    windSpeed: 12,
    condition: 'sunny',
    location: 'Gafsa, Tunisie',
    forecast: [
      { day: 'Lun', temperature: 31, condition: 'sunny' },
      { day: 'Mar', temperature: 32, condition: 'sunny' },
      { day: 'Mer', temperature: 33, condition: 'cloudy' },
      { day: 'Jeu', temperature: 34, condition: 'sunny' },
      { day: 'Ven', temperature: 35, condition: 'sunny' },
    ]
  },
  tasks: [
    {
      task: 'Fertilisation des oliviers',
      project: 'Oliveraie Secteur Nord',
      date: '18 Juin, 2023',
      priority: 'high'
    },
    {
      task: 'Inspection des palmiers',
      project: 'Palmeraie El Oasis',
      date: '20 Juin, 2023',
      priority: 'medium'
    },
    {
      task: 'Récolte des dattes',
      project: 'Palmeraie El Oasis',
      date: '30 Juin, 2023',
      priority: 'medium'
    },
    {
      task: 'Contrôle des parasites',
      project: 'Culture de Pistaches',
      date: '22 Juin, 2023',
      priority: 'low'
    }
  ],
  moistureData: [
    { day: 'Lun', value: 40 },
    { day: 'Mar', value: 35 },
    { day: 'Mer', value: 45 },
    { day: 'Jeu', value: 30 },
    { day: 'Ven', value: 50 },
    { day: 'Sam', value: 45 },
    { day: 'Dim', value: 42 },
  ],
  yieldData: [
    { year: '2018', value: 30 },
    { year: '2019', value: 40 },
    { year: '2020', value: 35 },
    { year: '2021', value: 50 },
    { year: '2022', value: 65 },
    { year: '2023', value: 75 },
  ],
  lastUpdated: new Date()
};

// Helper to simulate data fetching
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate some random variations in the data
  const randomizeData = (data: DashboardData): DashboardData => {
    const newData = { ...data };
    
    // Randomize moisture data slightly
    newData.moistureData = data.moistureData.map(item => ({
      ...item,
      value: Math.max(20, Math.min(80, item.value + Math.floor(Math.random() * 10) - 5))
    }));
    
    // Randomize weather
    newData.weatherData = {
      ...data.weatherData,
      temperature: Math.floor(Math.random() * 5) + 30,
      humidity: Math.floor(Math.random() * 10) + 20,
      windSpeed: Math.floor(Math.random() * 5) + 10,
    };
    
    // Update projects progress slightly
    newData.projects = data.projects.map(project => ({
      ...project,
      progress: Math.min(100, project.progress + (Math.random() > 0.7 ? 1 : 0))
    }));
    
    newData.lastUpdated = new Date();
    
    return newData;
  };
  
  return randomizeData(initialData);
};

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<DashboardData>(initialData);
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
