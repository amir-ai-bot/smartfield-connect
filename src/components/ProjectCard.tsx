
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Sprout, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProjectData } from '@/types/dashboard';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export interface ProjectCardProps {
  project: ProjectData; // Using project prop
  showOwner?: boolean;
}

const ProjectCard = ({ project, showOwner = false }: ProjectCardProps) => {
  // Get project status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 w-full overflow-hidden">
        <img
          src={project.image || 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8'}
          alt={project.title || project.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold truncate">
            {project.title || project.name || 'Projet sans titre'}
          </h3>
          <Badge className={getStatusColor(project.status)}>
            {project.status === 'planning' && 'Planification'}
            {project.status === 'active' && 'Actif'}
            {project.status === 'completed' && 'Terminé'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <p className="text-gray-600 text-sm line-clamp-2 h-10">
          {project.description || 'Aucune description disponible.'}
        </p>
        
        {project.crop && (
          <div className="flex items-center text-sm text-gray-500">
            <Sprout className="h-4 w-4 mr-2" />
            <span>{project.crop}</span>
          </div>
        )}
        
        {project.location && (
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{project.location}</span>
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            {formatDate(project.startDate || project.start_date)}
            {(project.endDate || project.end_date) && ` - ${formatDate(project.endDate || project.end_date)}`}
          </span>
        </div>

        {(showOwner && project.user_name) && (
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <Avatar className="h-5 w-5 mr-2">
              <AvatarImage src={project.user_avatar} />
              <AvatarFallback>{project.user_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{project.user_name}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link to={`/projects/${project.id}`}>Voir le détail</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
