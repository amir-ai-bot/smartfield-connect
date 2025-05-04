
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  MapPin, 
  Trash2, 
  Edit, 
  Eye, 
  Lock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectData } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteProject } from '@/services/projectService';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

interface ProjectCardProps {
  project: ProjectData;
  isOwner?: boolean;
  onDeleted?: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  isOwner = false,
  onDeleted 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  const handleView = () => {
    navigate(`/projects/${project.id}`);
  };
  
  const handleEdit = () => {
    navigate(`/projects/${project.id}/edit`);
  };
  
  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
      if (onDeleted) onDeleted(project.id);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };
  
  // Format dates for display
  const startDate = project.startDate || project.start_date;
  const endDate = project.endDate || project.end_date;
  
  const formattedStartDate = startDate ? 
    format(parseISO(startDate), 'dd/MM/yyyy') : 'Non définie';
    
  const formattedEndDate = endDate ? 
    format(parseISO(endDate), 'dd/MM/yyyy') : 'Non définie';
  
  // Get status badge color
  const statusColors = {
    'planning': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    'active': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
    'completed': 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  };
  
  const statusLabels = {
    'planning': 'Planification',
    'active': 'Actif',
    'completed': 'Terminé'
  };
  
  const statusClass = statusColors[project.status] || '';
  const statusLabel = statusLabels[project.status] || project.status;
  
  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative h-40">
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 flex space-x-2">
            <Badge className={statusClass}>{statusLabel}</Badge>
            {(project.is_public || project.isPublic) ? 
              <Badge variant="outline" className="bg-white">
                <Eye className="h-3 w-3 mr-1" /> Public
              </Badge> :
              <Badge variant="outline" className="bg-white">
                <Lock className="h-3 w-3 mr-1" /> Privé
              </Badge>
            }
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg line-clamp-2">{project.title || project.name}</h3>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {project.location || 'Emplacement non spécifié'}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow">
          {project.description ? (
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">{project.description}</p>
          ) : (
            <p className="text-sm text-gray-400 italic mb-3">Aucune description</p>
          )}
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <p className="font-medium">Type</p>
              <p>{project.crop || project.crop_type || 'Non spécifié'}</p>
            </div>
            <div>
              <p className="font-medium">Progression</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{width: `${project.progress || 0}%`}}
                />
              </div>
            </div>
            <div>
              <p className="font-medium flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Début
              </p>
              <p>{formattedStartDate}</p>
            </div>
            <div>
              <p className="font-medium flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Fin
              </p>
              <p>{formattedEndDate}</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-3">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage 
                  src={project.creator_avatar || project.user_avatar} 
                  alt={project.creator_name || project.user_name || ''} 
                />
                <AvatarFallback>
                  {(project.creator_name || project.user_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500">
                {project.creator_name || project.user_name || 'Utilisateur'}
              </span>
            </div>
            
            <div className="flex space-x-2">
              {isOwner && (
                <>
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Éditer</span>
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => setShowDeleteAlert(true)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
                </>
              )}
              <Button size="sm" onClick={handleView}>Voir</Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Le projet sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectCard;
