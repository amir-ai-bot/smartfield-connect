
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFavoriteSuppliers } from '@/services/conversationService';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import SupplierCardEnhanced from '@/components/SupplierCardEnhanced';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        try {
          const data = await getFavoriteSuppliers(user.id);
          setFavorites(data);
        } catch (error) {
          console.error('Error fetching favorites:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFavorites();
  }, [user]);

  const handleFavoriteToggle = () => {
    // Refresh the favorites list
    if (user) {
      getFavoriteSuppliers(user.id).then(data => setFavorites(data));
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-semibold mb-4">Please Login</h1>
            <p>You need to be logged in to see your favorites.</p>
            <Link to="/login" className="text-blue-600 hover:underline block mt-4">
              Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="container mx-auto p-4">Loading your favorites...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Favorite Suppliers</h1>
      
      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-3">No favorites yet</h2>
            <p className="mb-4">
              You haven't added any suppliers to your favorites list yet.
            </p>
            <Link to="/suppliers" className="text-blue-600 hover:underline">
              Browse Suppliers
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((supplier) => (
            <SupplierCardEnhanced
              key={supplier.id}
              supplier={supplier}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
