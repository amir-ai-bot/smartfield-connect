
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail, MapPin, Heart, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import RatingComponent from './RatingComponent';
import { useAuth } from '@/contexts/AuthContext';
import { toggleFavoriteFournisseur, isFournisseurFavorite } from '@/services/conversationService';
import { toast } from 'sonner';

interface Supplier {
  id: string;
  name: string;
  category?: string;
  location?: string;
  phone?: string;
  products?: string[];
  rating?: number;
  avatar?: string;
  email?: string;
  user_id?: string;
}

interface SupplierCardProps {
  supplier: Supplier;
  onFavoriteToggle?: () => void;
}

const SupplierCardEnhanced: React.FC<SupplierCardProps> = ({ supplier, onFavoriteToggle }) => {
  const { user, isAuthenticated } = useAuth();
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkFavoriteStatus();
  }, [user, supplier]);

  const checkFavoriteStatus = async () => {
    if (user && supplier.user_id) {
      try {
        const isFavorite = await isFournisseurFavorite(user.id, supplier.user_id);
        setFavorite(isFavorite);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour ajouter aux favoris');
      return;
    }

    if (!supplier.user_id) {
      toast.error('Information fournisseur incomplète');
      return;
    }

    try {
      setLoading(true);
      const result = await toggleFavoriteFournisseur(user.id, supplier.user_id);
      
      // Handle different result types
      if (result === false) {
        toast.error('Erreur lors de la mise à jour des favoris');
      } else if (typeof result === 'object' && 'isFavorite' in result) {
        setFavorite(result.isFavorite);
        toast.success(result.isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris');
      } else {
        // Handle boolean result (legacy support)
        setFavorite(!!result);
        toast.success(result ? 'Ajouté aux favoris' : 'Retiré des favoris');
      }
      
      if (onFavoriteToggle) {
        onFavoriteToggle();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erreur lors de la modification des favoris');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour contacter le fournisseur');
      return;
    }
    navigate(`/supplier/${supplier.id}`);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={supplier.avatar || ''} alt={supplier.name} />
              <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{supplier.name}</h3>
              {supplier.category && (
                <Badge variant="outline" className="bg-gray-100">
                  {supplier.category}
                </Badge>
              )}
            </div>
          </div>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              disabled={loading}
              className={favorite ? "text-red-500" : ""}
            >
              <Heart className={`h-5 w-5 ${favorite ? "fill-red-500" : ""}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <RatingComponent supplierId={supplier.id} userRating={supplier.rating} />
          
          {supplier.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{supplier.location}</span>
            </div>
          )}
          
          {supplier.phone && (
            <div className="flex items-center text-sm text-gray-500">
              <Phone className="h-4 w-4 mr-2" />
              <span>{supplier.phone}</span>
            </div>
          )}
          
          {supplier.email && (
            <div className="flex items-center text-sm text-gray-500">
              <Mail className="h-4 w-4 mr-2" />
              <span className="truncate">{supplier.email}</span>
            </div>
          )}
          
          {supplier.products && supplier.products.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Produits:</p>
              <div className="flex flex-wrap gap-1">
                {supplier.products.map((product, index) => (
                  <Badge key={index} variant="secondary">
                    {product}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          className="w-full" 
          onClick={handleContact}
          variant="default"
        >
          Contacter
        </Button>
        <Link to={`/supplier/${supplier.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Voir le profil
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default SupplierCardEnhanced;
