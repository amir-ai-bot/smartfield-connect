
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ComboBox } from '@/components/ui/ComboBox';
import { getSuppliers } from '@/services/supplierService';
import { useAuth } from '@/contexts/AuthContext';
import SupplierCard from '@/components/SupplierCard';
import { toast } from 'sonner';
import BecomeSupplierDialog from '@/components/suppliers/BecomeSupplierDialog';

const SuppliersPage = () => {
  const { user, isAuthenticated, becomeFournisseur, isPendingFournisseur } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showBecomeSupplierDialog, setShowBecomeSupplierDialog] = useState(false);
  
  useEffect(() => {
    document.title = "Fournisseurs | AgriSmart";
    loadSuppliers();
  }, []);
  
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getSuppliers();
      setSuppliers(data);
      setFilteredSuppliers(data);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map(supplier => supplier.category))
      ).filter(Boolean) as string[];
      
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      toast.error("Erreur lors du chargement des fournisseurs");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Filter suppliers based on search text and selected category
    const filtered = suppliers.filter(supplier => {
      const matchesText = searchText === '' || 
        supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (supplier.products && supplier.products.some((product: string) => 
          product.toLowerCase().includes(searchText.toLowerCase())
        ));
      
      const matchesCategory = selectedCategory === '' || supplier.category === selectedCategory;
      
      return matchesText && matchesCategory;
    });
    
    setFilteredSuppliers(filtered);
  }, [searchText, selectedCategory, suppliers]);
  
  const handleBecomeSupplier = () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour devenir fournisseur");
      return;
    }
    
    setShowBecomeSupplierDialog(true);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 mt-16">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-6">Fournisseurs agricoles</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Input
              placeholder="Rechercher par nom ou produit..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="md:w-1/3"
            />
            
            <ComboBox
              items={categories.map(cat => ({ value: cat, label: cat }))}
              placeholder="Filtrer par catégorie"
              onValueChange={(value) => setSelectedCategory(value)}
              className="md:w-1/3"
            />
            
            {isAuthenticated && !isPendingFournisseur() && (
              <Button 
                onClick={handleBecomeSupplier}
                className="bg-agri-green-500 hover:bg-agri-green-600"
              >
                Devenir fournisseur
              </Button>
            )}
            
            {isPendingFournisseur && isPendingFournisseur() && (
              <div className="flex items-center text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200 text-sm">
                <span>Votre demande pour devenir fournisseur est en cours d'examen</span>
              </div>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agri-green-500"></div>
          </div>
        ) : filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard 
                key={supplier.id} 
                id={supplier.id}
                name={supplier.name}
                category={supplier.category}
                rating={supplier.rating || 0} 
                location={supplier.location}
                phone={supplier.phone}
                products={supplier.products}
                avatar={supplier.avatar}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card p-8 text-center">
            <div className="mx-auto mb-4 h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Aucun fournisseur trouvé</h3>
            <p className="text-gray-600 mb-4">Essayez de modifier vos critères de recherche</p>
            <Button onClick={() => {
              setSearchText('');
              setSelectedCategory('');
            }}>
              Réinitialiser la recherche
            </Button>
          </div>
        )}
      </div>
      
      <BecomeSupplierDialog 
        open={showBecomeSupplierDialog} 
        onOpenChange={setShowBecomeSupplierDialog} 
      />
    </div>
  );
};

export default SuppliersPage;
