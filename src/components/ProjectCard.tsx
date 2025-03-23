
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Calendar, Sprout, MapPin, Droplet } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

type ProjectCardProps = {
  id: string;
  title: string;
  crop: string;
  location: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'active' | 'completed' | 'planning';
  image: string;
};

const ProjectCard = ({ 
  id, title, crop, location, startDate, endDate, progress, status, image 
}: ProjectCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'completed':
        return 'Complété';
      case 'planning':
        return 'Planification';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
      <div className="relative h-40 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div 
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
        >
          {getStatusText()}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white rounded-full"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display text-lg font-semibold leading-tight">
            {title}
          </h3>
          <Badge variant="outline" className="bg-agri-green-50 text-agri-green-700 border-agri-green-200 ml-2">
            {crop}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm">{location}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm">{startDate} - {endDate}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Sprout className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm">Progression: {progress}%</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-2 bg-gray-100 rounded-full mb-4">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-agri-green-400 to-agri-blue-400 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="pt-3 border-t border-gray-100 flex justify-between">
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-agri-green-500">
            <Droplet className="h-4 w-4 mr-1" /> Irrigation
          </Button>
          
          <Button asChild variant="ghost" size="sm" className="text-agri-blue-500 hover:text-agri-blue-600 hover:bg-agri-blue-50">
            <Link to={`/projects/${id}`}>
              Voir détails
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
