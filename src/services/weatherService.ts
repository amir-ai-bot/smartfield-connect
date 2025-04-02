import { WeatherData } from '@/types/dashboard';
import { mockWeatherData } from '@/mocks/weatherData';
import { toast } from 'sonner';

interface Coordinates {
  lat: number;
  lon: number;
}

export const fetchWeatherData = async (location?: string, coordinates?: Coordinates): Promise<WeatherData> => {
  try {
    let url = 'https://api.open-meteo.com/v1/forecast?';
    
    if (coordinates) {
      url += `latitude=${coordinates.lat}&longitude=${coordinates.lon}`;
    } else if (location) {
      // Geocoding API to get coordinates from location name
      const geocodeResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=fr&format=json`
      );
      
      if (!geocodeResponse.ok) {
        throw new Error('Impossible de trouver cette localisation');
      }
      
      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error('Localisation non trouvée');
      }
      
      const { latitude, longitude, name } = geocodeData.results[0];
      url += `latitude=${latitude}&longitude=${longitude}`;
    } else {
      // Default to Paris coordinates if no location provided
      url += 'latitude=48.8566&longitude=2.3522';
    }
    
    // Add required parameters
    url += '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weathercode&timezone=auto';
    
    console.log('Fetching weather data from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données météo');
    }
    
    const data = await response.json();
    
    // Transform the API response to match our WeatherData interface
    const transformedData: WeatherData = {
      location: location || 'Paris',
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      condition: mapWeatherCode(data.current.weathercode),
      forecast: data.daily.time.map((day: string, index: number) => ({
        day: new Date(day).toLocaleDateString('fr-FR', { weekday: 'short' }),
        temperature: Math.round((data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2),
        condition: mapWeatherCode(data.daily.weathercode[index])
      }))
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Fallback to mock data in case of error
    toast.warning('Utilisation des données météo simulées', {
      id: 'mock-weather-data',
      duration: 5000
    });
    return mockWeatherData;
  }
};

// Map Open-Meteo weather codes to our weather conditions
const mapWeatherCode = (code: number): string => {
  const weatherCodes: Record<number, string> = {
    0: 'Ensoleillé',
    1: 'Légèrement nuageux',
    2: 'Partiellement nuageux',
    3: 'Nuageux',
    45: 'Brouillard',
    48: 'Brouillard givrant',
    51: 'Légère bruine',
    53: 'Bruine modérée',
    55: 'Bruine dense',
    61: 'Pluie légère',
    63: 'Pluie modérée',
    65: 'Pluie forte',
    71: 'Neige légère',
    73: 'Neige modérée',
    75: 'Neige forte',
    77: 'Grêle',
    80: 'Averses légères',
    81: 'Averses modérées',
    82: 'Averses fortes',
    85: 'Averses de neige légères',
    86: 'Averses de neige fortes',
    95: 'Orage',
    96: 'Orage avec grêle légère',
    99: 'Orage avec grêle forte'
  };
  
  return weatherCodes[code] || 'Nuageux';
};
