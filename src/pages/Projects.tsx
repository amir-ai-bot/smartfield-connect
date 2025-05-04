
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects, getPublicProjects } from '@/services/projectService';
import ProjectCard from '@/components/Projects/ProjectCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProjectFormDialog from '@/components/ProjectFormDialog';
import { ProjectData } from '@/types/auth';

const Projects = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublicView, setIsPublicView] = useState(location.pathname === '/public-projects');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    setIsPublicView(location.pathname === '/public-projects');
    loadProjects();
  }, [location, user]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      let projectsData: ProjectData[] = [];

      if (isPublicView) {
        projectsData = await getPublicProjects();
      } else if (user) {
        projectsData = await getProjects(user.id);
      }

      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject: ProjectData) => {
    setProjects([newProject, ...projects]);
    setIsFormOpen(false);
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">
          {isPublicView ? 'Projets Publics' : 'Mes Projets'}
        </h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isPublicView ? 'Projets Publics' : 'Mes Projets'}
        </h1>
        
        {!isPublicView && user && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Projet
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center shadow-sm">
          {isPublicView ? (
            <>
              <h2 className="text-xl font-semibold mb-2">Aucun projet public disponible</h2>
              <p className="text-gray-600">
                Les projets partagés par la communauté seront affichés ici.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">Vous n'avez pas encore de projets</h2>
              <p className="text-gray-600 mb-6">
                Créez votre premier projet pour commencer.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un projet
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isOwner={!isPublicView && user?.id === project.owner_id}
              onDeleted={handleProjectDeleted}
            />
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default Projects;
