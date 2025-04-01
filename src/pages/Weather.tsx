import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Sparkles } from 'lucide-react';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    humidity: number;
  };
}

interface Location {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}

const Weather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [nearbyLocations, setNearbyLocations] = useState<Location[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast()

  useEffect(() => {
    const getCurrentPosition = () => {
      setIsLoading(true);
      setLocationError(null);
      
      if (!navigator.geolocation) {
        setLocationError("La géolocalisation n'est pas prise en charge par votre navigateur");
        setIsLoading(false);
        return;
      }
      
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'denied') {
          setLocationError("L'accès à votre position a été bloqué. Veuillez autoriser l'accès à la localisation dans les paramètres de votre appareil.");
          setIsLoading(false);
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              setCurrentLocation({ lat: latitude, lon: longitude });
              
              // Get weather for current location
              const currentLocationWeather = await fetchWeatherData(latitude, longitude);
              setWeatherData(currentLocationWeather);
              
              // Get nearby locations
              const nearbyLocations = await fetchNearbyLocations(latitude, longitude);
              setNearbyLocations(nearbyLocations);
              
              setIsLoading(false);
            } catch (error) {
              console.error('Error fetching weather data:', error);
              setError('Erreur lors de la récupération des données météo');
              setIsLoading(false);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            let errorMessage = "Erreur lors de l'accès à votre position";
            
            if (error.code === 1) {
              errorMessage = "L'accès à votre position a été refusé. Veuillez autoriser l'accès à la localisation dans les paramètres de votre appareil.";
            } else if (error.code === 2) {
              errorMessage = "Impossible de déterminer votre position actuelle.";
            } else if (error.code === 3) {
              errorMessage = "Le temps d'attente pour obtenir votre position est dépassé.";
            }
            
            setLocationError(errorMessage);
            setIsLoading(false);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 0 
          }
        );
      });
    };
    
    getCurrentPosition();
  }, []);

  const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&lang=fr`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (e:any) {
      console.error("Could not fetch weather data:", e);
      setError("Could not fetch weather data: " + e.message);
      throw e;
    }
  };

  const fetchNearbyLocations = async (lat: number, lon: number): Promise<Location[]> => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const apiUrl = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${lat},${lon}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (e:any) {
      console.error("Could not fetch nearby locations:", e);
      setError("Could not fetch nearby locations: " + e.message);
      return [];
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${searchTerm}&lang=fr`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWeatherData(data);
      setIsLoading(false);
    } catch (e:any) {
      console.error("Could not fetch weather data:", e);
      setError("Could not fetch weather data: " + e.message);
      setIsLoading(false);
    }
  };

  if (locationError) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-center mb-4">Problème d'accès à la localisation</h2>
          <p className="text-gray-600 mb-6 text-center">{locationError}</p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-amber-500 bg-amber-50 p-4">
              <h3 className="font-medium text-amber-800">Comment activer la localisation:</h3>
              <ul className="list-disc ml-5 mt-2 text-sm text-gray-600 space-y-1">
                <li>Vérifiez que le GPS est activé sur votre appareil</li>
                <li>Dans les paramètres de votre téléphone, assurez-vous que l'application a la permission d'accéder à votre localisation</li>
                <li>Autorisez l'accès à la localisation lorsque le navigateur le demande</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Réessayer
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Vous pouvez également essayer de rechercher une ville manuellement:
              </p>
              <div className="flex mt-2">
                <Input
                  placeholder="Rechercher une ville..."
                  className="mr-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button onClick={handleSearch} disabled={!searchTerm}>
                  Rechercher
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      {isLoading && !weatherData ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <Sparkles className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Chargement des données météo...</p>
        </div>
      ) : error ? (
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-center mb-4">Erreur</h2>
          <p className="text-red-500 text-center">{error}</p>
        </div>
      ) : weatherData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">
                {weatherData.location.name}, {weatherData.location.region}
              </CardTitle>
              <CardDescription>{weatherData.location.country}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img
                    src={weatherData.current.condition.icon}
                    alt={weatherData.current.condition.text}
                    className="mr-2"
                  />
                  <span className="text-4xl font-bold">
                    {weatherData.current.temp_c}°C
                  </span>
                </div>
                <div>
                  <p className="text-gray-600">
                    {weatherData.current.condition.text}
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-700">
                  Vent: {weatherData.current.wind_kph} km/h
                </p>
                <p className="text-gray-700">
                  Humidité: {weatherData.current.humidity}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">
                Rechercher une autre ville
              </CardTitle>
              <CardDescription>
                Entrez le nom d'une ville pour voir la météo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Nom de la ville"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mr-2"
                />
                <Button onClick={handleSearch} disabled={!searchTerm}>
                  Rechercher
                </Button>
              </div>
            </CardContent>
          </Card>

          {nearbyLocations.length > 0 && (
            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold">
                  Villes à proximité
                </CardTitle>
                <CardDescription>
                  Météo dans les villes à proximité
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <ul>
                  {nearbyLocations.map((location) => (
                    <li key={location.id} className="py-2">
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearchTerm(location.name);
                          handleSearch();
                        }}
                      >
                        {location.name}, {location.region}, {location.country}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-center mb-4">Météo</h2>
          <p className="text-gray-600 text-center">
            Veuillez activer la géolocalisation pour voir la météo de votre
            position actuelle.
          </p>
          <div className="flex mt-2">
            <Input
              placeholder="Rechercher une ville..."
              className="mr-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={!searchTerm}>
              Rechercher
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
