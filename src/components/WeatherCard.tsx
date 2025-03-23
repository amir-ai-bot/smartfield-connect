
import { Cloud, CloudRain, Sun, CloudSun, Wind, Thermometer } from 'lucide-react';

type WeatherCardProps = {
  date: string;
  day: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
};

const WeatherCard = ({ date, day, temp, humidity, windSpeed, condition }: WeatherCardProps) => {
  const getWeatherIcon = () => {
    switch (condition) {
      case 'sunny':
        return <Sun className="h-10 w-10 text-yellow-400" />;
      case 'cloudy':
        return <Cloud className="h-10 w-10 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="h-10 w-10 text-agri-blue-400" />;
      case 'partly-cloudy':
        return <CloudSun className="h-10 w-10 text-gray-500" />;
      default:
        return <Sun className="h-10 w-10 text-yellow-400" />;
    }
  };

  const getConditionText = () => {
    switch (condition) {
      case 'sunny':
        return 'Ensoleillé';
      case 'cloudy':
        return 'Nuageux';
      case 'rainy':
        return 'Pluvieux';
      case 'partly-cloudy':
        return 'Partiellement nuageux';
      default:
        return 'Ensoleillé';
    }
  };

  const getGradient = () => {
    switch (condition) {
      case 'sunny':
        return 'from-yellow-400 to-orange-300';
      case 'cloudy':
        return 'from-gray-400 to-gray-300';
      case 'rainy':
        return 'from-agri-blue-400 to-blue-300';
      case 'partly-cloudy':
        return 'from-agri-blue-300 to-gray-300';
      default:
        return 'from-yellow-400 to-orange-300';
    }
  };

  return (
    <div className="glass rounded-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
      <div className={`p-4 bg-gradient-to-br ${getGradient()} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">{day}</p>
            <p className="text-xs opacity-80">{date}</p>
          </div>
          {getWeatherIcon()}
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-800 font-semibold mb-3">{getConditionText()}</p>
        
        <div className="flex items-center space-x-1 text-gray-700 mb-2">
          <Thermometer className="h-4 w-4 text-agri-terra-400" />
          <span className="text-sm">{temp}°C</span>
        </div>
        
        <div className="flex items-center space-x-1 text-gray-700 mb-2">
          <Wind className="h-4 w-4 text-agri-blue-400" />
          <span className="text-sm">{windSpeed} km/h</span>
        </div>
        
        <div className="flex items-center space-x-1 text-gray-700">
          <CloudRain className="h-4 w-4 text-agri-blue-400" />
          <span className="text-sm">{humidity}% humidité</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
