
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Trash2, Eye } from 'lucide-react';
import Farm from '@/components/icons/Farm'; // Fixed import
import { formatRelativeDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// ProjectData type definition
interface ProjectData {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  status: 'planning' | 'active' | 'completed';
  progress: number;
  crop: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProjectCardProps {
  project: ProjectData;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onDelete, 
  showActions = true 
}) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  useEffect(() => {
    // Reset confirmation state when project changes
    setIsConfirmingDelete(false);
    setIsDeleting(false);
  }, [project.id]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    
    try {
      setIsDeleting(true);
      await onDelete?.(project.id);
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleCardClick = () => {
    handleViewDetails();
  };

  // Get display name - fallback from title to name
  const displayName = project.title || project.name || 'Untitled Project';

  // Get status badge color
  const getStatusColor = () => {
    switch (project.status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = () => {
    switch (project.status) {
      case 'planning': return 'Planification';
      case 'active': return 'Actif';
      case 'completed': return 'Terminé';
      default: return project.status;
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {project.image ? (
        <div className="h-40 overflow-hidden">
          <img 
            src={project.image} 
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="h-40 bg-gray-100 flex items-center justify-center">
          <Farm />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">{displayName}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
              {getStatusLabel()}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {project.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {project.description}
          </p>
        )}
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progression</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5" />
          </div>
          
          {project.crop && (
            <div className="flex items-center text-sm text-gray-600">
              <Farm className="h-4 w-4 mr-1" />
              {project.crop}
            </div>
          )}
          
          {project.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              {project.location}
            </div>
          )}
          
          {project.startDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(project.startDate).toLocaleDateString()}
            </div>
          )}
          
          {project.created_at && (
            <div className="text-xs text-gray-500">
              Créé {formatRelativeDate(project.created_at)}
            </div>
          )}
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="pt-0 flex gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1"
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4 mr-2" />
            Voir détails
          </Button>
          
          {onDelete && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className={isConfirmingDelete ? "bg-red-50 text-red-500 border-red-200" : ""}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default ProjectCard;
