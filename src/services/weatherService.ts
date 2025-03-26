
import axios from 'axios';

const API_KEY = 'a9cf9a89b40548b48e5235745240705';
const BASE_URL = 'https://api.weatherapi.com/v1';

export interface WeatherForecast {
  date: string;
  max_temp: number;
  min_temp: number;
  condition: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

export interface CurrentWeather {
  temp_c: number;
  condition: {
    text: string;
    icon: string;
  };
  humidity: number;
  wind_kph: number;
  wind_speed: number; // Alias
  feelslike_c: number;
  feelsLike: number; // Alias
  uv: number;
  pressure_mb: number;
  vis_km: number;
  precip_mm: number;
  cloud: number;
  is_day: number;
  sunrise: string; // Add for easy access
  sunset: string; // Add for easy access
}

export interface ForecastDay {
  date: string;
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
}

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: CurrentWeather;
  forecast: {
    forecastday: ForecastDay[];
  };
}

// Function to get current weather
export const getCurrentWeather = async (location: string): Promise<WeatherData> => {
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

    // Add aliases for easier use
    const data = response.data;
    
    // Add aliases for easier property access
    if (data.current) {
      data.current.feelsLike = data.current.feelslike_c;
      data.current.wind_speed = data.current.wind_kph;
      
      // Add sunrise and sunset from first forecast day
      if (data.forecast && data.forecast.forecastday && data.forecast.forecastday.length > 0) {
        data.current.sunrise = data.forecast.forecastday[0].astro.sunrise;
        data.current.sunset = data.forecast.forecastday[0].astro.sunset;
      }
    }

    return data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw new Error('Impossible de récupérer les prévisions météo');
  }
};

// Function to convert raw data to our forecast format
export const formatForecastData = (data: WeatherData): WeatherForecast[] => {
  if (!data || !data.forecast || !data.forecast.forecastday) {
    return [];
  }

  return data.forecast.forecastday.map(day => ({
    date: day.date,
    max_temp: day.day.maxtemp_c,
    min_temp: day.day.mintemp_c,
    condition: day.day.condition.text,
    icon: day.day.condition.icon,
    humidity: day.day.avghumidity,
    wind_speed: day.day.maxwind_kph,
  }));
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
