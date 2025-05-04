
import { supabase } from '@/integrations/supabase/client';
import { DashboardData } from '@/types/dashboard';
import { initialDashboardData } from '@/data/dashboardMockData';

// Fetch dashboard data
export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    // In a real application, you would fetch this data from your API
    // For now, we'll use mock data with a delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
    return initialDashboardData;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return initialDashboardData;
  }
};

// Update project in dashboard
export const updateDashboardProject = async (projectId: string, projectData: any) => {
  try {
    // Here you would update the project in your database
    console.log('Updating project:', projectId, projectData);
    
    // Mock success response
    return {
      success: true,
      message: 'Project updated successfully'
    };
  } catch (error) {
    console.error('Error updating project:', error);
    return {
      success: false,
      message: 'Failed to update project'
    };
  }
};
