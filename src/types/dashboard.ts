export interface Project {
  id: string;
  name: string;
  title?: string; // For backward compatibility
  description?: string;
  status: 'planning' | 'active' | 'completed';
  progress: number;
  crop: string;
  location: string;
  startDate?: string;
  endDate?: string;
  image?: string;
  irrigation?: string;
  nextTask?: string;
  taskDate?: string;
}

export interface Task {
  id: string;
  title: string;
  task?: string; // For backward compatibility
  description?: string;
  dueDate: string;
  date?: string; // For backward compatibility
  priority?: 'low' | 'medium' | 'high';
  completed: boolean;
  projectId: string;
  project?: string; // For backward compatibility
}

export interface WeatherData {
  date?: string;
  day?: string;
  temp?: number;
  temperature?: number; // For backward compatibility
  humidity?: number;
  windSpeed?: number;
  condition?: string;
  isToday?: boolean;
  location?: string; // Location name
  feelsLike?: number;
  forecast?: {
    day: string;
    temperature: number;
    condition: string;
  }[];
}

export interface DashboardData {
  projects: Project[];
  weather: WeatherData[];
  weatherData?: WeatherData; // Current weather
  tasks: Task[];
  stats?: {
    totalProjects: number;
    activeProjects: number;
    completedTasks: number;
    pendingTasks: number;
  };
  lastUpdated?: Date | null;
  moistureData?: Array<{
    day: string; // Changed from date to day
    value: number;
  }>;
  yieldData?: Array<{
    year: string;
    value: number;
  }>;
}

export interface DashboardContextType {
  data: DashboardData;
  isLoading: boolean;
  activeProject: number;
  setActiveProject: (index: number) => void;
  refreshData: () => Promise<void>;
}

export interface ProjectData {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  status: 'planning' | 'active' | 'completed';
  image?: string;
  owner_id: string;
  crop?: string;
  location?: string;
  progress?: number;
  startDate?: string;
  start_date?: string;
  end_date?: string;
  endDate?: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
  user_name?: string;
  user_avatar?: string;
  user_id?: string;
  isOwnProject?: boolean; // Added missing property
}
