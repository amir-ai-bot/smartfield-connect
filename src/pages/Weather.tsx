import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  SearchIcon, 
  MapPin, 
  Droplets, 
  Wind, 
  Thermometer, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow,
  CloudSun,
  Cloudy,
  Navigation,
  Sunrise,
  Sunset,
  Umbrella
} from 'lucide-react';
import { fetchWeatherData } from '@/services/weatherService';
import { locationService } from '@/services/locationService';
import { WeatherData } from '@/types/dashboard';
import { motion, AnimatePresence } from 'framer-motion';

const getWeatherIcon = (condition: string) => {
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('rain')) return <CloudRain className="w-8 h-8" />;
  if (conditionLower.includes('snow')) return <CloudSnow className="w-8 h-8" />;
  if (conditionLower.includes('cloud')) return <Cloudy className="w-8 h-8" />;
  if (conditionLower.includes('sun') || conditionLower.includes('clear')) return <Sun className="w-8 h-8" />;
  if (conditionLower.includes('partly')) return <CloudSun className="w-8 h-8" />;
  return <Cloud className="w-8 h-8" />;
};

const Weather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLocationError(null);
      
      const location = await locationService.getCurrentLocation();
      if (!location) {
        setLocationError("Impossible d'accéder à votre position. Veuillez autoriser l'accès à votre position dans les paramètres de votre appareil.");
        return;
      }
      
      setUserLocation({ latitude: location.latitude, longitude: location.longitude });
      
      const data = await fetchWeatherData(null, { 
        lat: location.latitude, 
        lon: location.longitude 
      });
      setWeatherData(data);
    } catch (error: any) {
      console.error('Error getting location:', error);
      setLocationError(error.message || "Impossible d'accéder à votre position");
      toast.error("Veuillez autoriser l'accès à votre position");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const loadDefaultWeather = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setWeatherData(null);
      setError("Veuillez rechercher une localisation ou autoriser l'accès à votre position");
      toast.info("Veuillez rechercher une localisation");
    } catch (error: any) {
      console.error('Error handling default weather:', error);
      setError(error.message || 'Une erreur est survenue');
      toast.error('Impossible de charger les données météo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsSearching(true);
      setError(null);
      const data = await fetchWeatherData(searchTerm);
      setWeatherData(data);
    } catch (error: any) {
      console.error('Error searching weather:', error);
      setError(error.message || 'Une erreur est survenue');
      toast.error('Impossible de trouver cette localisation');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Météo</h1>
            <p className="text-gray-600">Obtenez les prévisions météo en temps réel</p>
          </div>
          
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex items-center gap-2 max-w-md w-full">
              <Input
                placeholder="Rechercher une localisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading || !searchTerm.trim()}
                className="bg-blue-500 hover:bg-blue-600 shadow-lg"
              >
                <SearchIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 shadow-lg"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Utiliser ma position
            </Button>
            
            {locationError && (
              <div className="text-center mt-2">
                <p className="text-sm text-red-500">{locationError}</p>
                <div className="flex flex-col gap-2 mt-2">
                  <Button 
                    onClick={getCurrentLocation} 
                    variant="outline" 
                    className="text-sm"
                  >
                    Réessayer avec ma position
                  </Button>
                  <p className="text-sm text-gray-500">ou</p>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Rechercher une localisation..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button 
                      onClick={handleSearch} 
                      disabled={isLoading || !searchTerm.trim()}
                      className="bg-blue-500 hover:bg-blue-600 shadow-lg"
                    >
                      <SearchIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <WeatherCardSkeleton />
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <p className="text-red-500 mb-2">{error}</p>
                      <p className="text-sm text-gray-500">Veuillez réessayer avec une autre localisation</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : weatherData ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-2xl mb-1">
                          <MapPin className="h-6 w-6" />
                          {weatherData.location}
                        </CardTitle>
                        <CardDescription className="text-blue-100 text-lg">Aujourd'hui</CardDescription>
                      </div>
                      <div className="text-5xl font-bold">{weatherData.temperature}°C</div>
                    </div>
                    <div className="mt-6 flex justify-center">
                      <div className="text-center">
                        {getWeatherIcon(weatherData.condition)}
                        <p className="mt-2 text-xl font-medium">{weatherData.condition}</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-8">
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      <div className="bg-blue-50 p-6 rounded-xl text-center transform hover:scale-105 transition-transform">
                        <Thermometer className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                        <p className="text-sm text-gray-500 mb-1">Ressenti</p>
                        <p className="text-2xl font-bold text-gray-900">{weatherData.feelsLike}°C</p>
                      </div>
                      
                      <div className="bg-blue-50 p-6 rounded-xl text-center transform hover:scale-105 transition-transform">
                        <Wind className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                        <p className="text-sm text-gray-500 mb-1">Vent</p>
                        <p className="text-2xl font-bold text-gray-900">{weatherData.windSpeed} km/h</p>
                      </div>
                      
                      <div className="bg-blue-50 p-6 rounded-xl text-center transform hover:scale-105 transition-transform">
                        <Droplets className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                        <p className="text-sm text-gray-500 mb-1">Humidité</p>
                        <p className="text-2xl font-bold text-gray-900">{weatherData.humidity}%</p>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100">
                      <p className="text-lg font-semibold text-gray-700 mb-6">Prévisions pour la semaine</p>
                      <div className="grid grid-cols-5 gap-4">
                        {weatherData.forecast.map((day) => (
                          <div key={day.day} className="text-center bg-blue-50 p-4 rounded-xl transform hover:scale-105 transition-transform">
                            <p className="text-sm font-medium text-gray-500 mb-2">{day.day}</p>
                            <div className="mb-3">{getWeatherIcon(day.condition)}</div>
                            <p className="text-xl font-bold text-gray-900">{day.temperature}°</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

const WeatherCardSkeleton = () => (
  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-12 w-20 rounded" />
      </div>
      <div className="mt-6 flex justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
    <CardContent className="p-8">
      <div className="grid grid-cols-3 gap-6 mb-8">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-blue-50 p-6 rounded-xl">
            <Skeleton className="h-8 w-8 mx-auto mb-3 rounded-full" />
            <Skeleton className="h-4 w-24 mx-auto mb-1" />
            <Skeleton className="h-8 w-16 mx-auto" />
          </div>
        ))}
      </div>
      
      <div className="pt-6 border-t border-gray-100">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="grid grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="text-center bg-blue-50 p-4 rounded-xl">
              <Skeleton className="h-4 w-16 mx-auto mb-2" />
              <Skeleton className="h-8 w-8 mx-auto mb-3 rounded-full" />
              <Skeleton className="h-6 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Weather;
