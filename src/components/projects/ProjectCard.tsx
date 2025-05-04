import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, MapPin, Sprout } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProjectData } from '@/types/dashboard';
import { LoadingImage } from '@/components/ui/LoadingImage';

interface ProjectCardProps {
  project: ProjectData;
  onClick?: () => void;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, className }) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (project.created_at) {
      const interval = setInterval(() => {
        setTimeAgo(formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: fr }));
      }, 60000); // Update every minute

      // Initial update
      setTimeAgo(formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: fr }));

      return () => clearInterval(interval); // Clear interval on unmount
    }
  }, [project.created_at]);

  return (
    <Card className={`hover:shadow-md transition-all duration-200 cursor-pointer ${className}`} onClick={onClick}>
      <div className="relative">
        {project.image ? (
          <LoadingImage
            src={project.image}
            alt={project.title}
            className="w-full h-40 object-cover rounded-t-md"
            fallbackSrc="https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          />
        ) : (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-t-md">
            <Sprout className="h-10 w-10 text-gray-400" />
          </div>
        )}
        <Badge className="absolute top-2 left-2">{project.status}</Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{project.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{project.description || 'Pas de description'}</p>
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-1.5" />
          {project.location}
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4 mr-1.5" />
          {project.startDate || project.start_date ? new Date(project.startDate || project.start_date || '').toLocaleDateString() : 'Date inconnue'}
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1.5" />
          Mis à jour {timeAgo}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
