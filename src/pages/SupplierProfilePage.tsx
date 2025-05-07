
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSupplierById, createSupplierConversation, Supplier } from '@/services/supplierService';
import { getFournisseurRatings } from '@/services/ratingService';
import { Rating } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Star, Phone, MessageCircle, Mail, ChevronLeft, Calendar, Star as StarIcon } from 'lucide-react';
import { toast } from 'sonner';
import RatingComponent from '@/components/RatingComponent';

const SupplierProfilePage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchSupplierData(id);
    }
  }, [id]);
  
  const fetchSupplierData = async (supplierId: string) => {
    try {
      setIsLoading(true);
      const supplierData = await getSupplierById(supplierId);
      if (supplierData) {
        setSupplier(supplierData);
        
        // Also fetch ratings
        const ratingsData = await getFournisseurRatings(supplierId);
        setRatings(ratingsData || []);
      } else {
        toast.error("Fournisseur non trouvé");
      }
    } catch (error) {
      console.error('Error fetching supplier:', error);
      toast.error("Erreur lors du chargement des données du fournisseur");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateConversation = async () => {
    if (!isAuthenticated || !user || !supplier) {
      toast.error("Vous devez être connecté pour contacter ce fournisseur");
      return;
    }
    
    try {
      setIsCreatingConversation(true);
      const conversationId = await createSupplierConversation(user.id, supplier.id);
      toast.success("Conversation créée avec succès");
      window.location.href = `/messages/${conversationId}`;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error("Erreur lors de la création de la conversation");
    } finally {
      setIsCreatingConversation(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (!supplier) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Fournisseur non trouvé</h1>
        <p className="text-gray-600 mb-6">Le fournisseur que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link to="/suppliers">
          <Button>Retour à la liste des fournisseurs</Button>
        </Link>
      </div>
    );
  }
  
  // Calculate average rating
  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/suppliers" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ChevronLeft size={16} className="mr-1" /> Retour aux fournisseurs
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content - Supplier info and contact */}
        <div className="md:col-span-2 space-y-6">
          {/* Supplier header card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={supplier.avatar || undefined} alt={supplier.name} />
                <AvatarFallback className="text-2xl">{supplier.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold mb-2">{supplier.name}</h1>
                
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
                  <Badge variant="secondary">{supplier.category}</Badge>
                  <div className="flex items-center text-amber-500">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span>{avgRating.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({ratings.length})</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center sm:justify-start text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{supplier.location}</span>
                </div>
                
                {supplier.phone && (
                  <div className="flex items-center justify-center sm:justify-start text-gray-600">
                    <Phone className="h-4 w-4 mr-1" />
                    <a href={`tel:${supplier.phone}`} className="hover:underline">
                      {supplier.phone}
                    </a>
                  </div>
                )}
                
                {supplier.email && (
                  <div className="flex items-center justify-center sm:justify-start text-gray-600">
                    <Mail className="h-4 w-4 mr-1" />
                    <a href={`mailto:${supplier.email}`} className="hover:underline">
                      {supplier.email}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="sm:self-start">
                <Button 
                  onClick={handleCreateConversation}
                  disabled={isCreatingConversation || !isAuthenticated}
                  className="w-full sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contacter
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Products section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Produits et Services</h2>
            
            {supplier.products && supplier.products.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {supplier.products.map(product => (
                  <Badge key={product} variant="outline" className="bg-gray-50">
                    {product}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucun produit ou service répertorié.</p>
            )}
          </Card>
          
          {/* Ratings section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Évaluations et Commentaires</h2>
            
            <div className="mb-6">
              <RatingComponent 
                supplierId={supplier.id} 
                onRatingSubmitted={() => fetchSupplierData(supplier.id)}
              />
            </div>
            
            <Separator className="my-6" />
            
            {ratings.length > 0 ? (
              <div className="space-y-6">
                {ratings.map(rating => (
                  <div key={rating.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={rating.user.avatar || undefined} />
                          <AvatarFallback>{rating.user.display_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{rating.user.display_name}</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            size={16}
                            className={i < rating.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                          />
                        ))}
                      </div>
                    </div>
                    {rating.comment && <p className="text-gray-700">{rating.comment}</p>}
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(rating.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Aucune évaluation pour ce fournisseur.</p>
            )}
          </Card>
        </div>
        
        {/* Sidebar - Additional info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">À propos</h2>
            <p className="text-gray-600 mb-4">
              {supplier.name} est un fournisseur spécialisé dans {supplier.category}.
              Basé à {supplier.location}, ils offrent une variété de produits et services
              pour répondre à vos besoins agricoles.
            </p>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Catégorie:</span>
                <span className="font-medium">{supplier.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lieu:</span>
                <span className="font-medium">{supplier.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Note moyenne:</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500 mr-1" />
                  <span>{avgRating.toFixed(1)}/5</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Évaluations:</span>
                <span className="font-medium">{ratings.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfilePage;
