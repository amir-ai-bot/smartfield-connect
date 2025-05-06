
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectData, ProjectFormProps } from '@/types/auth';

interface EnhancedProjectFormProps extends ProjectFormProps {
  isSubmitting?: boolean;
}

const ProjectForm: React.FC<EnhancedProjectFormProps> = ({ onSubmit, onCancel, project, onProjectCreated, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'planning',
    location: project?.location || '',
    crop: project?.crop || '',
    startDate: project?.startDate || project?.start_date || '',
    endDate: project?.endDate || project?.end_date || '',
    is_public: project?.is_public || project?.isPublic || false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as 'planning' | 'active' | 'completed' });
  };

  const handleIsPublicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, is_public: e.target.checked });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData: Partial<ProjectData> = {
      ...formData,
      // Ensure backward compatibility
      isPublic: formData.is_public
    };
    onSubmit(projectData);
    if (onProjectCreated && project?.id) {
      onProjectCreated(project);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Titre du projet"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description du projet"
          rows={4}
        />
      </div>
      
      <div>
        <Label htmlFor="location">Emplacement</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="Emplacement du projet"
        />
      </div>
      
      <div>
        <Label htmlFor="crop">Culture</Label>
        <Input
          id="crop"
          name="crop"
          value={formData.crop}
          onChange={handleInputChange}
          placeholder="Type de culture"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Date de début</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <Label htmlFor="endDate">Date de fin</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Statut</Label>
        <Select 
          value={formData.status} 
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">En planification</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_public"
          checked={formData.is_public}
          onChange={handleIsPublicChange}
          className="rounded border-gray-300"
        />
        <Label htmlFor="is_public">Projet public</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Chargement...' : (project ? 'Mettre à jour' : 'Créer')}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
