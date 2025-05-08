import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SupplierCard from '@/components/SupplierCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Filter, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';
import { toast } from 'sonner';
import { getAllSuppliers, initializeDefaultSuppliers } from '@/services/supplierService';

const Suppliers = () => {
  const { isAuthenticated, user, becomeFournisseur, isPendingFournisseur } = useAuth();
  const [suppliersData, setSuppliersData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await initializeDefaultSuppliers();

        const suppliers = await getAllSuppliers();

        setSuppliersData(suppliers || []);

        if (!suppliers || suppliers.length === 0) {
          setError('Aucun fournisseur trouvé. Veuillez réessayer plus tard.');
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setError('Erreur lors du chargement des fournisseurs. Veuillez réessayer plus tard.');
        toast.error('Erreur lors du chargement des fournisseurs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliersData.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.products.some(product => product.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'favorites' && [1, 3, 5].includes(Number(supplier.id))) ||
                      (activeTab === 'recent' && [2, 4, 6].includes(Number(supplier.id)));

    return matchesSearch && matchesCategory && matchesTab;
  });

  const uniqueCategories = Array.from(new Set(suppliersData.map(supplier => supplier.category)));

  const handleBecomeFournisseur = async () => {
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return;
    }

    // Si l'utilisateur est un administrateur, rediriger vers la page d'administration des fournisseurs
    if (user?.role === 'admin') {
      window.location.href = '/admin?tab=fournisseurs';
      return;
    }

    try {
      setIsLoading(true);
      await becomeFournisseur();
    } catch (error) {
      console.error('Error becoming fournisseur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (user?.role === 'fournisseur' || user?.role === 'admin_fournisseur') {
      return 'Vous êtes fournisseur';
    } else if (isPendingFournisseur()) {
      return 'Demande en attente';
    } else if (user?.role === 'admin') {
      return 'Vérifier les fournisseurs';
    } else {
      return 'Devenir fournisseur';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Fournisseurs</h1>
            <p className="text-gray-600">Trouvez et contactez les meilleurs fournisseurs de la région</p>
          </div>

          <Button
            className="mt-4 md:mt-0 bg-agri-blue-500 hover:bg-agri-blue-600 text-white flex items-center"
            onClick={handleBecomeFournisseur}
            disabled={user?.role === 'fournisseur' || user?.role === 'admin_fournisseur' || isPendingFournisseur() || isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {getButtonText()}
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-card mb-8 p-4 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher des fournisseurs ou produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>

            <div className="w-full md:w-60">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category" className="border-gray-200">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Catégorie" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8 animate-slide-up">
          <TabsList className="grid grid-cols-3 w-full sm:w-80">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
            <TabsTrigger value="recent">Récents</TabsTrigger>
          </TabsList>

          <TabsContent value="all"></TabsContent>
          <TabsContent value="favorites"></TabsContent>
          <TabsContent value="recent"></TabsContent>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-card p-8 text-center animate-slide-up">
            <div className="h-16 w-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Erreur</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        ) : filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier, index) => (
              <div
                key={supplier.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <SupplierCard {...supplier} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card p-8 text-center animate-slide-up">
            <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Aucun fournisseur trouvé</h3>
            <p className="text-gray-600 mb-4">Aucun fournisseur ne correspond à vos critères de recherche.</p>
            <Button onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
            }}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </main>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        initialView="login"
      />

      <Footer />
    </div>
  );
};

export default Suppliers;
