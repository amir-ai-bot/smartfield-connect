
import React, { useEffect, useState } from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/ProjectCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectData } from '@/types/dashboard';
import { getAllVisibleProjects, getPublicProjects } from '@/services/projectService';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Projets | AgriSmart';
    fetchProjects();
  }, []);

  // Refresh projects when navigating back to this page
  useEffect(() => {
    const handleFocus = () => {
      fetchProjects();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      if (!user) {
        console.log('No user found, fetching only public projects');
        const publicProjects = await getPublicProjects();
        setProjects(publicProjects);
        setLoading(false);
        return;
      }

      console.log('Fetching all visible projects for user:', user.id);
      const fetchedProjects = await getAllVisibleProjects(user.id);
      console.log('Fetched projects:', fetchedProjects);

      if (!fetchedProjects || fetchedProjects.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Ensure that all projects have a valid status value
      const projectsWithValidStatus: ProjectData[] = fetchedProjects.map(project => ({
        ...project,
        id: project.id || '',
        title: project.title || project.name || 'Projet sans titre',
        name: project.name || project.title || 'Projet sans titre',
        description: project.description || '',
        status: (project.status === 'planning' ||
                 project.status === 'active' ||
                 project.status === 'completed')
                ? project.status
                : 'planning' as 'planning' | 'active' | 'completed',
        crop: project.crop || '',
        location: project.location || '',
        progress: typeof project.progress === 'number' ? project.progress : 0,
        startDate: project.startDate || project.start_date || '',
        start_date: project.start_date || project.startDate || '',
        endDate: project.endDate || project.end_date || '',
        end_date: project.end_date || project.endDate || '',
        is_public: !!project.is_public,
        user_id: project.owner_id || project.user_id || (user ? user.id : ''),
        // Preserve the isOwnProject flag
        isOwnProject: project.isOwnProject
      }));

      console.log('Processed projects:', projectsWithValidStatus);
      setProjects(projectsWithValidStatus);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const navigateToCreateProject = () => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un projet');
      return;
    }
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
      <SimpleNavbar />
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
                <TabsTrigger value="my-projects"><User className="h-4 w-4 mr-1" />Mes Projets</TabsTrigger>
                <TabsTrigger value="public-projects"><Users className="h-4 w-4 mr-1" />Projets Publics</TabsTrigger>
                <TabsTrigger value="active">Actifs</TabsTrigger>
                <TabsTrigger value="completed">Terminés</TabsTrigger>
                <TabsTrigger value="planning">Planification</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      showOwner={!project.isOwnProject}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="my-projects">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter((project) => project.isOwnProject)
                    .map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
                {projects.filter(p => p.isOwnProject).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Vous n'avez pas encore créé de projets.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="public-projects">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter((project) => !project.isOwnProject && project.is_public)
                    .map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        showOwner={true}
                      />
                    ))}
                </div>
                {projects.filter(p => !p.isOwnProject && p.is_public).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Aucun projet public disponible pour le moment.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter((project) => project.status === 'active')
                    .map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        showOwner={!project.isOwnProject}
                      />
                    ))}
                </div>
                {projects.filter(p => p.status === 'active').length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Aucun projet actif pour le moment.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter((project) => project.status === 'completed')
                    .map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        showOwner={!project.isOwnProject}
                      />
                    ))}
                </div>
                {projects.filter(p => p.status === 'completed').length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Aucun projet terminé pour le moment.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="planning">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter((project) => project.status === 'planning')
                    .map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        showOwner={!project.isOwnProject}
                      />
                    ))}
                </div>
                {projects.filter(p => p.status === 'planning').length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Aucun projet en planification pour le moment.</p>
                  </div>
                )}
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
