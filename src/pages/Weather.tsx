
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Wind, Droplets, Thermometer, SunMedium, Cloud, CloudRain, Snowflake } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

// API key from the user
const WEATHER_API_KEY = 'a959e94a83284ade92a112741252803';
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_dir: string;
    humidity: number;
    feelslike_c: number;
    uv: number;
    precip_mm: number;
  };
  forecast?: {
    forecastday: {
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        daily_chance_of_rain: number;
      };
      hour: {
        time: string;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      }[];
    }[];
  };
}

const Weather = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);

  // Get user's geolocation
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Impossible d\'obtenir votre position. Veuillez essayer de rechercher un lieu.');
          setIsLoading(false);
        }
      );
    } else {
      toast.error('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
  };

  // Fetch weather data by coordinates
  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast.json`, {
        params: {
          key: WEATHER_API_KEY,
          q: `${lat},${lon}`,
          days: 7,
          aqi: 'no',
          alerts: 'no'
        }
      });
      setWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast.error('Erreur lors de la récupération des données météo');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch weather data by city name
  const fetchWeatherByCity = async (city: string) => {
    if (!city.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast.json`, {
        params: {
          key: WEATHER_API_KEY,
          q: city,
          days: 7,
          aqi: 'no',
          alerts: 'no'
        }
      });
      setWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast.error('Lieu non trouvé. Veuillez essayer un autre lieu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherByCity(searchQuery);
  };

  // Get weather icon based on condition code
  const getWeatherIcon = (code: number) => {
    // Clear conditions
    if (code === 1000) return <SunMedium className="h-8 w-8 text-yellow-500" />;
    
    // Cloudy conditions
    if (code >= 1003 && code <= 1030) return <Cloud className="h-8 w-8 text-gray-500" />;
    
    // Rain conditions
    if (code >= 1063 && code <= 1201) return <CloudRain className="h-8 w-8 text-blue-500" />;
    
    // Snow conditions
    if (code >= 1204 && code <= 1237) return <Snowflake className="h-8 w-8 text-blue-300" />;
    
    // Default
    return <Thermometer className="h-8 w-8 text-red-500" />;
  };

  // Ask for user location on component mount
  useEffect(() => {
    document.title = 'Météo | AgriSmart';
    
    // Ask for geolocation permission on component mount
    const askForGeolocation = () => {
      toast.info(
        'Pour obtenir des prévisions météo précises, autorisez l\'accès à votre position.',
        {
          duration: 5000,
          action: {
            label: 'Autoriser',
            onClick: getUserLocation
          }
        }
      );
    };
    
    setTimeout(askForGeolocation, 1000);
  }, []);

  // Format date string
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateStr).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Météo agricole</h1>
              <p className="text-gray-600">Consultez les prévisions météo pour votre exploitation</p>
            </div>
          </div>
          
          {/* Search bar */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Rechercher un lieu..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="bg-agri-green-500 hover:bg-agri-green-600 whitespace-nowrap"
                    disabled={isLoading}
                  >
                    Rechercher
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={getUserLocation}
                    disabled={isLoading}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="hidden md:inline">Ma position</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agri-green-500"></div>
            </div>
          ) : weatherData ? (
            <div className="space-y-6">
              {/* Current weather card */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-agri-green-500 p-6 text-white">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">{weatherData.location.name}</h2>
                      <p className="text-blue-100">{weatherData.location.region}, {weatherData.location.country}</p>
                      <p className="text-sm mt-1">{new Date(weatherData.location.localtime).toLocaleString('fr-FR')}</p>
                    </div>
                    <div className="flex items-center">
                      <img 
                        src={`https:${weatherData.current.condition.icon}`} 
                        alt={weatherData.current.condition.text}
                        className="w-16 h-16"
                      />
                      <div className="text-center">
                        <span className="text-4xl font-bold">{Math.round(weatherData.current.temp_c)}°C</span>
                        <p className="text-blue-100">{weatherData.current.condition.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Thermometer className="h-6 w-6 text-amber-500" />
                      <div>
                        <p className="text-sm text-gray-500">Ressenti</p>
                        <p className="font-semibold">{Math.round(weatherData.current.feelslike_c)}°C</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Wind className="h-6 w-6 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Vent</p>
                        <p className="font-semibold">{Math.round(weatherData.current.wind_kph)} km/h {weatherData.current.wind_dir}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Droplets className="h-6 w-6 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Humidité</p>
                        <p className="font-semibold">{weatherData.current.humidity}%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CloudRain className="h-6 w-6 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Précipitations</p>
                        <p className="font-semibold">{weatherData.current.precip_mm} mm</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Forecast tabs */}
              {weatherData.forecast && (
                <Tabs defaultValue="daily" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="daily">Prévisions quotidiennes</TabsTrigger>
                    <TabsTrigger value="hourly">Prévisions horaires</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="daily" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                      {weatherData.forecast.forecastday.map(day => (
                        <Card key={day.date} className="overflow-hidden">
                          <CardHeader className="p-4 bg-gray-50">
                            <CardTitle className="text-center text-sm font-medium">
                              {formatDate(day.date)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 text-center">
                            <img 
                              src={`https:${day.day.condition.icon}`} 
                              alt={day.day.condition.text}
                              className="w-12 h-12 mx-auto"
                            />
                            <p className="text-sm text-gray-500 mt-2">{day.day.condition.text}</p>
                            <div className="flex justify-center items-center gap-2 mt-2">
                              <span className="font-bold">{Math.round(day.day.maxtemp_c)}°</span>
                              <span className="text-gray-400">{Math.round(day.day.mintemp_c)}°</span>
                            </div>
                            <p className="text-xs text-blue-500 mt-2">
                              <CloudRain className="inline h-3 w-3 mr-1" />
                              {day.day.daily_chance_of_rain}%
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="hourly">
                    <Card>
                      <CardHeader>
                        <CardTitle>Prévisions horaires</CardTitle>
                        <CardDescription>
                          Aujourd'hui - {formatDate(weatherData.forecast.forecastday[0].date)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <div className="inline-flex gap-4 pb-4">
                            {weatherData.forecast.forecastday[0].hour
                              .filter((_, index) => index % 3 === 0) // Show every 3 hours
                              .map(hour => (
                                <div key={hour.time} className="flex flex-col items-center w-20">
                                  <p className="text-sm font-medium">
                                    {new Date(hour.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  <img 
                                    src={`https:${hour.condition.icon}`}
                                    alt={hour.condition.text}
                                    className="w-10 h-10 my-2"
                                  />
                                  <p className="font-bold">{Math.round(hour.temp_c)}°C</p>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
              
              {/* Agricultural advice based on weather */}
              <Card>
                <CardHeader>
                  <CardTitle>Conseils agricoles</CardTitle>
                  <CardDescription>
                    Recommandations basées sur les conditions météorologiques actuelles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weatherData.current.precip_mm > 5 && (
                      <div className="flex items-start gap-3">
                        <CloudRain className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Fortes précipitations</h3>
                          <p className="text-sm text-gray-600">
                            Évitez l'irrigation aujourd'hui. Vérifiez vos systèmes de drainage pour éviter l'engorgement des cultures.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {weatherData.current.wind_kph > 20 && (
                      <div className="flex items-start gap-3">
                        <Wind className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Vents forts</h3>
                          <p className="text-sm text-gray-600">
                            Reportez les pulvérisations de pesticides ou d'engrais. Assurez-vous que les jeunes plants sont protégés.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {weatherData.current.temp_c > 30 && (
                      <div className="flex items-start gap-3">
                        <Thermometer className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Températures élevées</h3>
                          <p className="text-sm text-gray-600">
                            Augmentez l'arrosage et évitez de travailler aux heures les plus chaudes. Vérifiez que vos cultures ont suffisamment d'ombre.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {weatherData.current.temp_c < 5 && (
                      <div className="flex items-start gap-3">
                        <Snowflake className="h-5 w-5 text-blue-300 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Températures basses</h3>
                          <p className="text-sm text-gray-600">
                            Risque de gel. Protégez vos cultures fragiles avec des couvertures ou des systèmes de chauffage si possible.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {weatherData.current.humidity > 80 && (
                      <div className="flex items-start gap-3">
                        <Droplets className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Forte humidité</h3>
                          <p className="text-sm text-gray-600">
                            Surveillez l'apparition de maladies fongiques. Assurez une bonne circulation d'air autour des plantes.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {weatherData.current.uv > 8 && (
                      <div className="flex items-start gap-3">
                        <SunMedium className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Indice UV élevé</h3>
                          <p className="text-sm text-gray-600">
                            Protégez les travailleurs agricoles du soleil. Certaines cultures peuvent nécessiter un ombrage supplémentaire.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="text-center p-8">
              <div className="mb-6">
                <SunMedium className="h-16 w-16 mx-auto text-yellow-400" />
              </div>
              <CardTitle className="text-xl mb-2">Consultez les prévisions météo</CardTitle>
              <CardDescription className="max-w-md mx-auto mb-6">
                Recherchez un lieu ou utilisez votre position actuelle pour obtenir des prévisions météo précises et des conseils agricoles adaptés.
              </CardDescription>
              <Button onClick={getUserLocation} className="bg-agri-green-500 hover:bg-agri-green-600">
                <MapPin className="mr-2 h-4 w-4" />
                Utiliser ma position
              </Button>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Weather;
