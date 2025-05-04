import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getFavoriteSuppliers } from '@/services/supplierService'; // Updated import
import SupplierCardEnhanced from '@/components/SupplierCardEnhanced';
import { Supplier } from '@/types/supabase';

const Favorites = () => {
  const [favoriteSuppliers, setFavoriteSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Favoris | AgriSmart';
    fetchFavoriteSuppliers();
  }, []);

  const fetchFavoriteSuppliers = async () => {
    try {
      setLoading(true);
      // Get user ID from local storage
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.warn('User ID not found in local storage');
        return;
      }
      const suppliers = await getFavoriteSuppliers(userId);
      setFavoriteSuppliers(suppliers);
    } catch (error) {
      console.error('Error fetching favorite suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Vos Fournisseurs Favoris</h1>
          {loading ? (
            <p className="text-center py-8">Chargement des fournisseurs favoris...</p>
          ) : favoriteSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Vous n'avez pas encore de fournisseurs favoris.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteSuppliers.map((supplier) => (
                <SupplierCardEnhanced key={supplier.id} supplier={supplier} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Favorites;
