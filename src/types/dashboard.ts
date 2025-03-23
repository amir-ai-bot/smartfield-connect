
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

export interface DashboardContextType {
  data: DashboardData;
  isLoading: boolean;
  activeProject: number;
  setActiveProject: (index: number) => void;
  refreshData: () => Promise<void>;
}
