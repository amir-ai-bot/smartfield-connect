import { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SupplierCard from '@/components/SupplierCard';
import { useAuth } from '@/contexts/AuthContext';
import { getSuppliers } from '@/services/supplierService';
import { Search, Filter, UserPlus, AlertTriangle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import BecomeSupplierDialog from '@/components/suppliers/BecomeSupplierDialog';
import { supabase } from '@/integrations/supabase/client';
import { Role } from '@/types/auth';

const Suppliers = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBecomeSupplierDialog, setShowBecomeSupplierDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const loadSuppliers = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Loading suppliers...');

      // Check session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Session error');
      }

      if (!session) {
        console.log('No active session, redirecting to login');
        navigate('/');
        return;
      }

      const allSuppliers = await getSuppliers();
      console.log('Suppliers loaded:', allSuppliers);
      
      if (Array.isArray(allSuppliers)) {
        setSuppliers(allSuppliers);
        setFilteredSuppliers(allSuppliers);
      } else {
        throw new Error('Invalid suppliers data received');
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setError('Erreur lors du chargement des fournisseurs');
      toast.error('Erreur lors du chargement des fournisseurs');
      
      // If we haven't tried too many times, retry
      if (retryCount < 3) {
        console.log('Retrying... Attempt:', retryCount + 1);
        setRetryCount(prev => prev + 1);
        setTimeout(loadSuppliers, 2000); // Retry after 2 seconds
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Fournisseurs | AgriSmart';
    
    // Only load suppliers if authenticated
    if (isAuthenticated && !authLoading) {
      loadSuppliers();
    }
  }, [isAuthenticated, authLoading]);
  
  useEffect(() => {
    if (!searchQuery) {
      setFilteredSuppliers(suppliers);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = suppliers.filter(supplier => {
      return (
        supplier.name?.toLowerCase().includes(query) ||
        supplier.category?.toLowerCase().includes(query) ||
        supplier.location?.toLowerCase().includes(query) ||
        (supplier.products && supplier.products.some((product: string) => product.toLowerCase().includes(query)))
      );
    });
    
    setFilteredSuppliers(filtered);
  }, [searchQuery, suppliers]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRetry = () => {
    setRetryCount(0); // Reset retry count
    loadSuppliers(); // Try loading again
  };

  const handleSupplierRequest = async () => {
    try {
      if (!user) return;
      const currentRole = user.role as Role;
      if (currentRole === 'pending_fournisseur') {
        toast.error('Your supplier request is pending approval');
        return;
      }
      // ... rest of the function
    } catch (error) {
      console.error('Error requesting supplier status:', error);
      toast.error('Failed to submit supplier request');
    }
  };

  const renderSupplierRequestButton = () => {
    if (!user) return null;
    const currentRole = user.role as Role;
    if (currentRole === 'pending_fournisseur') {
      return (
        <Button disabled className="w-full md:w-auto">
          Request Pending
        </Button>
      );
    }
    // ... rest of the function
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agri-green-500"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to home
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            
            {renderSupplierRequestButton()}
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
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agri-green-500"></div>
                <p className="text-gray-600">Chargement des fournisseurs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-xl shadow-lg p-8 text-center">
              <div className="h-16 w-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Erreur de chargement</h3>
              <p className="text-gray-600">{error}</p>
              <Button 
                className="mt-4"
                onClick={handleRetry}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
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
