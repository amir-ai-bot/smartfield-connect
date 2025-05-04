import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFavoriteSuppliers } from '@/services/supplierService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SupplierCardEnhanced } from '@/components/SupplierCardEnhanced';

const Favorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [favoriteSuppliers, setFavoriteSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Favoris | AgriSmart';
    fetchFavoriteSuppliers();
  }, [user]);

  const fetchFavoriteSuppliers = async () => {
    if (isAuthenticated && user) {
      setLoading(true);
      try {
        const suppliers = await getFavoriteSuppliers(user.id);
        setFavoriteSuppliers(suppliers);
      } catch (error) {
        console.error('Error fetching favorite suppliers:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setFavoriteSuppliers([]);
      setLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    fetchFavoriteSuppliers();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Vos Fournisseurs Favoris</h1>
          {loading ? (
            <p>Chargement...</p>
          ) : favoriteSuppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteSuppliers.map((supplier) => (
                <SupplierCardEnhanced
                  key={supplier.id}
                  supplier={supplier}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          ) : (
            <p>Vous n'avez pas encore de fournisseurs favoris.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Favorites;
