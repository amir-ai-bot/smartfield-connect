
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudRain, Loader2, Sun, Thermometer, Wind } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherData } from '@/contexts/DashboardContext';

type WeatherCardProps = {
  weatherData: WeatherData | null;
  isLoading: boolean;
};

const WeatherCard = ({ weatherData, isLoading }: WeatherCardProps) => {
  return (
    <Card className="shadow-none border animate-slide-up" style={{ animationDelay: '200ms' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display flex items-center">
          <Sun className="h-5 w-5 mr-2 text-yellow-500" />
          Météo aujourd'hui
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <Skeleton className="h-10 w-20 mb-2" />
                <Skeleton className="h-5 w-32" />
              </div>
              
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg text-center">
                  <Skeleton className="h-5 w-5 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto mt-1" />
                  <Skeleton className="h-4 w-10 mx-auto mt-1" />
                </div>
              ))}
            </div>
            
            <div className="pt-2 border-t">
              <Skeleton className="h-4 w-40 mb-2" />
              <div className="flex justify-between">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-3 w-6 mb-1 mx-auto" />
                    <Skeleton className="h-5 w-5 mx-auto" />
                    <Skeleton className="h-3 w-8 mt-1 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-semibold">{weatherData?.temperature}°C</h3>
                <p className="text-gray-600">{weatherData?.location}</p>
              </div>
              
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Sun className="h-10 w-10 text-yellow-500" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <Thermometer className="h-5 w-5 mx-auto mb-1 text-agri-terra-500" />
                <p className="text-xs text-gray-500">Ressenti</p>
                <p className="text-sm font-medium">{weatherData?.feelsLike}°C</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <Wind className="h-5 w-5 mx-auto mb-1 text-agri-blue-500" />
                <p className="text-xs text-gray-500">Vent</p>
                <p className="text-sm font-medium">{weatherData?.windSpeed} km/h</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <CloudRain className="h-5 w-5 mx-auto mb-1 text-agri-blue-500" />
                <p className="text-xs text-gray-500">Humidité</p>
                <p className="text-sm font-medium">{weatherData?.humidity}%</p>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500 mb-2">Prévisions pour la semaine</p>
              <div className="flex justify-between">
                {weatherData?.forecast.map((day, i) => (
                  <div key={day.day} className="text-center">
                    <p className="text-xs mb-1">{day.day}</p>
                    <Sun className={`h-5 w-5 mx-auto ${day.condition === 'cloudy' ? 'text-gray-400' : 'text-yellow-500'}`} />
                    <p className="text-xs font-medium mt-1">{day.temperature}°</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
