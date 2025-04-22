
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SupplierCard from '@/components/SupplierCard';
import { useAuth } from '@/contexts/AuthContext';
import { getFavoriteFournisseurs } from '@/services/conversationService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favoriteSuppliers, setFavoriteSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Fournisseurs favoris | AgriSmart';
    
    const loadFavorites = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const favorites = await getFavoriteFournisseurs(user.id);
        setFavoriteSuppliers(favorites);
      } catch (error) {
        console.error('Error loading favorites:', error);
        toast.error('Erreur lors du chargement des fournisseurs favoris');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFavorites();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              className="mr-4 p-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Fournisseurs favoris</h1>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agri-green-500"></div>
            </div>
          ) : favoriteSuppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteSuppliers.map((supplier) => (
                <div 
                  key={supplier.id} 
                  className="animate-slide-up"
                >
                  <SupplierCard 
                    id={supplier.id}
                    name={supplier.name || "Fournisseur"}
                    category={supplier.category || "Divers"}
                    rating={supplier.rating || 4.5}
                    location={supplier.location || "Non spécifié"}
                    phone={supplier.phone || "Non spécifié"}
                    email={supplier.email || "Non spécifié"}
                    products={supplier.products || []}
                    avatar={supplier.avatar || ""}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-card p-8 text-center animate-slide-up">
              <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Aucun fournisseur favori</h3>
              <p className="text-gray-600 mb-4">Vous n'avez pas encore ajouté de fournisseurs à vos favoris.</p>
              <Button onClick={() => navigate('/suppliers')}>
                Voir les fournisseurs
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Favorites;
