
import { DashboardData } from '@/types/dashboard';

// Initial mock data
export const initialDashboardData: DashboardData = {
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
