
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Tractor } from 'lucide-react';
import { ProjectData } from '@/types/auth';

interface ProjectCardProps {
  project: ProjectData;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'active':
        return 'bg-green-500 hover:bg-green-600';
      case 'completed':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Helper function to get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning':
        return 'En planification';
      case 'active':
        return 'Actif';
      case 'completed':
        return 'Terminé';
      default:
        return 'Inconnu';
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative h-32 overflow-hidden">
        <img
          src={project.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=60'}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <Badge className={`absolute top-2 right-2 ${getStatusColor(project.status)}`}>
          {getStatusText(project.status)}
        </Badge>
        {project.isPublic && (
          <Badge className="absolute top-2 left-2 bg-purple-500 hover:bg-purple-600">
            Public
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-semibold">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {project.description || 'Aucune description'}
        </p>
        
        <div className="space-y-1 text-xs text-gray-500">
          {project.location && (
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{project.location}</span>
            </div>
          )}
          {project.crop && (
            <div className="flex items-center">
              <Tractor className="h-3.5 w-3.5 mr-1" />
              <span>{project.crop}</span>
            </div>
          )}
          {project.startDate && (
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>Début: {new Date(project.startDate).toLocaleDateString()}</span>
            </div>
          )}
          {project.user_name && (
            <div className="flex items-center">
              <User className="h-3.5 w-3.5 mr-1" />
              <span>{project.user_name}</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-2 border-t">
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-agri-green-500 h-1.5 rounded-full"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="ml-2 text-xs font-medium text-gray-500">{project.progress}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
