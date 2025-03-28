
import axios from 'axios';

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

const API_KEY = '38d79015b08a472ac87f3957c2ed4300';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Helper to convert OpenWeather data to our format
const mapWeatherData = (data: any): WeatherForecast => {
  // Map the current weather data to include compatibility fields
  const current: CurrentWeather = {
    ...data.current,
    temperature: Math.round(data.current.temp),
    temp_c: Math.round(data.current.temp),
    feelsLike: Math.round(data.current.feels_like),
    condition: {
      text: data.current.weather[0].description,
      icon: data.current.weather[0].icon,
      code: data.current.weather[0].id
    },
    // Convert Unix timestamps to time strings
    sunrise: new Date(data.current.sunrise * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    sunset: new Date(data.current.sunset * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  };

  // Map the daily forecast to include compatibility fields
  const daily = data.daily.slice(0, 5).map((day: any) => {
    const date = new Date(day.dt * 1000);
    return {
      ...day,
      date: date.toISOString().split('T')[0],
      day_name: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      max_temp: Math.round(day.temp.max),
      min_temp: Math.round(day.temp.min),
      wind_speed: Math.round(day.wind_speed),
      condition: day.weather[0].description
    };
  });

  return {
    current,
    daily,
    location: data.location
  };
};

// Default parameters for location if not provided
const DEFAULT_CITY = 'Gafsa';
const DEFAULT_COUNTRY = 'TN';

export const fetchCurrentWeather = async (location?: string, country?: string): Promise<WeatherForecast> => {
  try {
    const city = location || DEFAULT_CITY;
    const countryCode = country || DEFAULT_COUNTRY;
    
    const geocodeResponse = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city},${countryCode}&limit=1&appid=${API_KEY}`
    );
    
    if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
      throw new Error('Location not found');
    }
    
    const { lat, lon } = geocodeResponse.data[0];
    
    const response = await axios.get(
      `${BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`
    );
    
    const mappedData = mapWeatherData({
      ...response.data,
      location: `${city}, ${countryCode === 'TN' ? 'Tunisie' : countryCode}`
    });
    
    return mappedData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data. Please try again later.');
  }
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
      { city: 'Tunis', country: 'TN' },
      { city: 'Sfax', country: 'TN' },
      { city: 'Sousse', country: 'TN' }
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
