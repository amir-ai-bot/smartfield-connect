
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFavoriteFournisseurs } from '@/services/conversationService';
import SupplierCardEnhanced from '@/components/SupplierCardEnhanced';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Mes favoris | AgriSmart';
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const favoritesData = await getFavoriteFournisseurs(user.id);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mes fournisseurs favoris</h1>
          <Button 
            onClick={() => navigate('/suppliers')}
            variant="outline"
          >
            Tous les fournisseurs
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Chargement...</p>
          </div>
        ) : (
          <>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((supplier: any) => (
                  <SupplierCardEnhanced
                    key={supplier.id}
                    supplier={supplier}
                    onFavoriteToggle={loadFavorites}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium">Pas encore de favoris</h3>
                    <p className="text-gray-500 max-w-md">
                      Vous n'avez pas encore ajouté de fournisseurs à vos favoris. 
                      Explorez notre liste de fournisseurs et ajoutez-les à vos favoris pour les retrouver facilement ici.
                    </p>
                    <Button 
                      onClick={() => navigate('/suppliers')}
                      className="mt-4"
                    >
                      Explorer les fournisseurs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;
