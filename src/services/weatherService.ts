
import axios from 'axios';

export interface CurrentWeather {
  temp: number;
  humidity: number;
  wind_speed: number;
  feels_like: number;
  sunrise: number;
  sunset: number;
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
  condition?: {
    text: string;
    icon: string;
    code: number;
  };
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
  date?: string;
  day_name?: string;
  max_temp?: number;
  min_temp?: number;
  wind_speed?: number;
  condition?: {
    text: string;
    icon: string;
    code: number;
  };
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
    temperature: data.current.temp,
    temp_c: data.current.temp,
    feelsLike: data.current.feels_like,
    condition: {
      text: data.current.weather[0].description,
      icon: data.current.weather[0].icon,
      code: data.current.weather[0].id
    }
  };

  // Map the daily forecast to include compatibility fields
  const daily = data.daily.map((day: any) => {
    const date = new Date(day.dt * 1000);
    return {
      ...day,
      date: date.toISOString().split('T')[0],
      day_name: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      max_temp: day.temp.max,
      min_temp: day.temp.min,
      wind_speed: day.wind_speed,
      condition: {
        text: day.weather[0].description,
        icon: day.weather[0].icon,
        code: day.weather[0].id
      }
    };
  });

  return {
    current,
    daily,
    location: data.location
  };
};

export const fetchCurrentWeather = async (city: string, country: string): Promise<WeatherForecast> => {
  try {
    const geocodeResponse = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=1&appid=${API_KEY}`
    );
    
    const { lat, lon } = geocodeResponse.data[0];
    
    const response = await axios.get(
      `${BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`
    );
    
    const mappedData = mapWeatherData({
      ...response.data,
      location: `${city}, ${country}`
    });
    
    return mappedData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data. Please try again later.');
  }
};

// Added for Weather.tsx compatibility
export const getCurrentWeather = fetchCurrentWeather;
export const getWeatherForecast = fetchCurrentWeather;

export const fetchWeatherForecast = async (city: string, country: string): Promise<WeatherForecast> => {
  return fetchCurrentWeather(city, country);
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
