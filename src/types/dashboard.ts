// Type definitions for the dashboard data

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

// Modified ProjectData interface to match database schema
export interface ProjectData {
  id: string;
  // Database field names
  name?: string;
  title: string;
  crop: string;
  location: string;
  start_date?: string;
  end_date?: string;
  owner_id?: string;
  // Keep the camelCase versions for backward compatibility
  startDate?: string;
  endDate?: string;
  progress: number;
  status: string;
  image?: string;
  description?: string;
  user_id: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
  last_modified?: string;
  // UI-specific fields
  user_name?: string;
  user_avatar?: string;
  // Fields from projects_with_users view
  creator_name?: string;
  creator_email?: string;
  creator_avatar?: string;
}

export interface DashboardContextType {
  data: DashboardData;
  isLoading: boolean;
  activeProject: number;
  setActiveProject: (index: number) => void;
  refreshData: () => Promise<void>;
}
