import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SimpleNavbar from '@/components/SimpleNavbar';
import Footer from '@/components/Footer';
import { Cloud, CloudRain, Sun, Droplets, Wind, Thermometer } from 'lucide-react';

const WeatherPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Function to handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would fetch weather data for the searched location
    console.log('Searching for:', searchTerm);
    // For now, we'll just clear the search field
    setSearchTerm('');
  };

  // Function to get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'ensoleillé':
        return <Sun className="h-12 w-12 text-yellow-500" />;
      case 'pluie':
        return <CloudRain className="h-12 w-12 text-blue-500" />;
      default:
        return <Cloud className="h-12 w-12 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleNavbar />
      <div className="flex-grow pt-20 bg-gradient-to-b from-blue-500 to-blue-400 flex items-center justify-center p-4">
        <div className="bg-white text-black p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6">Météo</h1>

          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une ville..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-1 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2">
              {getWeatherIcon('ensoleillé')}
            </div>
            <div className="text-6xl font-bold text-blue-500">21°C</div>
            <p className="text-gray-500 mt-2">Paris, France</p>
            <p className="text-gray-700 mt-1">Ensoleillé</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center bg-blue-50 p-3 rounded-lg">
              <Droplets className="h-6 w-6 mx-auto mb-1 text-blue-500" />
              <p className="text-gray-500 text-sm">Humidité</p>
              <p className="font-bold">65%</p>
            </div>
            <div className="text-center bg-blue-50 p-3 rounded-lg">
              <Wind className="h-6 w-6 mx-auto mb-1 text-blue-500" />
              <p className="text-gray-500 text-sm">Vent</p>
              <p className="font-bold">12 km/h</p>
            </div>
            <div className="text-center bg-blue-50 p-3 rounded-lg">
              <Thermometer className="h-6 w-6 mx-auto mb-1 text-orange-500" />
              <p className="text-gray-500 text-sm">Ressenti</p>
              <p className="font-bold">23°C</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="font-bold mb-4">Prévisions sur 5 jours</h2>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-xs font-medium">Lun</p>
                <Sun className="h-6 w-6 mx-auto my-1 text-yellow-500" />
                <p className="font-bold">23°</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-xs font-medium">Mar</p>
                <Sun className="h-6 w-6 mx-auto my-1 text-yellow-500" />
                <p className="font-bold">25°</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-xs font-medium">Mer</p>
                <Cloud className="h-6 w-6 mx-auto my-1 text-gray-400" />
                <p className="font-bold">22°</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-xs font-medium">Jeu</p>
                <CloudRain className="h-6 w-6 mx-auto my-1 text-blue-500" />
                <p className="font-bold">20°</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-xs font-medium">Ven</p>
                <CloudRain className="h-6 w-6 mx-auto my-1 text-blue-500" />
                <p className="font-bold">19°</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center space-y-2">
            <div>
              <Link to="/" className="text-blue-500 hover:underline">
                Retour à l'accueil
              </Link>
            </div>
            <div>
              <a href="/meteo" className="text-green-500 hover:underline">
                Direct Link to Meteo
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WeatherPage;
