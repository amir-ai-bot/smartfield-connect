
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CROP_TYPES, ProjectData } from '@/types/auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import MobileFriendlyDatePicker from '@/components/projects/MobileFriendlyDatePicker';
import { format } from 'date-fns';

export interface ProjectFormProps {
  initialData?: Partial<ProjectData>;
  onSubmit: (data: Partial<ProjectData>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ProjectForm = ({ initialData, onSubmit, onCancel, isSubmitting = false }: ProjectFormProps) => {
  const formSchema = z.object({
    name: z.string().min(3, {
      message: "Le titre doit comporter au moins 3 caractères.",
    }),
    crop: z.string({
      required_error: "Veuillez sélectionner un type de culture.",
    }),
    location: z.string().min(3, {
      message: "Veuillez entrer une localisation valide.",
    }),
    start_date: z.string({
      required_error: "Veuillez sélectionner une date de début.",
    }),
    end_date: z.string({
      required_error: "Veuillez sélectionner une date de fin.",
    }),
    description: z.string().optional(),
    is_public: z.boolean().default(false),
  }).refine(data => new Date(data.end_date) >= new Date(data.start_date), {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["end_date"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || initialData?.title || "",
      crop: initialData?.crop || "",
      location: initialData?.location || "",
      start_date: initialData?.start_date || initialData?.startDate || "",
      end_date: initialData?.end_date || initialData?.endDate || "",
      description: initialData?.description || "",
      is_public: initialData?.is_public ?? false,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit({
      ...values,
      title: values.name, // For backwards compatibility
      startDate: values.start_date, // For backwards compatibility
      endDate: values.end_date, // For backwards compatibility
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre du projet</FormLabel>
              <FormControl>
                <Input placeholder="Entrez le titre du projet" {...field} />
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
                <FormLabel>Type de culture</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="" disabled>Sélectionner le type de culture</option>
                    {CROP_TYPES.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localisation</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez la localisation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de début</FormLabel>
                <MobileFriendlyDatePicker
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de fin</FormLabel>
                <MobileFriendlyDatePicker
                  value={field.value}
                  onChange={field.onChange}
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
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Projet public</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Les projets publics sont visibles par tous les utilisateurs.
                </p>
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
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : initialData?.id ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;
