
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProjectForm from '@/components/Projects/ProjectForm'; // Corrected casing
import { createProject } from '@/services/projectService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Use the dashboard ProjectData type explicitly
import { ProjectData } from '@/types/dashboard';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: ProjectData) => void;
}

const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({
  open,
  onOpenChange,
  onProjectCreated
}) => {
  const { user } = useAuth();

  const handleSubmit = async (formData: Partial<ProjectData>) => {
    try {
      if (!user) {
        toast.error('Vous devez être connecté pour créer un projet');
        return;
      }

      // Ensure required fields are present
      if (!formData.crop) {
        formData.crop = ''; // Default value
      }
      if (!formData.location) {
        formData.location = ''; // Default value
      }
      if (formData.progress === undefined) {
        formData.progress = 0; // Default value
      }

      // Pass the user ID and formData to createProject
      const createdProject = await createProject(user.id, formData as Omit<ProjectData, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
      if (createdProject) {
        onProjectCreated(createdProject);
        toast.success('Projet créé avec succès');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erreur lors de la création du projet');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
        </DialogHeader>
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormDialog;
