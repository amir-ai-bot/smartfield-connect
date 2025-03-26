
import axios from 'axios';

const API_KEY = 'a9cf9a89b40548b48e5235745240705';
const BASE_URL = 'https://api.weatherapi.com/v1';

export interface WeatherForecast {
  date: string;
  day: string;
  max_temp: number;
  min_temp: number;
  condition: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

export interface CurrentWeather {
  temp_c: number;
  temperature: number; // Alias for temp_c
  condition: {
    text: string;
    icon: string;
  };
  humidity: number;
  wind_kph: number;
  wind_speed: number; // Alias for wind_kph
  feelslike_c: number;
  feelsLike: number; // Alias for feelslike_c
  uv: number;
  pressure_mb: number;
  vis_km: number;
  precip_mm: number;
  cloud: number;
  is_day: number;
  sunrise: string; // Added for easy access
  sunset: string; // Added for easy access
}

export interface WeatherLocation {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  localtime: string;
}

export interface ForecastDay {
  date: string;
  day_name: string; // Added for easy access
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    avgtemp_c: number;
    maxwind_kph: number;
    totalprecip_mm: number;
    avghumidity: number;
    daily_chance_of_rain: number;
    condition: {
      text: string;
      icon: string;
    };
  };
  astro: {
    sunrise: string;
    sunset: string;
  };
  // Added for easy access in components
  max_temp: number;
  min_temp: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  icon: string;
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast: {
    forecastday: ForecastDay[];
  };
}

// Function to get current weather
export const getCurrentWeather = async (location: string = 'Gafsa,Tunisia'): Promise<CurrentWeather & { location: string }> => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast.json`, {
      params: {
        key: API_KEY,
        q: location,
        days: 5,
        aqi: 'no',
        alerts: 'no',
        lang: 'fr'
      }
    });

    const data = response.data;
    
    // Add aliases for easier property access
    if (data.current) {
      data.current.feelsLike = data.current.feelslike_c;
      data.current.wind_speed = data.current.wind_kph;
      data.current.temperature = data.current.temp_c;
      
      // Add sunrise and sunset from first forecast day
      if (data.forecast && data.forecast.forecastday && data.forecast.forecastday.length > 0) {
        data.current.sunrise = data.forecast.forecastday[0].astro.sunrise;
        data.current.sunset = data.forecast.forecastday[0].astro.sunset;
      }
    }

    return {
      ...data.current,
      location: data.location.name + ', ' + data.location.country
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw new Error('Impossible de récupérer les prévisions météo');
  }
};

// Function to get weather forecast
export const getWeatherForecast = async (location: string = 'Gafsa,Tunisia'): Promise<{ daily: ForecastDay[], location: string }> => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast.json`, {
      params: {
        key: API_KEY,
        q: location,
        days: 5,
        aqi: 'no',
        alerts: 'no',
        lang: 'fr'
      }
    });

    const data = response.data;
    
    // Process forecast data to add convenient properties
    const processedForecast = data.forecast.forecastday.map((day: any) => {
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
      
      return {
        ...day,
        day_name: dayName,
        max_temp: day.day.maxtemp_c,
        min_temp: day.day.mintemp_c,
        humidity: day.day.avghumidity,
        wind_speed: day.day.maxwind_kph,
        condition: day.day.condition.text,
        icon: day.day.condition.icon
      };
    });

    return {
      daily: processedForecast,
      location: data.location.name + ', ' + data.location.country
    };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw new Error('Impossible de récupérer les prévisions météo');
  }
};

// Function to search locations
export const searchLocations = async (query: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/search.json`, {
      params: {
        key: API_KEY,
        q: query
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching locations:', error);
    throw new Error('Impossible de rechercher des emplacements');
  }
};

// Aliases for easier migration
export const fetchCurrentWeather = getCurrentWeather;
export const fetchWeatherForecast = getWeatherForecast;
export const formatForecastData = (data: WeatherData): WeatherForecast[] => {
  if (!data || !data.forecast || !data.forecast.forecastday) {
    return [];
  }

  return data.forecast.forecastday.map(day => ({
    date: day.date,
    day: day.day_name || new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long' }),
    max_temp: day.day.maxtemp_c,
    min_temp: day.day.mintemp_c,
    condition: day.day.condition.text,
    icon: day.day.condition.icon,
    humidity: day.day.avghumidity,
    wind_speed: day.day.maxwind_kph,
  }));
};
