
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Export the type definition
export type ProjectCardProps = {
  id: string;
  title: string;
  crop: string;
  location: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: string | "active" | "completed" | "planning";
  image: string;
};

// Create and export the component
const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  crop,
  location,
  startDate,
  endDate,
  progress,
  status,
  image
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'bg-agri-green-400 hover:bg-agri-green-500';
      case 'completed': return 'bg-agri-blue-400 hover:bg-agri-blue-500';
      case 'planning': return 'bg-amber-400 hover:bg-amber-500';
      default: return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Complété';
      case 'planning': return 'Planification';
      default: return status;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-card-hover transition-shadow duration-300 h-full flex flex-col">
      <div className="relative h-48 w-full">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <Badge className={`absolute top-3 right-3 ${getStatusColor()}`}>
          {getStatusText()}
        </Badge>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-display text-lg font-semibold mb-1 text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mb-3">{location}</p>
        
        <div className="flex items-center mb-3">
          <span className="text-xs font-medium bg-agri-green-100 text-agri-green-800 py-1 px-2 rounded-full">
            {crop}
          </span>
        </div>
        
        <div className="mt-auto">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Période</span>
            <span className="font-medium text-gray-800">{startDate} - {endDate}</span>
          </div>
          
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progression</span>
            <span className="font-medium text-gray-800">{progress}%</span>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
