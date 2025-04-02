
import axios from 'axios';
import { toast } from 'sonner';

export interface CurrentWeather {
  temp: number;
  humidity: number;
  wind_speed: number;
  feels_like: number;
  sunrise: string; // Changed to string for compatibility
  sunset: string;  // Changed to string for compatibility
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  // Additional properties for Weather component compatibility
  temperature?: number;
  temp_c?: number;
  feelsLike?: number;
  condition: {
    text: string;
    icon: string;
    code: number;
  };
  location?: string;
}

export interface ForecastDay {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
  };
  humidity: number;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  // Additional properties for Weather component compatibility
  date: string;
  day_name: string;
  max_temp: number;
  min_temp: number;
  wind_speed: number;
  condition: string; // Changed to string for compatibility
}

export interface WeatherForecast {
  current: CurrentWeather;
  daily: ForecastDay[];
  location: string;
}

// Use a free public API that doesn't require authentication
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// Helper to convert OpenMeteo data to our format
const mapWeatherData = (data: any, location: string): WeatherForecast => {
  const currentTemp = data.current.temperature_2m;
  const currentHumidity = data.current.relative_humidity_2m;
  const currentWind = data.current.wind_speed_10m;
  
  // Determine weather condition based on weather code
  // https://open-meteo.com/en/docs/meteorological-variables#weather-variable-documentation
  const getWeatherDescription = (code: number): { main: string, description: string } => {
    if (code === 0) return { main: 'Clear', description: 'Ciel dégagé' };
    if (code <= 3) return { main: 'Partly Cloudy', description: 'Partiellement nuageux' };
    if (code <= 48) return { main: 'Fog', description: 'Brouillard' };
    if (code <= 67) return { main: 'Rain', description: 'Pluie' };
    if (code <= 77) return { main: 'Snow', description: 'Neige' };
    if (code <= 99) return { main: 'Thunderstorm', description: 'Orage' };
    return { main: 'Unknown', description: 'Météo inconnue' };
  };
  
  const weatherInfo = getWeatherDescription(data.current.weather_code);
  
  // Map current weather
  const current: CurrentWeather = {
    temp: currentTemp,
    humidity: currentHumidity,
    wind_speed: currentWind,
    feels_like: data.current.apparent_temperature || currentTemp,
    weather: [{
      id: data.current.weather_code,
      main: weatherInfo.main,
      description: weatherInfo.description,
      icon: getWeatherIcon(data.current.weather_code, true)
    }],
    temperature: Math.round(currentTemp),
    temp_c: Math.round(currentTemp),
    feelsLike: Math.round(data.current.apparent_temperature || currentTemp),
    condition: {
      text: weatherInfo.description,
      icon: getWeatherIcon(data.current.weather_code, true),
      code: data.current.weather_code
    },
    location: location,
    // Convert times to readable format
    sunrise: formatTime(data.daily?.sunrise[0] || '08:00'),
    sunset: formatTime(data.daily?.sunset[0] || '18:00')
  };
  
  // Map daily forecast
  const daily: ForecastDay[] = [];
  
  // Process daily forecast if available
  if (data.daily) {
    for (let i = 0; i < Math.min(7, data.daily.time.length); i++) {
      const date = new Date(data.daily.time[i]);
      const weatherCode = data.daily.weather_code_max[i] || 0;
      const weatherDesc = getWeatherDescription(weatherCode);
      
      daily.push({
        dt: date.getTime() / 1000,
        temp: {
          day: data.daily.temperature_2m_max[i],
          min: data.daily.temperature_2m_min[i],
          max: data.daily.temperature_2m_max[i]
        },
        humidity: data.daily.relative_humidity_2m_max[i] || 50,
        weather: [{
          id: weatherCode,
          main: weatherDesc.main,
          description: weatherDesc.description,
          icon: getWeatherIcon(weatherCode, false)
        }],
        date: formatDate(date),
        day_name: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        max_temp: Math.round(data.daily.temperature_2m_max[i]),
        min_temp: Math.round(data.daily.temperature_2m_min[i]),
        wind_speed: Math.round(data.daily.wind_speed_10m_max[i] || 0),
        condition: weatherDesc.main.toLowerCase()
      });
    }
  }

  return { current, daily, location };
};

// Helper function to format date
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
};

