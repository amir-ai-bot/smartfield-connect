
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import ProjectForm from '@/components/ProjectForm';
import { ProjectCard } from '@/components/Projects/ProjectCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProjectData } from '@/types/auth';
import { toast } from 'sonner';

const Projects = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      // Fetch projects from the database
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform Supabase data to match ProjectData format
      const formattedProjects = projectsData.map(project => ({
        id: project.id,
        title: project.name,
        description: project.description || '',
        status: project.status as 'planning' | 'active' | 'completed',
        user_id: project.owner_id,
        created_at: project.created_at,
        updated_at: project.updated_at,
        image: '',
        crop: '',
        location: '',
        startDate: '',
        endDate: '',
        progress: 0,
        isPublic: false,
        user_name: user?.name,
        user_avatar: user?.avatar
      }));
      
      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (projectData: Partial<ProjectData>) => {
    if (!user) return;
    
    try {
      // Map ProjectData to Supabase projects table format
      const newProject = {
        name: projectData.title || 'Nouveau projet',
        description: projectData.description,
        status: projectData.status || 'planning',
        owner_id: user.id
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Transform Supabase response to ProjectData format
      const formattedProject: ProjectData = {
        id: data.id,
        title: data.name,
        description: data.description || '',
        status: data.status as 'planning' | 'active' | 'completed',
        user_id: data.owner_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        image: '',
        crop: projectData.crop || '',
        location: projectData.location || '',
        startDate: projectData.startDate || '',
        endDate: projectData.endDate || '',
        progress: 0,
        isPublic: projectData.isPublic || false,
        user_name: user.name,
        user_avatar: user.avatar
      };
      
      setProjects(prev => [formattedProject, ...prev]);
      toast.success('Projet créé avec succès');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erreur lors de la création du projet');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-48">Chargement des projets...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Mes Projets</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Nouveau Projet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
            </DialogHeader>
            <ProjectForm 
              onSubmit={handleCreateProject} 
              onCancel={() => setIsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Vous n'avez pas encore de projets</p>
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Créer mon premier projet
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
