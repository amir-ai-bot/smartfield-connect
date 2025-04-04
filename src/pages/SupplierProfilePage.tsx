
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSupplierById } from '@/services/supplierService';
import { getFournisseurRatings } from '@/services/conversationService';
import { Supplier } from '@/services/supplierService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createSupplierConversation } from '@/services/supplierService';
import { Phone, Mail, MapPin, MessageSquare, Star, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthDialog from '@/components/auth/AuthDialog';
import RatingDialog from '@/components/conversation/RatingDialog';
import { timeAgo } from '@/lib/utils';

interface Rating {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    avatar?: string;
  };
}

const SupplierProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        try {
          setIsLoading(true);
          
          const supplierData = await getSupplierById(id);
          setSupplier(supplierData);
          
          if (supplierData) {
            const ratingsData = await getFournisseurRatings(supplierData.user_id);
            // Convert the returned data to match the Rating interface
            const formattedRatings = ratingsData.map((rating: any) => ({
              id: rating.id,
              rating: rating.rating,
              comment: rating.comment,
              created_at: rating.created_at,
              profiles: {
                id: rating.profiles?.id || '',
                name: rating.profiles?.name || 'Anonyme',
                avatar: rating.profiles?.avatar
              }
            }));
            setRatings(formattedRatings);
          }
        } catch (error) {
          console.error('Error loading supplier profile:', error);
          toast.error('Erreur lors du chargement du profil du fournisseur');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [id]);
  
  const handleContact = async () => {
    if (!isAuthenticated || !user) {
      setShowAuthDialog(true);
      return;
    }
    
    if (!supplier) return;
    
    try {
      setIsLoading(true);
      const conversationId = await createSupplierConversation(user.id, supplier.id);
      navigate(`/conversations/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
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
  
  const refreshRatings = async () => {
    if (!supplier) return;
    
    try {
      const ratingsData = await getFournisseurRatings(supplier.user_id);
      // Convert the returned data to match the Rating interface
      const formattedRatings = ratingsData.map((rating: any) => ({
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        created_at: rating.created_at,
        profiles: {
          id: rating.profiles?.id || '',
          name: rating.profiles?.name || 'Anonyme',
          avatar: rating.profiles?.avatar
        }
      }));
      setRatings(formattedRatings);
    } catch (error) {
      console.error('Error refreshing ratings:', error);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }
  
  if (!supplier) {
    return <div className="text-center py-10">Fournisseur non trouvé.</div>;
  }
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={supplier?.avatar || supplier?.image} alt={supplier?.name} />
                  <AvatarFallback className="text-2xl">{supplier?.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold mb-1">{supplier?.name || 'Fournisseur'}</h1>
                
                <div className="flex items-center mb-4">
                  <Badge className="mr-2">{supplier?.category || 'Non spécifié'}</Badge>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1">{supplier?.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-agri-green-500 hover:bg-agri-green-600 mb-4"
                  onClick={handleContact}
                  disabled={isLoading}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contacter
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleRateSupplier}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Évaluer
                </Button>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-3 text-gray-500" />
                  <span>{supplier?.location || 'Non spécifié'}</span>
                </div>
                
                {supplier?.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-3 text-gray-500" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                
                {supplier?.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-3 text-gray-500" />
                    <span>{supplier.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="products">
            <TabsList className="w-full">
              <TabsTrigger value="products" className="flex-1">Produits et Services</TabsTrigger>
              <TabsTrigger value="ratings" className="flex-1">Évaluations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Produits et Services</h2>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {supplier?.products && supplier.products.length > 0 ? (
                      supplier.products.map((product, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {product}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">Aucun produit listé</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ratings" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Évaluations</h2>
                    <Button variant="outline" size="sm" onClick={handleRateSupplier}>
                      Ajouter une évaluation
                    </Button>
                  </div>
                  
                  {ratings.length > 0 ? (
                    <div className="space-y-4">
                      {ratings.map((rating) => (
                        <div key={rating.id} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage src={rating.profiles?.avatar} alt={rating.profiles?.name} />
                                <AvatarFallback>{rating.profiles?.name?.charAt(0) || '?'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{rating.profiles?.name || 'Anonyme'}</p>
                                <div className="flex items-center text-yellow-500 text-sm">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < rating.rating ? 'fill-current' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {timeAgo(rating.created_at)}
                            </div>
                          </div>
                          
                          {rating.comment && (
                            <p className="mt-2 text-gray-600">{rating.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <Star className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                      <p>Aucune évaluation pour le moment</p>
                      <Button 
                        variant="ghost" 
                        className="mt-2 text-agri-green-500"
                        onClick={handleRateSupplier}
                      >
                        Soyez le premier à évaluer
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        initialView="login"
      />
      
      {user && supplier && (
        <RatingDialog
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          userId={user.id}
          fournisseurId={supplier.user_id}
          fournisseurName={supplier.name}
          onRatingSubmitted={refreshRatings}
        />
      )}
    </div>
  );
};

export default SupplierProfilePage;
