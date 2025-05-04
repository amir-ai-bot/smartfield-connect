
import { WeatherData } from '@/types/dashboard';

export const weatherData: WeatherData[] = [
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
];

export const fetchWeatherData = async (location: string): Promise<WeatherData[]> => {
  try {
    // In a real application, you would fetch weather data from an API like OpenWeatherMap
    // For now, return mock data with a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return [];
  }
};
