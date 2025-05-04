
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectData } from '@/types/auth';
import { getUserProjects } from '@/services/projectService';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Projets | AgriSmart';
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const fetchedProjects = await getUserProjects(user.id);
      
      // Ensure that all projects have a valid status value
      const projectsWithValidStatus: ProjectData[] = fetchedProjects.map(project => ({
        ...project,
        title: project.title || project.name || '',
        status: (project.status === 'planning' || 
                 project.status === 'active' || 
                 project.status === 'completed') 
                ? project.status 
                : 'planning' as 'planning' | 'active' | 'completed'
      }));
      
      setProjects(projectsWithValidStatus);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToCreateProject = () => {
    navigate('/projects/create');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Vos Projets</h1>
            <Button onClick={navigateToCreateProject}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Projet
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Vous n'avez pas encore de projets. Créez-en un pour commencer!</p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="active">Actifs</TabsTrigger>
                <TabsTrigger value="completed">Terminés</TabsTrigger>
                <TabsTrigger value="planning">Planification</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="active">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter((project) => project.status === 'active')
                    .map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="completed">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter((project) => project.status === 'completed')
                    .map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="planning">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter((project) => project.status === 'planning')
                    .map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Projects;
