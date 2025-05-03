
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectData, ProjectFormProps } from '@/types/auth';
import { toast } from 'sonner';

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onCancel, project, onProjectCreated }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<Partial<ProjectData>>({
    defaultValues: project || {
      title: '',
      description: '',
      crop: '',
      location: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'planning',
      progress: 0,
      isPublic: false
    }
  });

  React.useEffect(() => {
    if (project) {
      Object.entries(project).forEach(([key, value]) => {
        if (key === 'startDate' && project.start_date) {
          setValue(key as any, project.start_date.split('T')[0]);
        } else if (key === 'endDate' && project.end_date) {
          setValue(key as any, project.end_date.split('T')[0]);
        } else if (key === 'isPublic' && project.is_public !== undefined) {
          setValue(key as any, project.is_public);
        } else if (value !== undefined) {
          setValue(key as any, value);
        }
      });
    }
  }, [project, setValue]);

  const handleFormSubmit = async (data: Partial<ProjectData>) => {
    try {
      await onSubmit(data);
      toast.success(project ? 'Projet mis à jour avec succès' : 'Projet créé avec succès');
      if (onProjectCreated && !project) {
        onProjectCreated(data as ProjectData);
      }
    } catch (error) {
      console.error('Project form error:', error);
      toast.error('Erreur lors de la soumission du projet');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre du projet</Label>
        <Input
          id="title"
          type="text"
          placeholder="Titre du projet"
          {...register('title', { required: 'Le titre est requis' })}
        />
        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description du projet"
          rows={4}
          {...register('description')}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="crop">Type de culture</Label>
          <Input
            id="crop"
            type="text"
            placeholder="Ex: Oliviers, Tomates"
            {...register('crop', { required: 'Le type de culture est requis' })}
          />
          {errors.crop && <p className="text-destructive text-sm">{errors.crop.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Localisation</Label>
          <Input
            id="location"
            type="text"
            placeholder="Ex: Casablanca, Marrakech"
            {...register('location', { required: 'La localisation est requise' })}
          />
          {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Date de début</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate', { required: 'La date de début est requise' })}
          />
          {errors.startDate && <p className="text-destructive text-sm">{errors.startDate.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">Date de fin</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate', { required: 'La date de fin est requise' })}
          />
          {errors.endDate && <p className="text-destructive text-sm">{errors.endDate.message}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            defaultValue={project?.status || 'planning'}
            onValueChange={(value) => setValue('status', value as 'planning' | 'active' | 'completed')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planification</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="completed">Complété</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="progress">Progression (%)</Label>
          <Input
            id="progress"
            type="number"
            min="0"
            max="100"
            {...register('progress', { 
              valueAsNumber: true,
              min: { value: 0, message: 'La progression minimale est 0%' },
              max: { value: 100, message: 'La progression maximale est 100%' }
            })}
          />
          {errors.progress && <p className="text-destructive text-sm">{errors.progress.message}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublic"
            className="h-4 w-4 rounded border-gray-300 text-agri-green-600 focus:ring-agri-green-500"
            {...register('isPublic')}
          />
          <Label htmlFor="isPublic">Rendre ce projet public</Label>
        </div>
        <p className="text-sm text-gray-500">
          Les projets publics sont visibles par tous les utilisateurs et peuvent apparaître sur la page d'accueil.
        </p>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {project ? 'Mettre à jour' : 'Créer le projet'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
