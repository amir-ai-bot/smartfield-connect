
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail, MapPin, Star, MessageSquare, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toggleFavoriteFournisseur, isFournisseurFavorite, rateFournisseur } from '@/services/conversationService';
import { createSupplierConversation } from '@/services/supplierService';
import { toast } from 'sonner';
import AuthDialog from './auth/AuthDialog';
import RatingDialog from './conversation/RatingDialog';

interface SupplierCardEnhancedProps {
  id: string;
  user_id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  phone: string; // Required in props but might be empty
  email?: string;
  products?: string[];
  image?: string;
  avatar?: string;
  isFavorite?: boolean;
}

const SupplierCardEnhanced = ({
  id,
  user_id,
  name,
  category,
  rating,
  location,
  phone,
  email,
  products = [], // Provide default empty array
  image,
  avatar,
  isFavorite: initialIsFavorite
}: SupplierCardEnhancedProps) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
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
      // Use the enhanced createSupplierConversation function
      const conversationId = await createSupplierConversation(user.id, id);
      navigate(`/conversations/${conversationId}`);
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

  const handleRateSupplier = () => {
    if (!isAuthenticated || !user) {
      setShowAuthDialog(true);
      return;
    }
    
    setShowRatingDialog(true);
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
            <Badge 
              className="bg-yellow-400 text-gray-800 hover:bg-yellow-500 flex items-center cursor-pointer" 
              onClick={handleRateSupplier}
            >
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
            <AvatarImage src={avatar || image} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="mt-4 space-y-2">
          {phone && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <span>{phone}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <span>{email}</span>
            </div>
          )}
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

      {user && (
        <RatingDialog
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          userId={user.id}
          fournisseurId={user_id} // Use user_id instead of id to get the correct fournisseur id
          fournisseurName={name}
          onRatingSubmitted={() => {
            // Refresh ratings if needed
          }}
        />
      )}
    </Card>
  );
};

export default SupplierCardEnhanced;
