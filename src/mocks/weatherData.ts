import { WeatherData } from '@/types/dashboard';

export const mockWeatherData: WeatherData = {
  location: 'Paris',
  temperature: 20,
  feelsLike: 18,
  humidity: 65,
  windSpeed: 12,
  condition: 'Nuageux',
  forecast: [
    { day: 'Lun', temperature: 22, condition: 'Ensoleillé' },
    { day: 'Mar', temperature: 21, condition: 'Partiellement nuageux' },
    { day: 'Mer', temperature: 19, condition: 'Pluie légère' },
    { day: 'Jeu', temperature: 18, condition: 'Nuageux' },
    { day: 'Ven', temperature: 20, condition: 'Ensoleillé' }
  ]
}; 