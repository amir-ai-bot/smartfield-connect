import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { createProject } from '@/services/projectService';
import { uploadProjectImage } from '@/services/storageService';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ProjectData } from '@/types/dashboard';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Image, Loader2 } from 'lucide-react';
import MobileFriendlyDatePicker from './MobileFriendlyDatePicker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const formSchema = z.object({
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères'),
  crop: z.string().min(1, 'Veuillez sélectionner une culture'),
  location: z.string().min(2, 'L\'emplacement doit contenir au moins 2 caractères'),
  startDate: z.date({ required_error: 'Veuillez sélectionner une date de début' }),
  endDate: z.date({ required_error: 'Veuillez sélectionner une date de fin' }),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: Omit<ProjectData, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
}

const CreateProjectDialog = ({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) => {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const availableCrops = [
    "Oliviers",
    "Palmiers",
    "Pistachiers",
    "Amandiers",
    "Grenadiers",
    "Figuiers",
    "Pommiers",
    "Poiriers",
    "Abricotiers",
    "Vignes",
    "Agrumes",
    "Blé",
    "Orge",
    "Maïs",
    "Tomates",
    "Pommes de terre",
    "Oignons",
    "Poivrons",
    "Piments",
    "Ail",
    "Carottes",
    "Autres légumes",
    "Autres fruits",
    "Autres cultures"
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      crop: '',
      location: '',
      description: '',
      isPublic: false,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("Vous devez être connecté pour créer un projet");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      let imageUrl = '';
      
      // First create the project without the image
      const projectData = {
        title: values.title,
        crop: values.crop,
        location: values.location,
        startDate: format(values.startDate, 'yyyy-MM-dd'),
        endDate: format(values.endDate, 'yyyy-MM-dd'),
        description: values.description,
        image: imageUrl,
        isPublic: values.isPublic,
        status: 'planning' as 'planning' | 'active' | 'completed',
        progress: 0
      };
      
      await onProjectCreated(projectData);
      
      // Then, if we have an image, upload it and update the project
      if (selectedImage) {
        try {
          // Image upload would happen here via your service
          // This is left as a placeholder as the actual implementation depends on your specific storage service
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          toast.error("Projet créé mais erreur lors du téléchargement de l'image");
        }
      }
      
      // Reset the form
      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création du projet");
      console.error("Project creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
          <DialogDescription>
            Ajoutez les détails de votre nouveau projet agricole.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du projet</FormLabel>
                  <FormControl>
                    <Input placeholder="Verger d'oliviers" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="crop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Culture principale</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une culture" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCrops.map((crop) => (
                          <SelectItem key={crop} value={crop}>
                            {crop}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emplacement</FormLabel>
                    <FormControl>
                      <Input placeholder="Gafsa, Tunisie" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <MobileFriendlyDatePicker
                      date={field.value}
                      onDateChange={field.onChange}
                      label="Date de début"
                      placeholder="Choisir une date de début"
                      error={form.formState.errors.startDate?.message}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <MobileFriendlyDatePicker
                      date={field.value}
                      onDateChange={field.onChange}
                      label="Date de fin"
                      placeholder="Choisir une date de fin"
                      error={form.formState.errors.endDate?.message}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez votre projet..." 
                      className="resize-none" 
                      rows={4} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-3">
              <label className="block text-sm font-medium">Image du projet</label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('project-image')?.click()}
                  className="flex items-center gap-2"
                >
                  <Image className="h-4 w-4" />
                  Choisir une image
                </Button>
                <input
                  id="project-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="relative h-16 w-16 rounded overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Aperçu" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Projet public</FormLabel>
                    <FormDescription>
                      Permettre aux autres utilisateurs de voir ce projet
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                className="bg-agri-green-500 hover:bg-agri-green-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer le projet'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
