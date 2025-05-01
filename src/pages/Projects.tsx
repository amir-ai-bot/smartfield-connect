import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectData } from '@/types/auth';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import ProjectForm from '@/components/ProjectForm';

const Projects = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles(display_name, avatar)
        `);

      if (error) {
        throw error;
      }

      const formattedProjects = data.map(project => ({
        id: project.id,
        title: project.name,
        description: project.description,
        status: project.status,
        user_id: project.owner_id,
        created_at: project.created_at,
        updated_at: project.updated_at,
        image: '', // Assuming a default or placeholder
        crop: '', // Assuming a default or placeholder
        location: '', // Assuming a default or placeholder
        startDate: '', // Assuming a default or placeholder
        endDate: '', // Assuming a default or placeholder
        progress: 0, // Assuming a default or placeholder
        isPublic: true, // Assuming a default or placeholder
        user_name: project.profiles?.display_name || 'Unknown',
        user_avatar: project.profiles?.avatar || null,
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects.');
    }
  };

  const addProject = (newProject: ProjectData) => {
    setProjects([...projects, newProject]);
  };

  const updateProject = (updatedProject: ProjectData) => {
    setProjects(
      projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    setEditingProject(null);
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      setProjects(projects.filter((project) => project.id !== projectId));
      toast.success('Project deleted successfully.');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project.');
    }
  };

  const openForm = () => {
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const openEditForm = (project: ProjectData) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const projectsToAdd: ProjectData[] = [];

  const handleSubmit = async (projectData: ProjectData) => {
    if (!user) return;

    try {
      if (editingProject) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update({
            name: projectData.title,
            description: projectData.description,
            status: projectData.status,
          })
          .eq('id', editingProject.id);

        if (error) {
          throw error;
        }

        updateProject({ ...editingProject, ...projectData });
        toast.success('Project updated successfully.');
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert(projectsToAdd.map(project => ({
            name: project.title,
            description: project.description,
            status: project.status,
            owner_id: project.user_id
          })))
          .select()
          .single();

        if (error) {
          throw error;
        }

        addProject({
          id: data.id,
          title: data.name,
          description: data.description,
          status: data.status,
          user_id: data.owner_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          image: '', // Assuming a default or placeholder
          crop: '', // Assuming a default or placeholder
          location: '', // Assuming a default or placeholder
          startDate: '', // Assuming a default or placeholder
          endDate: '', // Assuming a default or placeholder
          progress: 0, // Assuming a default or placeholder
          isPublic: true, // Assuming a default or placeholder
          user_name: user.name,
          user_avatar: user.avatar || null,
        });
        toast.success('Project created successfully.');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error('Failed to submit project.');
    } finally {
      closeForm();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>

      <div className="mb-4">
        <button
          onClick={openForm}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          <Plus className="inline-block mr-2" />
          Add Project
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <ProjectForm
              onSubmit={handleSubmit}
              onCancel={closeForm}
              project={editingProject}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project}>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => openEditForm(project)}
                className="text-blue-500 hover:text-blue-700"
              >
                <Edit className="inline-block mr-1" size={16} />
                Edit
              </button>
              <button
                onClick={() => deleteProject(project.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="inline-block mr-1" size={16} />
                Delete
              </button>
            </div>
          </ProjectCard>
        ))}
      </div>
    </div>
  );
};

export default Projects;
