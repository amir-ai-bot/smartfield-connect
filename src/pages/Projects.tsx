import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects, getUserProjects } from '@/services/projectService';
import ProjectCard from '@/components/Projects/ProjectCard'; 
import ProjectForm from '@/components/Projects/ProjectForm';
import { useNavigate } from 'react-router-dom';
import { ProjectData } from '@/types/auth';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProjects = async () => {
      if (isAuthenticated && user) {
        const userProjects = await getUserProjects(user.id);
        setProjects(userProjects || []);
      } else {
        const allProjects = await getProjects();
        setProjects(allProjects || []);
      }
    };

    loadProjects();
  }, [user, isAuthenticated]);

  const handleCreateProject = () => {
    if (isAuthenticated) {
      setShowProjectForm(true);
    } else {
      navigate('/login');
    }
  };

  const handleProjectCreated = (newProject: ProjectData) => {
    setProjects([newProject, ...projects]);
    setShowProjectForm(false);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {isAuthenticated ? 'Mes Projets' : 'Projets Publics'}
        </h1>
        <Button onClick={handleCreateProject}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Projet
        </Button>
      </div>

      {showProjectForm && (
        <Card className="mb-4">
          <CardContent>
            <ProjectForm 
              onSubmit={(data) => {}} 
              onCancel={() => setShowProjectForm(false)} 
              onProjectCreated={handleProjectCreated} 
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
