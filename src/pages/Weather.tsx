import { useEffect, useState } from 'react';
import { MapPin, Thermometer, Wind, Droplets } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { locationService } from '@/services/locationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Geolocation } from '@capacitor/geolocation';

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    day: string;
    temperature: number;
    condition: string;
  }>;
}

const Weather = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  useEffect(() => {
    checkLocationPermission();
    fetchWeatherData();
  }, []);
  
  const checkLocationPermission = async () => {
    try {
      const permissions = await Geolocation.checkPermissions();
      setLocationPermission(permissions.location);
    } catch (error) {
      console.error('Error checking location permissions:', error);
      setLocationPermission('prompt');
    }
  };
  
  const fetchWeatherData = async () => {
    setIsLoading(true);
    
    try {
      let userLocation = null;
      
      // First try to get the user's saved location if they're logged in
      if (user) {
        userLocation = await locationService.getSavedLocation(user.id);
      }
      
      // If no saved location, try to get current location
      if (!userLocation) {
        userLocation = await locationService.getCurrentLocation();
      }
      
      // If we have a location, get weather data
      if (userLocation) {
        const weatherData = await locationService.getWeatherForLocation(userLocation);
        
        // Save the user's location if they're logged in
        if (user) {
          await locationService.saveUserLocation(user.id, userLocation);
        }
        
        // Create proper weather data object
        setWeather({
          location: 'Votre position',
          temperature: weatherData.temperature,
          feelsLike: Math.round(weatherData.temperature * 0.9),
          condition: weatherData.condition,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
          forecast: [
            { day: 'Lun', temperature: Math.round(Math.random() * 10 + 15), condition: 'sunny' },
            { day: 'Mar', temperature: Math.round(Math.random() * 10 + 15), condition: 'partly-cloudy' },
            { day: 'Mer', temperature: Math.round(Math.random() * 10 + 15), condition: 'cloudy' },
            { day: 'Jeu', temperature: Math.round(Math.random() * 10 + 15), condition: 'rainy' },
            { day: 'Ven', temperature: Math.round(Math.random() * 10 + 15), condition: 'sunny' },
          ]
        });
      } else {
        toast.error('Impossible de déterminer votre position');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast.error('Impossible de charger les données météo');
    } finally {
      setIsLoading(false);
    }
  };
  
  const requestLocationPermission = async () => {
    try {
      const { location } = await Geolocation.requestPermissions();
      setLocationPermission(location);
      
      if (location === 'granted') {
        fetchWeatherData();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      toast.error('Erreur lors de la demande de permission de localisation');
    }
  };
  
  const renderWeatherIcon = () => {
    if (!weather) return null;
    
    switch (weather.condition) {
      case 'sunny':
        return (
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-full"></div>
          </div>
        );
      case 'cloudy':
        return (
          <div className="w-24 h-24 flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
        );
      case 'rainy':
        return (
          <div className="w-24 h-24 flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 bg-blue-300 rounded-full"></div>
            </div>
          </div>
        );
      case 'partly-cloudy':
        return (
          <div className="w-24 h-24 flex items-center justify-center relative">
            <div className="w-12 h-12 bg-yellow-400 rounded-full absolute bottom-4 left-4"></div>
            <div className="w-14 h-14 bg-gray-200 rounded-full absolute top-4 right-4"></div>
          </div>
        );
      default:
        return (
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-full"></div>
          </div>
        );
    }
  };
  
  const renderDayIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <div className="w-8 h-8 bg-yellow-400 rounded-full mx-auto"></div>;
      case 'cloudy':
        return <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto"></div>;
      case 'rainy':
        return <div className="w-8 h-8 bg-blue-200 rounded-full mx-auto"></div>;
      case 'partly-cloudy':
        return (
          <div className="w-8 h-8 relative mx-auto">
            <div className="w-5 h-5 bg-yellow-400 rounded-full absolute bottom-0 left-0"></div>
            <div className="w-5 h-5 bg-gray-200 rounded-full absolute top-0 right-0"></div>
          </div>
        );
      default:
        return <div className="w-8 h-8 bg-yellow-400 rounded-full mx-auto"></div>;
    }
  };
  
  if (locationPermission !== 'granted' && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 text-center">
          <MapPin className="w-12 h-12 text-agri-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Accès à la localisation nécessaire</h2>
          <p className="text-gray-600 mb-6">
            Pour afficher les informations météo pour votre région, nous avons besoin de votre permission pour accéder à votre localisation.
          </p>
          <Button onClick={requestLocationPermission} className="bg-agri-green-500 hover:bg-agri-green-600">
            Autoriser l'accès à ma position
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Météo agricole</h1>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="bg-white shadow-md">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-10 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ) : weather ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-3xl font-bold">{weather.temperature}°C</h2>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{weather.location}</span>
                      </div>
                    </div>
                    {renderWeatherIcon()}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Thermometer className="h-6 w-6 mx-auto text-orange-500 mb-1" />
                      <p className="text-sm text-gray-500">Ressenti</p>
                      <p className="font-bold">{weather.feelsLike}°C</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Wind className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                      <p className="text-sm text-gray-500">Vent</p>
                      <p className="font-bold">{weather.windSpeed} km/h</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Droplets className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                      <p className="text-sm text-gray-500">Humidité</p>
                      <p className="font-bold">{weather.humidity}%</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucune donnée météo disponible</p>
                  <Button 
                    onClick={fetchWeatherData} 
                    className="mt-4 bg-agri-green-500 hover:bg-agri-green-600"
                  >
                    Réessayer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Prévisions sur 5 jours</h3>
              
              {isLoading ? (
                <div className="animate-pulse grid grid-cols-5 gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2 text-center">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-10 mx-auto"></div>
                    </div>
                  ))}
                </div>
              ) : weather ? (
                <div className="grid grid-cols-5 gap-2">
                  {weather.forecast.map((day, index) => (
                    <div key={index} className="text-center">
                      <p className="font-medium mb-1">{day.day}</p>
                      {renderDayIcon(day.condition)}
                      <p className="mt-1 font-bold">{day.temperature}°C</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucune prévision disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-white shadow-md mt-6">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">Conseils agricoles</h3>
            
            {!isLoading && weather && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Gestion de l'irrigation</h4>
                  <p className="text-gray-700">
                    {weather.humidity > 70 
                      ? "L'humidité élevée suggère de réduire l'irrigation pour éviter les maladies fongiques."
                      : weather.humidity < 40
                      ? "Faible humidité détectée. Augmentez l'irrigation pour éviter le stress hydrique des cultures."
                      : "Conditions d'humidité optimales. Maintenez le régime d'irrigation habituel."}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Protection des cultures</h4>
                  <p className="text-gray-700">
                    {weather.windSpeed > 25
                      ? "Vents forts attendus. Retardez la pulvérisation de pesticides pour éviter la dérive."
                      : weather.condition === 'rainy'
                      ? "Conditions pluvieuses. Utilisez des produits résistants au lessivage si une pulvérisation est nécessaire."
                      : "Conditions favorables pour les traitements phytosanitaires."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Weather;
