
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail, MapPin, Star, MessageSquare, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createConversation, toggleFavoriteFournisseur, isFournisseurFavorite } from '@/services/conversationService';
import { toast } from 'sonner';
import AuthDialog from './auth/AuthDialog';

interface SupplierCardEnhancedProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  phone: string;
  email: string;
  products: string[];
  image: string;
  isFavorite?: boolean;
}

const SupplierCardEnhanced = ({
  id,
  name,
  category,
  rating,
  location,
  phone,
  email,
  products,
  image,
  isFavorite: initialIsFavorite
}: SupplierCardEnhancedProps) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if supplier is in favorites when component mounts
  useEffect(() => {
    if (user && id) {
      const checkFavoriteStatus = async () => {
        try {
          const status = await isFournisseurFavorite(user.id, id);
          setIsFavorite(status);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      };
      
      checkFavoriteStatus();
    }
  }, [user, id, initialIsFavorite]);
  
  const handleContact = async () => {
    if (!isAuthenticated || !user) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      setIsLoading(true);
      // The issue is here - we need to make sure user.id and id are both strings
      const conversation = await createConversation(user.id, id);
      navigate(`/conversations/${conversation.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !user) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await toggleFavoriteFournisseur(user.id, id);
      setIsFavorite(result.isFavorite);
      
      toast.success(
        result.isFavorite 
          ? `${name} ajouté aux favoris` 
          : `${name} retiré des favoris`
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erreur lors de la mise à jour des favoris');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge className="bg-white text-gray-800 hover:bg-gray-100">
              {category}
            </Badge>
            <Badge className="bg-yellow-400 text-gray-800 hover:bg-yellow-500 flex items-center">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {rating}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 left-2 rounded-full bg-white/80 hover:bg-white ${
              isFavorite ? 'text-red-500' : 'text-gray-500'
            }`}
            onClick={handleToggleFavorite}
            disabled={isLoading}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">{name}</h3>
            <p className="text-gray-500 text-sm flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {location}
            </p>
          </div>
          <Avatar className="h-14 w-14 border-2 border-white shadow-md -mt-12">
            <AvatarImage src={image} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-gray-500" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-gray-500" />
            <span>{email}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Produits et services:</p>
          <div className="flex flex-wrap gap-1">
            {products.map((product, index) => (
              <Badge key={index} variant="outline" className="bg-gray-50">
                {product}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="mt-5 flex justify-center">
          <Button
            onClick={handleContact}
            className="w-full bg-agri-green-500 hover:bg-agri-green-600"
            disabled={isLoading}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Contacter
          </Button>
        </div>
      </CardContent>
      
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        initialView="login"
      />
    </Card>
  );
};

export default SupplierCardEnhanced;
