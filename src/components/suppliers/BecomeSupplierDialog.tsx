
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BecomeSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BecomeSupplierDialog: React.FC<BecomeSupplierDialogProps> = ({ open, onOpenChange }) => {
  const { becomeFournisseur } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await becomeFournisseur();
      onOpenChange(false);
    } catch (error) {
      console.error('Error becoming supplier:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Devenir fournisseur</DialogTitle>
          <DialogDescription>
            Remplissez ce formulaire pour soumettre votre demande pour devenir fournisseur sur AgriSmart.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                En devenant fournisseur, vous pourrez:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-4">
                <li>Proposer vos produits et services aux agriculteurs</li>
                <li>Recevoir des demandes de devis</li>
                <li>Communiquer directement avec les clients potentiels</li>
              </ul>
              <p className="text-sm text-gray-600 font-medium">
                Notre équipe examinera votre demande et vous contactera pour plus d'informations.
              </p>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mr-2"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-agri-green-500 hover:bg-agri-green-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Soumission en cours...
                </>
              ) : (
                'Soumettre ma demande'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BecomeSupplierDialog;
