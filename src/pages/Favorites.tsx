
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SupplierCardEnhanced from '@/components/SupplierCardEnhanced';
import { getFavoriteFournisseurs } from '@/services/conversationService';

const Favorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [favoriteSuppliers, setFavoriteSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
    }
  }, [isAuthenticated, user]);

  const loadFavorites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const favorites = await getFavoriteFournisseurs(user.id);
      setFavoriteSuppliers(favorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-gray-50 rounded-lg p-8 text-center shadow-sm">
          <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connectez-vous pour accéder à vos favoris</h2>
          <p className="text-gray-600 mb-6">
            Connectez-vous pour voir et gérer vos fournisseurs favoris.
          </p>
          <Button onClick={() => navigate('/')}>Se connecter</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Mes Favoris</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mes Favoris</h1>

      {favoriteSuppliers.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center shadow-sm">
          <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Vous n'avez pas encore de favoris</h2>
          <p className="text-gray-600 mb-6">
            Parcourez notre liste de fournisseurs et ajoutez-les à vos favoris pour les retrouver ici.
          </p>
          <Button onClick={() => navigate('/suppliers')}>Découvrir les fournisseurs</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteSuppliers.map((supplier) => (
            <SupplierCardEnhanced 
              key={supplier.id} 
              supplier={supplier}
              onFavoriteToggle={loadFavorites}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
