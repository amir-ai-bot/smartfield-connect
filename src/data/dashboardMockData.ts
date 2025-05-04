
import { DashboardData } from '@/types/dashboard';

export const initialDashboardData: DashboardData = {
  projects: [
    {
      id: '1',
      name: 'Plantation d\'oliviers',
      title: 'Plantation d\'oliviers',
      description: 'Projet de plantation d\'oliviers dans la région de Marrakech',
      status: 'active',
      progress: 65,
      crop: 'Oliviers',
      location: 'Marrakech',
      startDate: '2023-03-15',
      endDate: '2023-11-30',
      image: 'https://images.unsplash.com/photo-1579750482338-f4550383dcd4?auto=format&fit=crop&q=80&w=1000'
    },
    {
      id: '2',
      name: 'Culture de tomates',
      title: 'Culture de tomates',
      description: 'Culture de tomates en serre',
      status: 'planning',
      progress: 25,
      crop: 'Tomates',
      location: 'Casablanca',
      startDate: '2023-05-01',
      endDate: '2023-08-30',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1000'
    }
  ],
  weather: [
    {
      date: '2023-05-15',
      day: 'Lundi',
      temp: 28,
      humidity: 45,
      windSpeed: 12,
      condition: 'sunny',
      isToday: true
    },
    {
      date: '2023-05-16',
      day: 'Mardi',
      temp: 27,
      humidity: 50,
      windSpeed: 10,
      condition: 'partly-cloudy'
    },
    {
      date: '2023-05-17',
      day: 'Mercredi',
      temp: 25,
      humidity: 60,
      windSpeed: 15,
      condition: 'cloudy'
    },
    {
      date: '2023-05-18',
      day: 'Jeudi',
      temp: 23,
      humidity: 70,
      windSpeed: 20,
      condition: 'rainy'
    },
    {
      date: '2023-05-19',
      day: 'Vendredi',
      temp: 26,
      humidity: 55,
      windSpeed: 8,
      condition: 'partly-cloudy'
    }
  ],
  tasks: [
    {
      id: '1',
      title: 'Irrigation des plants',
      description: 'Planifier l\'irrigation des nouveaux plants d\'oliviers',
      dueDate: '2023-05-18',
      priority: 'high',
      completed: false,
      projectId: '1'
    },
    {
      id: '2',
      title: 'Commander des engrais',
      description: 'Commander des engrais pour la saison',
      dueDate: '2023-05-20',
      priority: 'medium',
      completed: true,
      projectId: '1'
    },
    {
      id: '3',
      title: 'Préparer le terrain',
      description: 'Préparer le terrain pour la plantation des tomates',
      dueDate: '2023-05-25',
      priority: 'high',
      completed: false,
      projectId: '2'
    }
  ],
  stats: {
    totalProjects: 2,
    activeProjects: 1,
    completedTasks: 1,
    pendingTasks: 2
  }
};
