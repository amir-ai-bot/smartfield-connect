
import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type ProjectFormData = {
  title: string;
  crop: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
};

type CreateProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (project: any) => void;
};

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ 
  open, 
  onOpenChange,
  onProjectCreated
}) => {
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<ProjectFormData>({
    defaultValues: {
      title: '',
      crop: '',
      location: '',
      startDate: '',
      endDate: '',
      status: 'planning',
    }
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Here we would normally send data to an API
      // For now, we'll just simulate a delay
      await new Promise(r => setTimeout(r, 1000));
      
      // Create a new project object with all necessary fields
      const newProject = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
        progress: data.status === 'completed' ? 100 : data.status === 'active' ? 30 : 0,
        image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      };
      
      // Notify the parent component about the new project
      if (onProjectCreated) {
        onProjectCreated(newProject);
      }
      
      // Show success message
      toast.success("Projet créé avec succès");
      
      // Reset form and close dialog
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors de la création du projet");
      console.error("Project creation error:", error);
    }
  };

  // Handle select value changes
  const handleSelectChange = (name: keyof ProjectFormData, value: string) => {
    setValue(name, value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
          <DialogDescription>
            Remplissez les détails de votre nouveau projet agricole.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="title">Nom du projet</Label>
            <Input 
              id="title"
              {...register('title', { required: "Le nom est requis" })}
              placeholder="ex: Oliveraie Secteur Nord"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="crop">Culture</Label>
            <Input 
              id="crop"
              {...register('crop', { required: "La culture est requise" })}
              placeholder="ex: Oliviers"
            />
            {errors.crop && (
              <p className="text-sm text-red-500">{errors.crop.message}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="location">Localisation</Label>
            <Input 
              id="location"
              {...register('location', { required: "La localisation est requise" })}
              placeholder="ex: Gafsa Nord"
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="startDate">Date de début</Label>
              <Input 
                id="startDate"
                {...register('startDate', { required: "La date de début est requise" })}
                placeholder="ex: Mars 2023"
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="endDate">Date de fin</Label>
              <Input 
                id="endDate"
                {...register('endDate', { required: "La date de fin est requise" })}
                placeholder="ex: Oct 2023"
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="status">Statut</Label>
            <Select 
              onValueChange={(value) => handleSelectChange('status', value)}
              defaultValue="planning"
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planification</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer le projet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
