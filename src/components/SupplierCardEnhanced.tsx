
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail, MapPin, Heart, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  toggleFavoriteFournisseur, 
  isFournisseurFavorite 
} from '@/services/conversationService';
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

const StarRating: React.FC<{ rating?: number }> = ({ rating = 0 }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
      {rating > 0 && (
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

const SupplierCardEnhanced: React.FC<SupplierCardProps> = ({ supplier, onFavoriteToggle }) => {
  const { user, isAuthenticated } = useAuth();
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfFavorite = async () => {
      if (isAuthenticated && user && supplier.id) {
        try {
          const isFavorite = await isFournisseurFavorite(user.id, supplier.id);
          setFavorite(isFavorite);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };
    
    checkIfFavorite();
  }, [user, supplier.id, isAuthenticated]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour ajouter aux favoris');
      return;
    }
    
    try {
      setLoading(true);
      const result = await toggleFavoriteFournisseur(user!.id, supplier.id);
      setFavorite(result.isFavorite);
      
      if (onFavoriteToggle) {
        onFavoriteToggle();
      }
      
      toast.success(
        result.isFavorite
          ? 'Ajouté aux favoris'
          : 'Retiré des favoris'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Une erreur s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = () => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour contacter un fournisseur');
      return;
    }
    
    if (!supplier.user_id) {
      toast.error('Ce fournisseur n\'est pas disponible pour la messagerie');
      return;
    }
    
    // Navigate to create conversation page
    navigate(`/conversations/create/${supplier.user_id}`);
  };

  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={supplier.avatar} alt={supplier.name} />
              <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{supplier.name}</h3>
              <StarRating rating={supplier.rating} />
            </div>
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={handleFavoriteToggle}
            disabled={loading}
            className={
              favorite
                ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                : "text-gray-400 hover:text-red-500 hover:bg-red-50"
            }
          >
            <Heart
              className={
                favorite ? "fill-current" : "fill-none"
              }
            />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-2">
          {supplier.category && (
            <Badge variant="outline" className="bg-agri-green-50">
              {supplier.category}
            </Badge>
          )}
          
          {supplier.location && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              {supplier.location}
            </div>
          )}
          
          {supplier.phone && (
            <div className="flex items-center text-sm text-gray-500">
              <Phone className="w-4 h-4 mr-1" />
              {supplier.phone}
            </div>
          )}
          
          {supplier.email && (
            <div className="flex items-center text-sm text-gray-500">
              <Mail className="w-4 h-4 mr-1" />
              <span className="truncate">{supplier.email}</span>
            </div>
          )}
          
          {supplier.products && supplier.products.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Produits:</p>
              <div className="flex flex-wrap gap-1">
                {supplier.products.slice(0, 3).map((product, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {product}
                  </Badge>
                ))}
                {supplier.products.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{supplier.products.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleContactClick}
        >
          Contacter
        </Button>
        
        <Link 
          to={`/suppliers/${supplier.id}`}
          className="flex-1"
        >
          <Button
            variant="default"
            size="sm"
            className="w-full bg-agri-green-500 hover:bg-agri-green-600"
          >
            Voir profil
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default SupplierCardEnhanced;
