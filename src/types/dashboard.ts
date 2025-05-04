
export interface ProjectData {
  id: string;
  title: string;
  name?: string;
  description?: string;
  image?: string;
  crop: string;
  crop_type?: string;
  location: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  progress?: number;
  status: 'planning' | 'active' | 'completed';
  owner_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
  isPublic?: boolean;
  // Added extra fields for compatibility with APIs
  creator_name?: string;
  creator_email?: string;
  creator_avatar?: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  timeAgo?: string;
}

// Dashboard context types
export interface DashboardContextType {
  data: DashboardData;
  isLoading: boolean;
  activeProject: number;
  setActiveProject: (index: number) => void;
  refreshData: () => Promise<void>;
}

// Weather data type
export interface WeatherData {
  date: string;
  day: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
  isToday?: boolean;
}

// Task type
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  projectId?: string;
}

// Project type
export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'planning' | 'active' | 'completed';
  progress: number;
  crop: string;
  location: string;
  startDate: string;
  endDate: string;
  image?: string;
}

// Dashboard data type
export interface DashboardData {
  projects: Project[];
  weather: WeatherData[];
  tasks: Task[];
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedTasks: number;
    pendingTasks: number;
  };
}
