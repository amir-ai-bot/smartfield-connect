
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
}

export interface WeatherForecast {
  current: CurrentWeather;
  daily: ForecastDay[];
  location: string;
}

const API_KEY = '38d79015b08a472ac87f3957c2ed4300';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const fetchCurrentWeather = async (city: string, country: string): Promise<WeatherForecast> => {
  try {
    const geocodeResponse = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=1&appid=${API_KEY}`
    );
    
    const { lat, lon } = geocodeResponse.data[0];
    
    const response = await axios.get(
      `${BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`
    );
    
    return {
      current: response.data.current as CurrentWeather,
      daily: response.data.daily as ForecastDay[],
      location: `${city}, ${country}`
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data. Please try again later.');
  }
};

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
