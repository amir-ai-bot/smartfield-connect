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
      throw new Error('Aucune localisation spécifiée');
    }
    
    // Add required parameters
    url += '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weathercode&timezone=auto';
    
    console.log('Fetching weather data from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données météo');
    }
    
    const data = await response.json();
    
    // Get location name from reverse geocoding if coordinates were provided
    let locationName = location;
    if (coordinates && !location) {
      try {
        const reverseGeocodeResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${coordinates.lat}&longitude=${coordinates.lon}&language=fr&format=json`
        );
        
        if (reverseGeocodeResponse.ok) {
          const reverseData = await reverseGeocodeResponse.json();
          if (reverseData.results && reverseData.results.length > 0) {
            locationName = reverseData.results[0].name;
          }
        }
      } catch (error) {
        console.error('Error getting location name:', error);
      }
    }
    
    // Transform the API response to match our WeatherData interface
    const transformedData: WeatherData = {
      location: locationName || 'Position actuelle',
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
    throw error; // Let the component handle the error
  }
};

// Helper function to map weather codes to conditions
const mapWeatherCode = (code: number): string => {
  // WMO Weather interpretation codes (WW)
  // https://open-meteo.com/en/docs
  if (code === 0) return 'Ensoleillé';
  if (code === 1) return 'Peu nuageux';
  if (code === 2) return 'Partiellement nuageux';
  if (code === 3) return 'Couvert';
  if (code >= 45 && code <= 49) return 'Brumeux';
  if (code >= 50 && code <= 59) return 'Brouillard';
  if (code >= 60 && code <= 69) return 'Pluie légère';
  if (code >= 70 && code <= 79) return 'Neige';
  if (code >= 80 && code <= 82) return 'Averses';
  if (code >= 85 && code <= 86) return 'Averses de neige';
  if (code >= 95 && code <= 99) return 'Orage';
  return 'Inconnu';
};
