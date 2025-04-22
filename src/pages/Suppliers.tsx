
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SupplierCard from '@/components/SupplierCard';
import { useAuth } from '@/contexts/AuthContext';
import { getSuppliers } from '@/services/supplierService';
import { Search, Filter, UserPlus, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import BecomeSupplierDialog from '@/components/suppliers/BecomeSupplierDialog';

const Suppliers = () => {
  const { user, isAuthenticated } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBecomeSupplierDialog, setShowBecomeSupplierDialog] = useState(false);
  
  useEffect(() => {
    document.title = 'Fournisseurs | AgriSmart';
    
    const loadSuppliers = async () => {
      try {
        setIsLoading(true);
        const allSuppliers = await getSuppliers();
        setSuppliers(allSuppliers);
        setFilteredSuppliers(allSuppliers);
      } catch (error) {
        console.error('Error loading suppliers:', error);
        toast.error('Erreur lors du chargement des fournisseurs');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSuppliers();
  }, []);
  
  useEffect(() => {
    if (!searchQuery) {
      setFilteredSuppliers(suppliers);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = suppliers.filter(supplier => {
      return (
        supplier.name.toLowerCase().includes(query) ||
        supplier.category.toLowerCase().includes(query) ||
        supplier.location.toLowerCase().includes(query) ||
        (supplier.products && supplier.products.some((product: string) => product.toLowerCase().includes(query)))
      );
    });
    
    setFilteredSuppliers(filtered);
  }, [searchQuery, suppliers]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Fournisseurs</h1>
              <p className="text-gray-600 mt-1">
                Trouvez des fournisseurs de semences, d'équipements et plus encore
              </p>
            </div>
            
            {isAuthenticated && user?.role !== 'admin' && user?.role !== 'fournisseur' && user?.role !== 'pending_fournisseur' && (
              <Button 
                onClick={() => setShowBecomeSupplierDialog(true)}
                className="whitespace-nowrap bg-agri-green-500 hover:bg-agri-green-600"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Devenir fournisseur
              </Button>
            )}
            
            {user?.role === 'pending_fournisseur' && (
              <div className="flex items-center bg-yellow-50 text-yellow-800 px-4 py-2 rounded-md">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span className="text-sm">Votre demande est en cours d'examen</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom, catégorie, produit..."
                className="pl-9"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <Button variant="outline" className="md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agri-green-500"></div>
            </div>
          ) : filteredSuppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuppliers.map((supplier) => (
                <Link 
                  key={supplier.id} 
                  to={`/suppliers/${supplier.id}`}
                  className="transition-transform hover:scale-[1.02]"
                >
                  <SupplierCard 
                    id={supplier.id}
                    name={supplier.name}
                    category={supplier.category}
                    rating={supplier.rating || 4.5}
                    location={supplier.location}
                    phone={supplier.phone}
                    products={supplier.products}
                    avatar={supplier.avatar}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
              <p className="text-gray-600">
                Aucun fournisseur ne correspond à votre recherche. Essayez avec d'autres termes.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      <BecomeSupplierDialog
        open={showBecomeSupplierDialog}
        onOpenChange={setShowBecomeSupplierDialog}
      />
    </div>
  );
};

export default Suppliers;
