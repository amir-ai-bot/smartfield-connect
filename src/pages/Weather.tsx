
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WeatherCard from '@/components/WeatherCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  MapPin, 
  CloudSun, 
  Sunrise, 
  Sunset, 
  Wind, 
  Thermometer, 
  Droplets,
  Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getCurrentWeather, 
  getWeatherForecast,
  CurrentWeather, 
  ForecastDay
} from '@/services/weatherService';
import { toast } from 'sonner';

const weatherAlerts = [
  {
    id: 1,
    title: "Vague de chaleur",
    description: "Températures élevées attendues dans les prochains jours, assurez une irrigation supplémentaire.",
    severity: "high",
    date: "17 - 20 Juin",
  },
  {
    id: 2,
    title: "Vent fort",
    description: "Rafales de vent jusqu'à 40 km/h prévues le 19 Juin, sécurisez vos équipements.",
    severity: "medium",
    date: "19 Juin",
  },
  {
    id: 3,
    title: "Pluie légère",
    description: "Faibles précipitations prévues le 20 Juin, peut affecter les opérations de pulvérisation.",
    severity: "low",
    date: "20 Juin",
  }
];

const Weather = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Gafsa, Tunisie');
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const locationString = `${latitude},${longitude}`;
              
              const [weather, forecast] = await Promise.all([
                getCurrentWeather(locationString),
                getWeatherForecast(locationString)
              ]);
              
              setCurrentWeather(weather);
              setForecastData(forecast.daily);
              setCurrentLocation(weather.location);
            },
            async (error) => {
              console.error("Geolocation error:", error);
              const [weather, forecast] = await Promise.all([
                getCurrentWeather(), // Using default location
                getWeatherForecast()
              ]);
              
              setCurrentWeather(weather);
              setForecastData(forecast.daily);
              setCurrentLocation(weather.location);
            }
          );
        } else {
          const [weather, forecast] = await Promise.all([
            getCurrentWeather(), // Using default location
            getWeatherForecast()
          ]);
          
          setCurrentWeather(weather);
          setForecastData(forecast.daily);
          setCurrentLocation(weather.location);
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
        toast.error("Erreur lors de la récupération des données météo", {
          description: "Veuillez réessayer plus tard"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
    
    const intervalId = setInterval(() => {
      fetchWeatherData();
      toast.info("Données météo mises à jour", {
        description: `Dernière mise à jour: ${new Date().toLocaleTimeString()}`
      });
    }, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setIsLoading(true);
      try {
        const [weather, forecast] = await Promise.all([
          getCurrentWeather(searchLocation),
          getWeatherForecast(searchLocation)
        ]);
        
        setCurrentWeather(weather);
        setForecastData(forecast.daily);
        setCurrentLocation(weather.location);
        setSearchLocation('');
        
        toast.success("Localisation mise à jour", {
          description: `Données météo pour ${weather.location}`
        });
      } catch (error) {
        console.error("Error in location search:", error);
        toast.error("Localisation non trouvée", {
          description: "Veuillez essayer un autre lieu"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const getWeatherIcon = () => {
    if (!currentWeather) return <CloudSun className="h-12 w-12" />;
    
    if (currentWeather.condition.text.toLowerCase().includes('soleil') || 
        currentWeather.condition.text.toLowerCase().includes('sunny') ||
        currentWeather.condition.text.toLowerCase().includes('clear')) {
      return <CloudSun className="h-12 w-12" />;
    }
    
    if (currentWeather.condition.text.toLowerCase().includes('pluie') || 
        currentWeather.condition.text.toLowerCase().includes('rain')) {
      return <Droplets className="h-12 w-12" />;
    }
    
    if (currentWeather.condition.text.toLowerCase().includes('nuage') || 
        currentWeather.condition.text.toLowerCase().includes('cloud')) {
      return <CloudSun className="h-12 w-12" />;
    }
    
    return <CloudSun className="h-12 w-12" />;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Météo agricole</h1>
            <p className="text-gray-600">Prévisions et alertes météorologiques pour optimiser vos activités</p>
          </div>
          
          <form onSubmit={handleLocationSearch} className="mt-4 md:mt-0 flex w-full md:w-auto">
            <div className="relative flex-grow mr-2">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Chercher un lieu..." 
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10 border-gray-200 pr-4 flex-grow"
              />
            </div>
            <Button type="submit" variant="outline" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
        </div>
        
        <Card className="shadow-card mb-8 overflow-hidden animate-slide-up">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-agri-blue-500" />
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-agri-blue-400 to-agri-blue-600 text-white p-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <div className="flex items-center mb-2">
                      <MapPin className="h-5 w-5 mr-2" />
                      <h2 className="font-display text-xl font-semibold">{currentLocation}</h2>
                    </div>
                    <p className="text-blue-100">Aujourd'hui, {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  
                  <div className="flex items-center mt-4 md:mt-0">
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-4 mr-6">
                      {getWeatherIcon()}
                    </div>
                    
                    <div className="text-center">
                      <p className="text-5xl font-semibold mb-1">{currentWeather?.temperature || currentWeather?.temp_c}°C</p>
                      <p className="text-blue-100">{currentWeather?.condition.text}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <Thermometer className="h-8 w-8 p-1.5 bg-red-100 text-red-500 rounded-lg mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Ressenti</p>
                      <p className="font-medium">{currentWeather?.feelsLike || (currentWeather?.temperature ? currentWeather.temperature + 2 : "--")}°C</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Wind className="h-8 w-8 p-1.5 bg-blue-100 text-blue-500 rounded-lg mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Vent</p>
                      <p className="font-medium">{currentWeather?.wind_speed || "--"} km/h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Droplets className="h-8 w-8 p-1.5 bg-blue-100 text-blue-500 rounded-lg mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Humidité</p>
                      <p className="font-medium">{currentWeather?.humidity}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex">
                      <Sunrise className="h-8 w-8 p-1.5 bg-yellow-100 text-yellow-500 rounded-lg mr-3" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lever/Coucher</p>
                      <p className="font-medium">{currentWeather?.sunrise || "06:30"} / {currentWeather?.sunset || "18:45"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
        
        <Tabs defaultValue="forecast" className="mb-8 animate-slide-up">
          <TabsList className="w-full sm:w-80 mb-6">
            <TabsTrigger value="forecast" className="flex-1">Prévisions</TabsTrigger>
            <TabsTrigger value="alerts" className="flex-1">Alertes</TabsTrigger>
            <TabsTrigger value="irrigation" className="flex-1">Irrigation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="forecast">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-agri-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {forecastData.map((day, index) => (
                  <div 
                    key={index} 
                    className="animate-slide-up" 
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <WeatherCard 
                      date={day.date}
                      day={day.day_name || ''}
                      temp={day.max_temp}
                      humidity={day.humidity}
                      windSpeed={day.wind_speed}
                      condition={day.condition.toLowerCase().includes('soleil') || day.condition.toLowerCase().includes('sunny') 
                         ? 'sunny' 
                         : day.condition.toLowerCase().includes('nuage') || day.condition.toLowerCase().includes('cloud') 
                           ? 'cloudy' 
                           : day.condition.toLowerCase().includes('pluie') || day.condition.toLowerCase().includes('rain')
                             ? 'rainy'
                             : 'partly-cloudy'}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="alerts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {weatherAlerts.map((alert) => (
                <Card key={alert.id} className="shadow-card animate-slide-up">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-display flex items-center">
                        <span 
                          className={`h-2.5 w-2.5 rounded-full mr-2 ${
                            alert.severity === 'high' 
                              ? 'bg-red-500' 
                              : alert.severity === 'medium' 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                        />
                        {alert.title}
                      </CardTitle>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {alert.date}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{alert.description}</p>
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                      >
                        Ignorer
                      </Button>
                      <Button 
                        size="sm" 
                        className={
                          alert.severity === 'high' 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : alert.severity === 'medium' 
                              ? 'bg-yellow-500 hover:bg-yellow-600' 
                              : 'bg-green-600 hover:bg-green-700'
                        }
                      >
                        Voir détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="irrigation">
            <Card className="shadow-card animate-slide-up">
              <CardHeader>
                <CardTitle className="text-xl font-display">Recommandations d'irrigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <h3 className="font-semibold mb-2">Oliveraie Secteur Nord</h3>
                      <div className="flex items-center text-agri-green-600 mb-4">
                        <Droplets className="h-5 w-5 mr-2" />
                        <span>Irrigation recommandée</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Les conditions actuelles suggèrent un besoin d'irrigation dans les 24 prochaines heures.
                      </p>
                      <Button size="sm" className="w-full bg-agri-green-500 hover:bg-agri-green-600">
                        Programmer
                      </Button>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <h3 className="font-semibold mb-2">Palmeraie El Oasis</h3>
                      <div className="flex items-center text-gray-600 mb-4">
                        <Droplets className="h-5 w-5 mr-2" />
                        <span>Irrigation non nécessaire</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Les niveaux d'humidité du sol sont suffisants pour les 3 prochains jours.
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Vérifier l'humidité
                      </Button>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <h3 className="font-semibold mb-2">Culture de Pistaches</h3>
                      <div className="flex items-center text-yellow-600 mb-4">
                        <Droplets className="h-5 w-5 mr-2" />
                        <span>Irrigation bientôt nécessaire</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Une irrigation sera nécessaire dans les 48 prochaines heures.
                      </p>
                      <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600">
                        Planifier
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-semibold mb-4">Conseils d'irrigation basés sur la météo</h3>
                    <ul className="space-y-3">
                      <li className="flex">
                        <span className="h-6 w-6 rounded-full bg-agri-blue-100 text-agri-blue-600 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                        <p className="text-gray-700">Les températures élevées prévues augmentent les besoins en eau. Considérez une irrigation matinale pour les cultures sensibles.</p>
                      </li>
                      <li className="flex">
                        <span className="h-6 w-6 rounded-full bg-agri-blue-100 text-agri-blue-600 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                        <p className="text-gray-700">Des vents de {currentWeather?.wind_speed || 12} km/h sont prévus. Évitez l'irrigation par aspersion pendant les heures de vent maximal.</p>
                      </li>
                      <li className="flex">
                        <span className="h-6 w-6 rounded-full bg-agri-blue-100 text-agri-blue-600 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                        <p className="text-gray-700">La pluie légère prévue jeudi 20 juin pourrait réduire les besoins d'irrigation ce jour-là.</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card className="shadow-card animate-slide-up">
          <CardHeader>
            <CardTitle className="text-xl font-display">Impact météorologique sur vos cultures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Prévisions à long terme</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-lg bg-agri-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <Thermometer className="h-5 w-5 text-agri-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Température</h4>
                      <p className="text-sm text-gray-600">
                        Tendance au réchauffement avec des températures moyennes de {forecastData.length > 0 ? `${Math.min(...forecastData.map(d => d.min_temp))}-${Math.max(...forecastData.map(d => d.max_temp))}°C` : '30-35°C'} pour les 2 prochaines semaines.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-lg bg-agri-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <Droplets className="h-5 w-5 text-agri-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Précipitations</h4>
                      <p className="text-sm text-gray-600">
                        Faibles précipitations attendues, avec une probabilité de pluie légère vers la fin du mois.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <Wind className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Vent</h4>
                      <p className="text-sm text-gray-600">
                        Vents modérés avec des rafales occasionnelles, particulièrement en milieu de semaine.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Recommandations pour vos cultures</h3>
                <ul className="space-y-3">
                  <li className="flex">
                    <div className="h-6 w-6 rounded-full bg-agri-green-100 text-agri-green-600 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-gray-700">Les oliviers nécessiteront une irrigation régulière due aux températures élevées.</p>
                  </li>
                  <li className="flex">
                    <div className="h-6 w-6 rounded-full bg-agri-green-100 text-agri-green-600 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-gray-700">Protégez les jeunes plants des vents prévus le 19 juin.</p>
                  </li>
                  <li className="flex">
                    <div className="h-6 w-6 rounded-full bg-agri-green-100 text-agri-green-600 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-gray-700">Planifiez les opérations de pulvérisation avant le 20 juin pour éviter la pluie prévue.</p>
                  </li>
                  <li className="flex">
                    <div className="h-6 w-6 rounded-full bg-agri-green-100 text-agri-green-600 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-gray-700">Envisagez un paillage supplémentaire pour les cultures sensibles à la chaleur.</p>
                  </li>
                </ul>
                
                <Button className="mt-6 w-full">Voir toutes les recommandations</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Weather;
