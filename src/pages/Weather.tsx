
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Sparkles, SearchIcon, MapPin } from 'lucide-react';
import { fetchWeatherData } from '@/services/weatherService';
import { WeatherData } from '@/types/dashboard';

const Weather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWeatherData();
        setWeatherData(data);
      } catch (error: any) {
        console.error('Error fetching weather data:', error);
        setError(error.message || 'Une erreur est survenue');
        toast.error('Impossible de charger les données météo');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWeatherData();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchWeatherData(searchTerm);
      setWeatherData(data);
    } catch (error: any) {
      console.error('Error searching weather:', error);
      setError(error.message || 'Une erreur est survenue');
      toast.error('Impossible de trouver cette localisation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 mt-14 md:mt-16">
      <h1 className="text-xl font-semibold mb-4">Météo</h1>
      
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Rechercher une localisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isLoading || !searchTerm.trim()}>
            {isLoading ? (
              <Sparkles className="h-4 w-4 animate-spin" />
            ) : (
              <SearchIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <WeatherCardSkeleton />
      ) : error ? (
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="text-center py-6">
              <p className="text-red-500 mb-2">{error}</p>
              <p className="text-sm text-gray-500">Veuillez réessayer avec une autre localisation</p>
            </div>
          </CardContent>
        </Card>
      ) : weatherData ? (
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-1 text-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  {weatherData.location}
                </CardTitle>
                <CardDescription>Aujourd'hui</CardDescription>
              </div>
              <div className="text-3xl font-bold">{weatherData.temperature}°C</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Ressenti</p>
                <p className="text-sm font-medium">{weatherData.feelsLike}°C</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Vent</p>
                <p className="text-sm font-medium">{weatherData.windSpeed} km/h</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Humidité</p>
                <p className="text-sm font-medium">{weatherData.humidity}%</p>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500 mb-2">Prévisions pour la semaine</p>
              <div className="flex justify-between">
                {weatherData.forecast.map((day) => (
                  <div key={day.day} className="text-center">
                    <p className="text-xs mb-1">{day.day}</p>
                    <p className="text-xs font-medium mt-1">{day.temperature}°</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

const WeatherCardSkeleton = () => (
  <Card className="shadow-sm border">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-16 rounded" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-gray-50 p-3 rounded-lg">
            <Skeleton className="h-3 w-16 mx-auto mb-1" />
            <Skeleton className="h-4 w-10 mx-auto" />
          </div>
        ))}
      </div>
      
      <div className="pt-2 border-t">
        <Skeleton className="h-3 w-40 mb-2" />
        <div className="flex justify-between">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-3 w-6 mb-1 mx-auto" />
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Weather;
