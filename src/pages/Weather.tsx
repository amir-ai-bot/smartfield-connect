
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MapPin, Wind, Droplets, Thermometer, Sun, CloudRain, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  feels_like: number;
  sunrise: string;
  sunset: string;
  uv_index: number;
  precipitation: number;
  forecast: Array<{
    date: string;
    day: string; 
    temp_max: number;
    temp_min: number;
    icon: string;
    description: string;
  }>;
}

const Weather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Météo | AgriSmart';
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      toast.info('Recherche de votre position...');
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        error => {
          console.error('Error getting location:', error);
          toast.error('Impossible d\'obtenir votre position. Veuillez l\'entrer manuellement.');
          setLoading(false);
        }
      );
    } else {
      toast.error('La géolocalisation n\'est pas supportée par votre navigateur.');
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      // Get location name from coordinates
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=8e99d563197c147fe12f45101a1f3670`
      );
      
      if (geoResponse.data && geoResponse.data.length > 0) {
        const location = `${geoResponse.data[0].name}, ${geoResponse.data[0].country}`;
        setUserLocation(location);
        
        // Get current weather
        const currentResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=8e99d563197c147fe12f45101a1f3670`
        );
        
        // Get forecast
        const forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=8e99d563197c147fe12f45101a1f3670`
        );
        
        // Get UV index
        const oneCallResponse = await axios.get(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&lang=fr&appid=8e99d563197c147fe12f45101a1f3670`
        );
        
        // Process forecast data to get daily forecasts
        const uniqueDays = new Set();
        const dailyForecasts = forecastResponse.data.list
          .filter((item: any) => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!uniqueDays.has(date) && uniqueDays.size < 5) {
              uniqueDays.add(date);
              return true;
            }
            return false;
          })
          .map((item: any) => {
            const date = new Date(item.dt * 1000);
            return {
              date: date.toLocaleDateString(),
              day: new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date),
              temp_max: Math.round(item.main.temp_max),
              temp_min: Math.round(item.main.temp_min),
              icon: item.weather[0].icon,
              description: item.weather[0].description
            };
          });
          
        // Process sunrise/sunset
        const sunrise = new Date(currentResponse.data.sys.sunrise * 1000)
          .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(currentResponse.data.sys.sunset * 1000)
          .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
        // Combine data
        const weatherData: WeatherData = {
          location,
          temperature: Math.round(currentResponse.data.main.temp),
          description: currentResponse.data.weather[0].description,
          humidity: currentResponse.data.main.humidity,
          windSpeed: Math.round(currentResponse.data.wind.speed * 3.6), // Convert to km/h
          icon: currentResponse.data.weather[0].icon,
          feels_like: Math.round(currentResponse.data.main.feels_like),
          sunrise,
          sunset,
          uv_index: oneCallResponse.data.current.uvi || 0,
          precipitation: oneCallResponse.data.daily[0].pop * 100 || 0, // Probability of precipitation
          forecast: dailyForecasts
        };
        
        setWeatherData(weatherData);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast.error('Erreur lors de la récupération des données météo');
    } finally {
      setLoading(false);
    }
  };

  const getUVIndexLabel = (index: number) => {
    if (index <= 2) return { label: 'Faible', color: 'bg-green-500' };
    if (index <= 5) return { label: 'Modéré', color: 'bg-yellow-500' };
    if (index <= 7) return { label: 'Élevé', color: 'bg-orange-500' };
    if (index <= 10) return { label: 'Très élevé', color: 'bg-red-500' };
    return { label: 'Extrême', color: 'bg-purple-500' };
  };

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getAgricultureAdvice = (data: WeatherData) => {
    // Simple agriculture advice based on weather conditions
    if (data.precipitation > 70) {
      return "Risque élevé de précipitations. Évitez l'irrigation et les traitements phytosanitaires aujourd'hui.";
    }
    if (data.humidity > 80) {
      return "Humidité élevée. Surveillez le développement de maladies fongiques sur vos cultures.";
    }
    if (data.temperature > 30) {
      return "Températures élevées. Assurez une irrigation adéquate et évitez de traiter aux heures les plus chaudes.";
    }
    if (data.windSpeed > 20) {
      return "Vents forts prévus. Reportez les pulvérisations et vérifiez les structures de support.";
    }
    return "Conditions favorables pour les activités agricoles normales.";
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 mt-16">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Météo Agricole</h1>
          <Button 
            onClick={requestLocation}
            variant="outline"
            size="sm"
            className="flex items-center"
            disabled={loading}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Localiser
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : weatherData ? (
          <>
            {/* Current Weather Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
                    <h2 className="text-lg font-medium text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      {weatherData.location}
                    </h2>
                    <div className="flex items-center mt-3">
                      <img 
                        src={getWeatherIcon(weatherData.icon)} 
                        alt={weatherData.description}
                        className="w-20 h-20"
                      />
                      <div className="ml-2">
                        <div className="text-4xl font-bold">{weatherData.temperature}°C</div>
                        <div className="text-sm text-gray-600 capitalize">
                          {weatherData.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center p-2 bg-white/70 rounded-lg">
                      <Thermometer className="h-5 w-5 text-orange-500 mb-1" />
                      <span className="text-sm text-gray-600">Ressenti</span>
                      <span className="text-xl font-semibold">{weatherData.feels_like}°C</span>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 bg-white/70 rounded-lg">
                      <Wind className="h-5 w-5 text-blue-500 mb-1" />
                      <span className="text-sm text-gray-600">Vent</span>
                      <span className="text-xl font-semibold">{weatherData.windSpeed} km/h</span>
                    </div>
                    
                    <div className="flex flex-col items-center p-2 bg-white/70 rounded-lg">
                      <Droplets className="h-5 w-5 text-blue-400 mb-1" />
                      <span className="text-sm text-gray-600">Humidité</span>
                      <span className="text-xl font-semibold">{weatherData.humidity}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Agriculture Advice */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Conseil agricole du jour</h3>
                    <p className="text-gray-700">{getAgricultureAdvice(weatherData)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Additional Weather Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Indice UV & Précipitations</h3>
                  
                  <div className="mb-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Indice UV</span>
                      <span className="text-sm font-medium">
                        {getUVIndexLabel(weatherData.uv_index).label} ({weatherData.uv_index})
                      </span>
                    </div>
                    <Progress 
                      value={weatherData.uv_index * 10} 
                      className={`h-2 ${getUVIndexLabel(weatherData.uv_index).color}`} 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Probabilité de précipitations</span>
                      <span className="text-sm font-medium">{weatherData.precipitation}%</span>
                    </div>
                    <Progress 
                      value={weatherData.precipitation} 
                      className="h-2 bg-blue-100"
                    />
                    <div className="flex justify-between mt-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 text-amber-500 mr-1" />
                        <span>Lever: {weatherData.sunrise}</span>
                      </div>
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 text-orange-500 mr-1" />
                        <span>Coucher: {weatherData.sunset}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Prévisions à 5 jours</h3>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {weatherData.forecast.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <span className="text-sm font-medium">{day.day}</span>
                        <img 
                          src={getWeatherIcon(day.icon)} 
                          alt={day.description}
                          className="w-10 h-10"
                        />
                        <div className="flex gap-1 text-sm">
                          <span className="font-medium">{day.temp_max}°</span>
                          <span className="text-gray-500">{day.temp_min}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Données météo non disponibles</h3>
              <p className="text-gray-600 mb-4">
                Impossible de récupérer les informations météo pour votre position.
              </p>
              <Button onClick={requestLocation}>
                <MapPin className="h-4 w-4 mr-2" />
                Réessayer avec ma position
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Weather;
