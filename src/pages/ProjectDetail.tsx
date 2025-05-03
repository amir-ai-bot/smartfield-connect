import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectData } from '@/types/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Calendar, MapPin, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getProject } from '@/services/projectService';
import ProjectForm from '@/components/Projects/ProjectForm';
import { Progress } from '@/components/ui/progress';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    document.title = 'Détail du projet | AgriSmart';
    
    const loadProject = async () => {
      if (!id) {
        navigate('/projects');
        return;
      }
      
      try {
        setLoading(true);
        const projectData = await getProject(id);
        
        if (!projectData) {
          toast.error('Projet non trouvé');
          navigate('/projects');
          return;
        }
        
        setProject(projectData);
      } catch (error) {
        console.error('Error loading project:', error);
        toast.error('Erreur lors du chargement du projet');
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [id, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const handleUpdateProject = (updatedProject: ProjectData) => {
    setProject(updatedProject);
    setShowEditForm(false);
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!project) {
    return <div className="text-center py-8">Projet non trouvé.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Button variant="ghost" onClick={handleBack} className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">{project.title}</h1>
            </div>
            {user?.id === project.user_id && (
              <Button onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            )}
          </div>

          {showEditForm ? (
            <ProjectForm
              project={project}
              onSubmit={handleUpdateProject}
              onCancel={handleCancelEdit}
            />
          ) : (
            <>
              <div className="mb-4">
                <img
                  src={project.image || 'https://via.placeholder.com/800x400'}
                  alt={project.title}
                  className="w-full h-64 object-cover rounded-md"
                />
              </div>

              <div className="space-y-2">
                <p className="text-gray-600">{project.description}</p>

                <div className="flex items-center text-gray-500">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{project.location}</span>
                </div>

                <div className="flex items-center text-gray-500">
                  <Sprout className="mr-2 h-4 w-4" />
                  <span>{project.crop}</span>
                </div>

                <div className="flex items-center text-gray-500">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {new Date(project.startDate).toLocaleDateString()} -{' '}
                    {new Date(project.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mt-4">Progression</h3>
                  <Progress value={project.progress} />
                  <span className="text-sm text-gray-500">{project.progress}%</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetail;
