import { WeatherData } from '@/types/dashboard';
import { initialDashboardData } from '@/data/dashboardMockData';
import { toast } from 'sonner';

export const fetchWeatherData = async (location: string = "Tunis, Tunisia"): Promise<WeatherData> => {
  try {
    console.log('Fetching weather data for:', location);
    
    // Make the API request
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Weather API error (${response.status}):`, errorBody);
      
      // If we get a 403, it's likely an API key issue
      if (response.status === 403) {
        console.warn('Using mock weather data due to API access issue');
        toast.warning('Données météo simulées - clé API non configurée');
        return initialDashboardData.weatherData;
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the API response to our WeatherData format
    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      condition: mapWeatherCondition(data.weather[0].main),
      location: location,
      forecast: generateMockForecast(Math.round(data.main.temp))
    };
    
    return weatherData;
  } catch (error) {
    console.error('Could not fetch weather data:', error);
    // Return mock data as fallback
    console.log('Using mock weather data as fallback');
    return initialDashboardData.weatherData;
  }
};

const mapWeatherCondition = (condition: string): WeatherData['condition'] => {
  switch (condition) {
    case 'Thunderstorm':
      return 'stormy';
    case 'Drizzle':
    case 'Rain':
      return 'rainy';
    case 'Snow':
      return 'snowy';
    case 'Clouds':
      return 'cloudy';
    case 'Clear':
      return 'sunny';
    default:
      return 'sunny';
  }
};

const generateMockForecast = (temperature: number) => {
  const forecast = [];
  const conditions = ['sunny', 'cloudy', 'rainy'];
  
  for (let i = 1; i <= 5; i++) {
    const day = new Date();
    day.setDate(day.getDate() + i);
    const dayOfWeek = day.toLocaleDateString('fr-FR', { weekday: 'short' });
    const temp = temperature + Math.floor(Math.random() * 5) - 2;
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    forecast.push({
      day: dayOfWeek,
      temperature: temp,
      condition: condition as WeatherData['condition'],
    });
  }
  
  return forecast;
};
