
import { DashboardData } from '@/types/dashboard';
import { initialDashboardData } from '@/data/dashboardMockData';

// Function to simulate data fetching
export const fetchDashboardData = async (): Promise<DashboardData> => {
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
  
  return randomizeData(initialDashboardData);
};
