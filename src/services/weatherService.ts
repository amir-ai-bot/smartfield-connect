
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
    
    const weather = {
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
    
    // Add weather recommendations based on conditions
    const recommendations = getWeatherRecommendations(weather);
    
    // Show recommendation as a toast
    if (recommendations) {
      toast.info("Recommandation météo", {
        description: recommendations,
        position: 'top-center',
        duration: 5000
      });
    }
    
    return weather;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    toast.error("Impossible de récupérer la météo actuelle", {
      description: "Veuillez vérifier votre connexion internet",
      position: 'top-center'
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
      description: "Veuillez vérifier votre connexion internet",
      position: 'top-center'
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

// Function to generate recommendations based on weather conditions
const getWeatherRecommendations = (weather: CurrentWeather): string => {
  // Temperature-based recommendations
  if (weather.temperature > 35) {
    return "Températures très élevées. Assurez une irrigation adéquate et évitez les travaux agricoles entre 11h et 16h.";
  } else if (weather.temperature > 30) {
    return "Chaleur importante. Veillez à ce que vos cultures soient bien irriguées et envisagez un ombrage pour les plantations sensibles.";
  } else if (weather.temperature < 10) {
    return "Températures basses. Protégez les cultures sensibles au gel et reportez les semis si possible.";
  }
  
  // Humidity-based recommendations
  if (weather.humidity > 80) {
    return "Humidité élevée. Surveillez les maladies fongiques. Assurez une bonne ventilation des cultures.";
  } else if (weather.humidity < 30) {
    return "Temps très sec. Augmentez l'irrigation et envisagez un paillage pour conserver l'humidité du sol.";
  }
  
  // Wind-based recommendations
  if (weather.windSpeed > 30) {
    return "Vents forts. Protégez les jeunes plants et reportez les pulvérisations. Risque de dessèchement rapide.";
  }
  
  // Condition-based recommendations
  if (weather.condition.toLowerCase().includes("pluie") || weather.condition.toLowerCase().includes("averse")) {
    return "Précipitations prévues. Reportez les travaux de pulvérisation et de fertilisation. Vérifiez les systèmes de drainage.";
  } else if (weather.condition.toLowerCase().includes("orage")) {
    return "Orages prévus. Sécurisez les équipements et les structures. Risque d'érosion des sols.";
  } else if (weather.condition.toLowerCase().includes("soleil") || weather.condition.toLowerCase().includes("ensoleillé")) {
    return "Journée ensoleillée. Moment idéal pour la récolte et le séchage des produits. Vérifiez les besoins en eau.";
  } else if (weather.condition.toLowerCase().includes("nuag")) {
    return "Temps nuageux. Bon moment pour les travaux agricoles nécessitant moins de chaleur.";
  }
  
  // Default recommendation
  return "Conditions modérées. Idéal pour la plupart des travaux agricoles.";
};
