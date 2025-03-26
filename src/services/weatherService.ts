
// API with sample local data fallback in case the API is disabled
import { useState, useEffect } from 'react';

// Define types for weather data
export interface CurrentWeather {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  location: string;
  timestamp: string;
  feelsLike?: number; // Added for compatibility
  windSpeed?: number; // Added for compatibility
  sunrise?: string;   // Added for compatibility
  sunset?: string;    // Added for compatibility
}

export interface ForecastDay {
  date: string;
  day_name: string;
  max_temp: number;
  min_temp: number;
  condition: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  chance_of_rain: number;
}

export interface WeatherForecast {
  daily: ForecastDay[];
  location: string;
  temp?: number; // Added for compatibility
}

interface Position {
  lat: number;
  lng: number;
}

const WEATHER_API_KEY = "YOUR_WEATHER_API_KEY";

// Mock data for when the API fails
const mockCurrentWeather: CurrentWeather = {
  temperature: 24,
  condition: "Ensoleillé",
  icon: "sunny",
  humidity: 45,
  wind_speed: 12,
  location: "Tunis, Tunisie",
  timestamp: new Date().toISOString(),
  feelsLike: 26,    // Added for compatibility
  windSpeed: 12,    // Added for compatibility
  sunrise: "06:30", // Added for compatibility  
  sunset: "18:45"   // Added for compatibility
};

const mockForecast: WeatherForecast = {
  daily: [
    {
      date: new Date().toISOString().split('T')[0],
      day_name: "Aujourd'hui",
      max_temp: 28,
      min_temp: 18,
      condition: "Ensoleillé",
      icon: "sunny",
      humidity: 45,
      wind_speed: 12,
      chance_of_rain: 0
    },
    {
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      day_name: "Demain",
      max_temp: 27,
      min_temp: 17,
      condition: "Partiellement nuageux",
      icon: "partly-cloudy",
      humidity: 50,
      wind_speed: 10,
      chance_of_rain: 20
    },
    {
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      day_name: getWeekdayName(new Date(Date.now() + 86400000 * 2)),
      max_temp: 26,
      min_temp: 16,
      condition: "Nuageux",
      icon: "cloudy",
      humidity: 60,
      wind_speed: 15,
      chance_of_rain: 40
    },
    {
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      day_name: getWeekdayName(new Date(Date.now() + 86400000 * 3)),
      max_temp: 25,
      min_temp: 15,
      condition: "Pluie légère",
      icon: "rainy",
      humidity: 70,
      wind_speed: 18,
      chance_of_rain: 60
    },
    {
      date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      day_name: getWeekdayName(new Date(Date.now() + 86400000 * 4)),
      max_temp: 23,
      min_temp: 14,
      condition: "Ensoleillé",
      icon: "sunny",
      humidity: 45,
      wind_speed: 12,
      chance_of_rain: 0
    },
    {
      date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      day_name: getWeekdayName(new Date(Date.now() + 86400000 * 5)),
      max_temp: 26,
      min_temp: 16,
      condition: "Partiellement nuageux",
      icon: "partly-cloudy",
      humidity: 50,
      wind_speed: 10,
      chance_of_rain: 20
    },
    {
      date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
      day_name: getWeekdayName(new Date(Date.now() + 86400000 * 6)),
      max_temp: 27,
      min_temp: 17,
      condition: "Ensoleillé",
      icon: "sunny",
      humidity: 45,
      wind_speed: 12,
      chance_of_rain: 0
    }
  ],
  location: "Tunis, Tunisie",
  temp: 24 // Added for compatibility
};

// Helper function to get day of week
function getWeekdayName(date: Date): string {
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  return days[date.getDay()];
}

export async function fetchCurrentWeather(location?: string): Promise<CurrentWeather> {
  try {
    if (!location) {
      console.info('No location provided, using mock data');
      return {
        ...mockCurrentWeather,
        feelsLike: mockCurrentWeather.temperature + 2,
        windSpeed: mockCurrentWeather.wind_speed
      };
    }
    
    console.info(`Fetching current weather for ${location}`);
    
    const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${location}&lang=fr`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Weather API Error:', errorData);
      throw new Error(`Failed to fetch weather data: ${response.status} ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
      humidity: data.current.humidity,
      wind_speed: data.current.wind_kph,
      location: `${data.location.name}, ${data.location.country}`,
      timestamp: data.current.last_updated_epoch,
      feelsLike: data.current.feelslike_c,
      windSpeed: data.current.wind_kph,
      sunrise: "06:30", // API doesn't provide this in current endpoint
      sunset: "18:45"   // API doesn't provide this in current endpoint
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    // Return mock data when API fails
    return {
      ...mockCurrentWeather,
      feelsLike: mockCurrentWeather.temperature + 2,
      windSpeed: mockCurrentWeather.wind_speed
    };
  }
}

export async function fetchWeatherForecast(location?: string, days: number = 7): Promise<WeatherForecast> {
  try {
    if (!location) {
      console.info('No location provided, using mock data');
      return {
        ...mockForecast,
        temp: (mockForecast.daily[0].max_temp + mockForecast.daily[0].min_temp) / 2
      };
    }
    
    console.info(`Fetching forecast for ${location}, ${days} days`);
    
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${location}&days=${days}&lang=fr`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Weather API Error:', errorData);
      throw new Error(`Failed to fetch forecast data: ${response.status} ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    const daily = data.forecast.forecastday.map((day: any) => {
      const date = new Date(day.date);
      return {
        date: day.date,
        day_name: date.toDateString() === new Date().toDateString() 
          ? "Aujourd'hui" 
          : date.toDateString() === new Date(Date.now() + 86400000).toDateString()
            ? "Demain"
            : getWeekdayName(date),
        max_temp: day.day.maxtemp_c,
        min_temp: day.day.mintemp_c,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        humidity: day.day.avghumidity,
        wind_speed: day.day.maxwind_kph,
        chance_of_rain: day.day.daily_chance_of_rain
      };
    });
    
    return {
      daily,
      location: `${data.location.name}, ${data.location.country}`,
      temp: data.current.temp_c
    };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    // Return mock data when API fails
    return {
      ...mockForecast,
      temp: (mockForecast.daily[0].max_temp + mockForecast.daily[0].min_temp) / 2
    };
  }
}

// Custom hook for getting user's location
export const useGeolocation = () => {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas prise en charge par votre navigateur");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError("Impossible d'obtenir votre position. Utilisation d'une position par défaut.");
        // Use default location (Tunis)
        setPosition({
          lat: 36.8065,
          lng: 10.1815
        });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  return { position, error, loading };
};