// Helper function to format time
const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  try {
    const time = new Date(timeString);
    return time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return timeString;
  }
};

// Helper function to get weather icon
const getWeatherIcon = (code: number, isDay: boolean): string => {
  const prefix = isDay ? 'day' : 'night';
  
  if (code === 0) return `${prefix}-clear.png`;
  if (code <= 3) return `${prefix}-cloudy.png`;
  if (code <= 48) return 'fog.png';
  if (code <= 67) return 'rain.png';
  if (code <= 77) return 'snow.png';
  if (code <= 99) return 'thunderstorm.png';
  
  return `${prefix}-clear.png`;
};

// Default parameters for location if not provided
const DEFAULT_CITY = 'Gafsa';
const DEFAULT_COUNTRY = 'Tunisia';

export const fetchCurrentWeather = async (location?: string, country?: string): Promise<WeatherForecast> => {
  try {
    // Use default location if not provided
    const city = location || DEFAULT_CITY;
    const countryName = country || DEFAULT_COUNTRY;
    
    // Get latitude and longitude for the city using a geocoding service
    const geocodeLocation = await getGeoLocation(city, countryName);
    
    // Fetch weather data from Open-Meteo API
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        latitude: geocodeLocation.latitude,
        longitude: geocodeLocation.longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
        daily: 'weather_code_max,temperature_2m_max,temperature_2m_min,sunrise,sunset,relative_humidity_2m_max,wind_speed_10m_max',
        timezone: 'auto',
        forecast_days: 7
      }
    });
    
    // Format the location string
    const locationStr = `${city}, ${countryName}`;
    
    // Map the API response to our format
    return mapWeatherData(response.data, locationStr);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data. Please try again later.');
  }
};

// Function to get latitude and longitude from city name
const getGeoLocation = async (city: string, country: string) => {
  try {
    // Use OpenStreetMap Nominatim for geocoding
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: `${city}, ${country}`,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'AgriTech-App/1.0'
      }
    });
    
    if (response.data && response.data.length > 0) {
      return {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon)
      };
    }
    
    // Default coordinates for Gafsa, Tunisia
    return { latitude: 34.425, longitude: 8.784 };
  } catch (error) {
    console.error('Error getting geolocation:', error);
    // Default coordinates for Gafsa, Tunisia
    return { latitude: 34.425, longitude: 8.784 };
  }
};

// Map weather conditions to our condition types
export const mapWeatherCondition = (condition: string): 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
    return 'sunny';
  } else if (conditionLower.includes('rain') || conditionLower.includes('shower') || conditionLower.includes('drizzle')) {
    return 'rainy';
  } else if (conditionLower.includes('cloud') && (conditionLower.includes('scattered') || conditionLower.includes('few') || conditionLower.includes('partly'))) {
    return 'partly-cloudy';
  } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return 'cloudy';
  }
  
  return 'sunny'; // default
};

// Added for Weather.tsx compatibility - overload the function to accept different param formats
export const getCurrentWeather = async (location?: string): Promise<WeatherForecast> => {
  return fetchCurrentWeather(location);
};

export const getWeatherForecast = async (location?: string): Promise<WeatherForecast> => {
  return fetchCurrentWeather(location);
};

export const getDefaultCities = async (): Promise<WeatherForecast[]> => {
  try {
    const defaultCities = [
      { city: 'Tunis', country: 'Tunisia' },
      { city: 'Sfax', country: 'Tunisia' },
      { city: 'Sousse', country: 'Tunisia' }
    ];
    
    const forecasts = await Promise.all(
      defaultCities.map(({ city, country }) => fetchCurrentWeather(city, country))
    );
    
    return forecasts;
  } catch (error) {
    console.error('Error fetching default cities weather:', error);
    throw new Error('Failed to fetch default cities weather data. Please try again later.');
  }
};

// Handle geolocation error with meaningful messages
export const handleGeolocationError = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Vous avez refusé l'accès à votre position. Veuillez modifier les autorisations de votre navigateur pour utiliser cette fonctionnalité.";
    case error.POSITION_UNAVAILABLE:
      return "Votre position n'est pas disponible actuellement.";
    case error.TIMEOUT:
      return "La demande de géolocalisation a expiré.";
    default:
      return "Une erreur inconnue s'est produite lors de la géolocalisation.";
  }
};
