
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, Edit, Trash2, Eye, Lock } from "lucide-react";
import { Farm } from "@/components/icons/Farm";
import { Link, useNavigate } from 'react-router-dom';
import { formatRelativeDate } from '@/lib/utils';
import { ProjectData } from '@/types/auth';
import { deleteProject } from '@/services/projectService';
import { toast } from 'sonner';
import { LoadingImage } from '@/components/ui/LoadingImage';

interface ProjectCardProps {
  project: ProjectData;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onDelete,
  showActions = true 
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleView = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce projet "${project.title}"?`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      toast.success("Projet supprimé avec succès");
      
      if (onDelete) {
        onDelete(project.id);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error);
      toast.error("Erreur lors de la suppression du projet");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="secondary">Planification</Badge>;
      case 'active':
        return <Badge variant="success">Actif</Badge>;
      case 'completed':
        return <Badge variant="outline">Terminé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="h-48 relative">
        <LoadingImage
          src={project.image || '/images/default-project.jpg'}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {getStatusBadge(project.status)}
          
          {(project.is_public || project.isPublic) && (
            <Badge variant="info">Public</Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold truncate">{project.title}</h3>
          {project.progress !== undefined && (
            <div className="bg-gray-100 rounded-full h-2 w-20 overflow-hidden">
              <div 
                className="bg-green-500 h-full" 
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pb-2">
        {project.description && (
          <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          {project.crop && (
            <div className="flex items-center text-xs text-gray-600">
              <Farm className="h-3.5 w-3.5 mr-1 text-green-600" />
              {project.crop_type ? `${project.crop} (${project.crop_type})` : project.crop}
            </div>
          )}
          
          {project.location && (
            <div className="flex items-center text-xs text-gray-600">
              <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
              {project.location}
            </div>
          )}
          
          {(project.startDate || project.start_date) && (
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="h-3.5 w-3.5 mr-1 text-blue-600" />
              {formatRelativeDate(project.startDate || project.start_date || '')}
            </div>
          )}
          
          {(project.creator_name || project.user_name) && (
            <div className="flex items-center text-xs text-gray-600">
              <User className="h-3.5 w-3.5 mr-1 text-purple-600" />
              {project.creator_name || project.user_name || 'Anonymous'}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        {showActions && (
          <div className="flex space-x-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleView}
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEdit}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Modifier
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500 hover:text-red-700 flex-1"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? '...' : 'Supprimer'}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
