import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin, Pencil, Share2, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getProject, getProjects as getPublicProjects } from '@/services/projectService';
import { ProjectData } from '@/types/auth';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteProject } from '@/services/projectService';
import ProjectForm from '@/components/Projects/ProjectForm';
import { useLanguage } from '@/contexts/LanguageContext';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [relatedProjects, setRelatedProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    if (!id) return;
    
    const loadProject = async () => {
      setLoading(true);
      try {
        const projectData = await getProject(id);
        if (projectData) {
          setProject(projectData);
          document.title = `${projectData.title} | AgriSmart`;
          
          // Check if current user is the owner
          if (user && user.id === projectData.user_id) {
            setIsOwner(true);
          }
          
          // Load related projects (same crop type)
          if (projectData.crop) {
            const publicProjects = await getPublicProjects();
            const related = publicProjects
              .filter(p => p.crop === projectData.crop && p.id !== id)
              .slice(0, 3);
            setRelatedProjects(related);
          }
        } else {
          toast.error('Projet non trouvé');
          navigate('/projects');
        }
      } catch (error) {
        console.error('Error loading project:', error);
        toast.error('Erreur lors du chargement du projet');
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [id, user, navigate]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const success = await deleteProject(id);
      if (success) {
        toast.success('Projet supprimé avec succès');
        navigate('/projects');
      } else {
        toast.error('Erreur lors de la suppression du projet');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erreur lors de la suppression du projet');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleProjectUpdated = (updatedProject: ProjectData) => {
    setProject(updatedProject);
    setIsEditing(false);
    toast.success('Projet mis à jour avec succès');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-3xl">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing && project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Modifier le projet</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectForm 
              project={project}
              onSubmit={handleProjectUpdated}
              onCancel={handleCancelEdit}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Projet non trouvé</h2>
              <p className="text-gray-500 mt-2">
                Le projet que vous recherchez n'existe pas ou a été supprimé.
              </p>
              <Button 
                onClick={() => navigate('/projects')}
                className="mt-4"
              >
                Retour aux projets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Project Header */}
          <Card>
            <div className="relative h-48 md:h-64 overflow-hidden">
              {project.image ? (
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Aucune image</span>
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex space-x-2">
                <Badge className={`
                  ${project.status === 'active' ? 'bg-green-500' : 
                    project.status === 'planning' ? 'bg-blue-500' : 
                    'bg-gray-500'}
                `}>
                  {project.status === 'active' ? 'Actif' : 
                   project.status === 'planning' ? 'Planification' : 
                   'Complété'}
                </Badge>
                
                {project.isPublic && (
                  <Badge variant="outline" className="bg-white">
                    <Users className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
            </div>
            
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{project.title}</h1>
                  <div className="flex items-center text-gray-500 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      Créé le {formatDate(project.created_at || '')}
                    </span>
                  </div>
                </div>
                
                {isOwner && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEdit}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{project.location || 'Emplacement non spécifié'}</span>
                </div>
                <div className="flex items-center">
                  <CalendarDays className="h-5 w-5 text-gray-500 mr-2" />
                  <span>
                    {project.startDate ? formatDate(project.startDate) : 'Date non spécifiée'} - 
                    {project.endDate ? formatDate(project.endDate) : 'Date non spécifiée'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-700">
                    {project.description || 'Aucune description fournie.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Type de culture</h3>
                  <Badge variant="outline">{project.crop || 'Non spécifié'}</Badge>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">Progression</h3>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Project Owner */}
          {project.user_name && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Propriétaire du projet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={project.user_avatar || ''} />
                    <AvatarFallback>
                      {project.user_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{project.user_name}</h3>
                    <p className="text-sm text-gray-500">
                      {isOwner ? 'Vous êtes le propriétaire de ce projet' : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
              
              {isOwner && (
                <>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleEdit}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Projets similaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedProjects.map(relatedProject => (
                  <div 
                    key={relatedProject.id}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/projects/${relatedProject.id}`)}
                  >
                    <h4 className="font-medium">{relatedProject.title}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{relatedProject.location}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le projet sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetail;
