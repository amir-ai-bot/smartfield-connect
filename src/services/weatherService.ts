
import { toast } from "sonner";

export interface WeatherForecast {
  date: string;
  day: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
}

export interface CurrentWeather {
  location: string;
  temperature: number;
  condition: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  icon: string;
  sunrise: string;
  sunset: string;
}

// OpenWeatherMap API key - this is a free API key with limited usage
// In a production app, this would be stored in environment variables
const API_KEY = "d5bdef91d6694068b9212124232006";
const BASE_URL = "https://api.weatherapi.com/v1";

export const fetchCurrentWeather = async (location: string = "Gafsa,Tunisia"): Promise<CurrentWeather> => {
  try {
    const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${location}&aqi=no`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const data = await response.json();
    
    return {
      location: `${data.location.name}, ${data.location.country}`,
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      feelsLike: data.current.feelslike_c,
      humidity: data.current.humidity,
      windSpeed: data.current.wind_kph,
      icon: data.current.condition.icon,
      sunrise: "05:42", // Using static values as this API doesn't provide sunrise/sunset in free tier
      sunset: "19:28"
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    toast.error("Impossible de récupérer la météo actuelle", {
      description: "Veuillez vérifier votre connexion internet"
    });
    // Return fallback data
    return {
      location: "Gafsa, Tunisie",
      temperature: 32,
      condition: "Ensoleillé",
      feelsLike: 34,
      humidity: 25,
      windSpeed: 12,
      icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
      sunrise: "05:42",
      sunset: "19:28"
    };
  }
};

export const fetchWeatherForecast = async (location: string = "Gafsa,Tunisia", days: number = 7): Promise<WeatherForecast[]> => {
  try {
    const response = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=${days}&aqi=no`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch forecast data');
    }
    
    const data = await response.json();
    
    // Map API data to our format
    return data.forecast.forecastday.map((day: any) => {
      const date = new Date(day.date);
      const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
      const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

      // Map condition codes to our condition types
      let condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' = 'sunny';
      const conditionCode = day.day.condition.code;
      
      // Map weather API condition codes to our simplified conditions
      if (conditionCode === 1000) {
        condition = 'sunny';
      } else if ([1003, 1006, 1009].includes(conditionCode)) {
        condition = 'partly-cloudy';
      } else if ([1030, 1135, 1147].includes(conditionCode)) {
        condition = 'cloudy';
      } else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) {
        condition = 'rainy';
      } else {
        // Default to partly cloudy for any unmatched condition
        condition = 'partly-cloudy';
      }
      
      return {
        date: `${date.getDate()} ${monthNames[date.getMonth()]}`,
        day: dayNames[date.getDay()],
        temp: Math.round(day.day.avgtemp_c),
        humidity: day.day.avghumidity,
        windSpeed: Math.round(day.day.maxwind_kph),
        condition
      };
    });
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    toast.error("Impossible de récupérer les prévisions météo", {
      description: "Veuillez vérifier votre connexion internet"
    });
    
    // Return fallback data similar to what we had before
    return [
      { date: "17 Juin", day: "Lundi", temp: 32, humidity: 25, windSpeed: 12, condition: "sunny" },
      { date: "18 Juin", day: "Mardi", temp: 30, humidity: 30, windSpeed: 14, condition: "partly-cloudy" },
      { date: "19 Juin", day: "Mercredi", temp: 29, humidity: 45, windSpeed: 10, condition: "cloudy" },
      { date: "20 Juin", day: "Jeudi", temp: 28, humidity: 60, windSpeed: 8, condition: "rainy" },
      { date: "21 Juin", day: "Vendredi", temp: 31, humidity: 40, windSpeed: 9, condition: "partly-cloudy" },
      { date: "22 Juin", day: "Samedi", temp: 33, humidity: 30, windSpeed: 11, condition: "sunny" },
      { date: "23 Juin", day: "Dimanche", temp: 34, humidity: 25, windSpeed: 13, condition: "sunny" }
    ];
  }
};
