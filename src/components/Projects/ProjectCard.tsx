
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingImage } from '../ui/LoadingImage';

interface ProjectCardProps {
  id: string;
  title: string;
  crop: string;
  image?: string;
  location?: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  status: 'planning' | 'active' | 'completed';
  creatorName?: string;
  creatorAvatar?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  crop,
  image,
  location,
  progress = 0,
  startDate,
  endDate,
  status,
  creatorName,
  creatorAvatar
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'planning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'planning': return 'Planification';
      case 'active': return 'Actif';
      case 'completed': return 'Complété';
      default: return 'Inconnu';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 overflow-hidden bg-gray-100">
        {image ? (
          <LoadingImage
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            fallbackSrc="https://images.unsplash.com/photo-1516267126728-e517143465af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Pas d'image</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-lg line-clamp-1">{title}</h3>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              {crop && (
                <Badge variant="outline" className="mr-1">
                  {crop}
                </Badge>
              )}
              <Badge className={`${getStatusColor()} border`}>
                {getStatusText()}
              </Badge>
            </div>
          </div>
          
          {creatorAvatar && (
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <LoadingImage
                src={creatorAvatar}
                alt={creatorName || "Project Creator"}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        
        {location && (
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{location}</span>
          </div>
        )}
        
        {startDate && endDate && (
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{startDate.split('T')[0]} - {endDate.split('T')[0]}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0">
        <div className="w-full">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-500">Progression</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardFooter>
      
      <Link 
        to={`/projects/${id}`} 
        className="absolute inset-0 w-full h-full z-10"
        aria-label={`Voir les détails de ${title}`}
      />
    </Card>
  );
};

export default ProjectCard;
