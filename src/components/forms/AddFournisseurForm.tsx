
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createFournisseurRequest } from '@/services/fournisseurService';

// Define your form props
interface AddFournisseurFormProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const AddFournisseurForm = ({
  onSuccess,
  trigger = <Button>Devenir fournisseur</Button>,
}: AddFournisseurFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour soumettre cette demande',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const requestData = {
        name: formData.name,
        category: formData.category,
        location: formData.location,
        phone: formData.phone,
        userId: user.id
      };
      
      const result = await createFournisseurRequest(requestData);
      
      if (result) {
        toast({
          title: 'Demande envoyée',
          description: 'Votre demande de devenir fournisseur a été envoyée avec succès',
        });
        
        setOpen(false);
        setFormData({
          name: '',
          category: '',
          location: '',
          phone: '',
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi de votre demande',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Devenir fournisseur</DialogTitle>
          <DialogDescription>
            Remplissez ce formulaire pour soumettre votre demande de devenir fournisseur.
            Notre équipe examinera votre demande dans les plus brefs délais.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Catégorie
              </Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="col-span-3"
                placeholder="ex: Semences, Outils, etc."
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Emplacement
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="col-span-3"
                placeholder="ex: Tunis, Sfax, etc."
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Téléphone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="col-span-3"
                placeholder="+216 XX XXX XXX"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Envoi en cours...' : 'Envoyer la demande'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFournisseurForm;
