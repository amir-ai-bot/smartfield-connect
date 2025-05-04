
export interface ProjectData {
  id: string;
  title: string;
  name?: string;
  description?: string;
  image?: string;
  crop: string;  // Making sure crop is required
  crop_type?: string;
  location: string;  // Making sure location is required
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  progress: number;  // Making sure progress is required
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

// Project with additional fields needed for dashboard
export interface Project {
  id: string;
  title: string;
  name: string;  // Added to match ProjectSelector usage
  description?: string;
  status: 'planning' | 'active' | 'completed';
  progress: number;
  crop: string;
  location: string;
  startDate: string;
  endDate: string;
  image?: string;
  irrigation?: string;  // Added for ProjectOverviewCard
  nextTask?: string;    // Added for ProjectOverviewCard
  taskDate?: string;    // Added for ProjectOverviewCard
}

// Task type
export interface Task {
  id: string;
  title: string;
  task?: string;        // Added for TasksCard
  description?: string;
  dueDate: string;
  date?: string;        // Added for TasksCard
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  projectId?: string;
  project?: string;     // Added for TasksCard
}

// Weather data type
export interface WeatherData {
  date?: string;
  day?: string;
  temp?: number;
  humidity?: number;
  windSpeed?: number;
  condition?: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
  isToday?: boolean;
  // Added fields for WeatherCard
  temperature?: number;
  location?: string;
  feelsLike?: number;
  forecast?: Array<{
    day: string;
    temperature: number;
    condition: string;
  }>;
}

// Dashboard data type
export interface DashboardData {
  projects: Project[];
  weather: WeatherData[];
  tasks: Task[];
  weatherData?: WeatherData;  // Added for WeatherCard
  moistureData?: Array<{ day: string; value: number }>;  // Added for MoistureChart
  yieldData?: Array<{ year: string; value: number }>;    // Added for YieldChart
  lastUpdated?: Date;  // Added for DashboardHeader
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedTasks: number;
    pendingTasks: number;
  };
}

// Dashboard context types
export interface DashboardContextType {
  data: DashboardData;
  isLoading: boolean;
  activeProject: number;
  setActiveProject: (index: number) => void;
  refreshData: () => Promise<void>;
}
