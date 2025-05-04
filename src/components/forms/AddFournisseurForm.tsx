
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { addFournisseur } from '@/services/adminService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  category: z.string().min(2, 'La catégorie doit contenir au moins 2 caractères'),
  location: z.string().min(2, 'L\'emplacement doit contenir au moins 2 caractères'),
  phone: z.string().min(8, 'Le numéro de téléphone doit être valide'),
});

interface AddFournisseurFormProps {
  userId: string;
  onSuccess: () => void;
}

const AddFournisseurForm = ({ userId, onSuccess }: AddFournisseurFormProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      location: '',
      phone: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userId) {
      toast.error('ID utilisateur manquant');
      return;
    }

    setLoading(true);
    try {
      // Include userId in the data sent to the addFournisseur function
      const success = await addFournisseur({
        ...values,
        userId
      });

      if (success) {
        toast.success('Fournisseur ajouté avec succès');
        form.reset();
        onSuccess();
      } else {
        toast.error('Erreur lors de l\'ajout du fournisseur');
      }
    } catch (error) {
      console.error('Error in AddFournisseurForm:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom du fournisseur" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <FormControl>
                <Input placeholder="Catégorie de produits" {...field} />
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
              <FormLabel>Emplacement</FormLabel>
              <FormControl>
                <Input placeholder="Ville, Région" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input placeholder="+216 XX XXX XXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ajout en cours...
            </>
          ) : (
            'Ajouter le fournisseur'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AddFournisseurForm;
