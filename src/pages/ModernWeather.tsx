import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SimpleNavbar from '@/components/SimpleNavbar';
import Footer from '@/components/Footer';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudSun, 
  Sun, 
  Droplets, 
  Wind, 
  Thermometer, 
  MapPin, 
  Search, 
  Navigation, 
  Calendar, 
  ArrowRight, 
  Leaf, 
  Umbrella, 
  Sunrise, 
  Sunset
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchWeatherData } from '@/services/weatherService';
import { locationService } from '@/services/locationService';
import { WeatherData } from '@/types/dashboard';
import { toast } from 'sonner';

const ModernWeather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'forecast' | 'agriculture'>('today');

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Get current location and fetch weather data
  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const location = await locationService.getCurrentLocation();
      
      if (!location) {
        setError("Impossible d'accéder à votre position. Veuillez autoriser l'accès à la géolocalisation.");
        setIsLoading(false);
        return;
      }
      
      const data = await fetchWeatherData(null, {
        lat: location.latitude,
        lon: location.longitude
      });
      
      setWeatherData(data);
    } catch (error: any) {
      console.error('Error getting location:', error);
      setError(error.message || "Une erreur s'est produite");
      toast.error("Veuillez autoriser l'accès à votre position");
    } finally {
      setIsLoading(false);
    }
  };

  // Search for weather by location name
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchWeatherData(searchTerm);
      setWeatherData(data);
      setSearchTerm('');
    } catch (error: any) {
      console.error('Error searching weather:', error);
      setError(error.message || 'Une erreur est survenue');
      toast.error('Impossible de trouver cette localisation');
    } finally {
      setIsLoading(false);
    }
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const conditionLower = condition?.toLowerCase() || '';
    const sizeClass = {
      sm: "w-6 h-6",
      md: "w-12 h-12",
      lg: "w-24 h-24"
    };
    
    if (conditionLower.includes('pluie') || conditionLower.includes('averse')) {
      return <CloudRain className={`${sizeClass[size]} text-blue-500`} />;
    }
    if (conditionLower.includes('neige')) {
      return <CloudSnow className={`${sizeClass[size]} text-blue-300`} />;
    }
    if (conditionLower.includes('nuage') || conditionLower.includes('couvert')) {
      return <Cloud className={`${sizeClass[size]} text-gray-400`} />;
    }
    if (conditionLower.includes('partiel')) {
      return <CloudSun className={`${sizeClass[size]} text-gray-500`} />;
    }
    if (conditionLower.includes('soleil') || conditionLower.includes('clair') || conditionLower.includes('ensoleillé')) {
      return <Sun className={`${sizeClass[size]} text-yellow-500`} />;
    }
    
    // Default icon
    return <Cloud className={`${sizeClass[size]} text-gray-400`} />;
  };

  // Get background gradient based on weather condition
  const getBackgroundGradient = () => {
    if (!weatherData) return 'from-blue-600 to-blue-400';
    
    const condition = weatherData.condition.toLowerCase();
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 20;
    
    if (isNight) return 'from-indigo-900 to-blue-900';
    if (condition.includes('pluie')) return 'from-blue-700 to-blue-500';
    if (condition.includes('nuage')) return 'from-blue-500 to-blue-300';
    if (condition.includes('soleil') || condition.includes('clair') || condition.includes('ensoleillé')) {
      return 'from-blue-400 to-cyan-300';
    }
    
    return 'from-blue-600 to-blue-400';
  };

  // Get agricultural advice based on weather
  const getAgricultureAdvice = () => {
    if (!weatherData) return [];
    
    const advice = [];
    
    // Irrigation advice
    if (weatherData.humidity < 40) {
      advice.push({
        title: "Irrigation",
        icon: <Droplets className="h-6 w-6 text-blue-500" />,
        text: "Conditions sèches. Augmentez l'irrigation pour compenser le manque d'humidité."
      });
    } else if (weatherData.humidity > 70) {
      advice.push({
        title: "Irrigation",
        icon: <Droplets className="h-6 w-6 text-blue-500" />,
        text: "Humidité élevée. Réduisez l'irrigation pour éviter l'excès d'eau et les maladies fongiques."
      });
    } else {
      advice.push({
        title: "Irrigation",
        icon: <Droplets className="h-6 w-6 text-blue-500" />,
        text: "Conditions d'humidité optimales. Maintenez l'irrigation normale."
      });
    }
    
    // Temperature advice
    if (weatherData.temperature > 30) {
      advice.push({
        title: "Protection thermique",
        icon: <Thermometer className="h-6 w-6 text-red-500" />,
        text: "Températures élevées. Protégez les cultures sensibles à la chaleur avec de l'ombrage."
      });
    } else if (weatherData.temperature < 10) {
      advice.push({
        title: "Protection contre le froid",
        icon: <Thermometer className="h-6 w-6 text-blue-500" />,
        text: "Températures basses. Protégez les cultures sensibles au froid avec des couvertures."
      });
    }
    
    // Wind advice
    if (weatherData.windSpeed > 20) {
      advice.push({
        title: "Protection contre le vent",
        icon: <Wind className="h-6 w-6 text-blue-500" />,
        text: "Vent fort. Installez des brise-vent temporaires pour protéger les cultures fragiles."
      });
    }
    
    // Rain advice
    if (weatherData.condition.toLowerCase().includes('pluie')) {
      advice.push({
        title: "Protection contre les maladies",
        icon: <Umbrella className="h-6 w-6 text-purple-500" />,
        text: "Conditions humides. Surveillez les signes de maladies fongiques et appliquez des traitements préventifs si nécessaire."
      });
    }
    
    // Add a general advice if we don't have many specific ones
    if (advice.length < 3) {
      advice.push({
        title: "Planification des cultures",
        icon: <Leaf className="h-6 w-6 text-green-500" />,
        text: "Conditions favorables pour la plupart des activités agricoles. Profitez-en pour planifier vos prochaines cultures."
      });
    }
    
    return advice;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SimpleNavbar />
      
      <main className="flex-grow pt-20">
        {/* Hero section with gradient background */}
        <div className={`bg-gradient-to-br ${getBackgroundGradient()} text-white py-12`}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
                Météo pour l'Agriculture
              </h1>
              
              {/* Search form */}
              <div className="max-w-md mx-auto mb-8">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Rechercher une ville..."
                      className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button 
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </div>
                  <button 
                    type="button"
                    onClick={getCurrentLocation}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-lg transition-colors"
                    title="Utiliser ma position"
                  >
                    <Navigation className="h-5 w-5" />
                  </button>
                </form>
              </div>
              
              {/* Current weather display */}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : error ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <p className="text-xl font-medium mb-4">{error}</p>
                  <button
                    onClick={getCurrentLocation}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              ) : weatherData && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="h-5 w-5 mr-1" />
                    <h2 className="text-xl font-medium">{weatherData.location}</h2>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
                    <div className="flex flex-col items-center">
                      {getWeatherIcon(weatherData.condition, 'lg')}
                      <p className="mt-2 text-xl">{weatherData.condition}</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-7xl font-bold">{weatherData.temperature}°</div>
                      <p className="text-white/80">Ressenti: {weatherData.feelsLike}°</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Droplets className="h-6 w-6 mr-2 text-blue-200" />
                        <div>
                          <p className="text-sm text-white/80">Humidité</p>
                          <p className="font-medium">{weatherData.humidity}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Wind className="h-6 w-6 mr-2 text-blue-200" />
                        <div>
                          <p className="text-sm text-white/80">Vent</p>
                          <p className="font-medium">{weatherData.windSpeed} km/h</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Sunrise className="h-6 w-6 mr-2 text-yellow-200" />
                        <div>
                          <p className="text-sm text-white/80">Lever</p>
                          <p className="font-medium">06:45</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Sunset className="h-6 w-6 mr-2 text-orange-200" />
                        <div>
                          <p className="text-sm text-white/80">Coucher</p>
                          <p className="font-medium">20:15</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs navigation */}
        {!isLoading && !error && weatherData && (
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-8">
                <div className="inline-flex bg-white rounded-lg p-1 shadow-md">
                  <button
                    onClick={() => setActiveTab('today')}
                    className={`px-4 py-2 rounded-md ${activeTab === 'today' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    onClick={() => setActiveTab('forecast')}
                    className={`px-4 py-2 rounded-md ${activeTab === 'forecast' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Prévisions
                  </button>
                  <button
                    onClick={() => setActiveTab('agriculture')}
                    className={`px-4 py-2 rounded-md ${activeTab === 'agriculture' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Agriculture
                  </button>
                </div>
              </div>
              
              {/* Tab content */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {activeTab === 'today' && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Détails météorologiques</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <Thermometer className="h-8 w-8 mx-auto mb-2 text-red-500" />
                        <p className="text-sm text-gray-500">Température</p>
                        <p className="text-xl font-bold text-gray-800">{weatherData.temperature}°C</p>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <Thermometer className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                        <p className="text-sm text-gray-500">Ressenti</p>
                        <p className="text-xl font-bold text-gray-800">{weatherData.feelsLike}°C</p>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-sm text-gray-500">Humidité</p>
                        <p className="text-xl font-bold text-gray-800">{weatherData.humidity}%</p>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <Wind className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-sm text-gray-500">Vent</p>
                        <p className="text-xl font-bold text-gray-800">{weatherData.windSpeed} km/h</p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                      Prévisions du jour
                    </h3>
                    
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {['Matin', 'Midi', 'Après-midi', 'Soir'].map((time, index) => (
                        <div key={time} className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-sm font-medium text-gray-700 mb-2">{time}</p>
                          {getWeatherIcon(weatherData.condition, 'sm')}
                          <p className="text-lg font-bold mt-1">
                            {Math.round(weatherData.temperature - 2 + index * 2)}°C
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Conseil du jour</h3>
                      <p className="text-gray-700">
                        {weatherData.condition.toLowerCase().includes('pluie') 
                          ? "Risque de précipitations aujourd'hui. Planifiez vos activités agricoles en conséquence et surveillez les signes de maladies fongiques."
                          : weatherData.temperature > 30
                            ? "Températures élevées aujourd'hui. Assurez-vous que vos cultures sont bien irriguées et protégées du soleil intense."
                            : "Conditions favorables pour la plupart des activités agricoles. Profitez-en pour effectuer vos travaux extérieurs."}
                      </p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'forecast' && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Prévisions sur 5 jours</h2>
                    
                    <div className="space-y-4">
                      {weatherData.forecast.map((day, index) => (
                        <div key={day.day} className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center">
                              <div className="bg-blue-50 p-2 rounded-full mr-4">
                                {getWeatherIcon(day.condition, 'sm')}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{day.day}</p>
                                <p className="text-sm text-gray-500">{day.condition}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">{day.temperature}°</p>
                              <p className="text-sm text-gray-500">
                                {Math.round(day.temperature - 3)}° / {Math.round(day.temperature + 2)}°
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 px-4 py-3 grid grid-cols-3 gap-4">
                            <div className="flex items-center">
                              <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                              <div>
                                <p className="text-xs text-gray-500">Humidité</p>
                                <p className="font-medium">{Math.max(30, Math.min(90, weatherData.humidity + (index * 5) - 10))}%</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <Wind className="h-5 w-5 mr-2 text-blue-500" />
                              <div>
                                <p className="text-xs text-gray-500">Vent</p>
                                <p className="font-medium">{Math.max(5, Math.min(30, weatherData.windSpeed + (index * 2) - 4))} km/h</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <Umbrella className="h-5 w-5 mr-2 text-purple-500" />
                              <div>
                                <p className="text-xs text-gray-500">Précip.</p>
                                <p className="font-medium">{Math.floor(Math.random() * 30)}%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'agriculture' && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Conseils agricoles</h2>
                    
                    <div className="space-y-6">
                      {getAgricultureAdvice().map((advice, index) => (
                        <div key={index} className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                          <div className="flex items-start">
                            <div className="bg-green-50 p-3 rounded-full mr-4 flex-shrink-0">
                              {advice.icon}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 mb-1">{advice.title}</h3>
                              <p className="text-gray-700">{advice.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                          <Leaf className="h-5 w-5 mr-2 text-green-500" />
                          Calendrier agricole
                        </h3>
                        <p className="text-gray-700 mb-3">
                          Activités agricoles recommandées pour cette période :
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-500" />
                            <span>Préparation des sols pour les cultures d'automne</span>
                          </li>
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-500" />
                            <span>Récolte des cultures d'été</span>
                          </li>
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-500" />
                            <span>Semis des cultures d'hiver</span>
                          </li>
                          <li className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-500" />
                            <span>Taille des arbres fruitiers</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ModernWeather;
