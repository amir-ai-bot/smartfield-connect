
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SupplierCard from '@/components/SupplierCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';
import { toast } from 'sonner';

const suppliersData = [
  {
    id: "1",
    name: "Ahmed Fertilité",
    category: "Engrais",
    rating: 4.8,
    location: "Gafsa Centre",
    phone: "+216 98 765 432",
    email: "ahmed@fertilite.com",
    products: ["Engrais organique", "NPK", "Engrais foliaire", "Compost"],
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "2",
    name: "Samira Semences",
    category: "Semences",
    rating: 4.5,
    location: "El Guettar",
    phone: "+216 91 234 567",
    email: "samira@semences.com",
    products: ["Semences d'oliviers", "Palmiers dattiers", "Pistachiers"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "3",
    name: "Oasis Irrigation",
    category: "Équipement",
    rating: 4.7,
    location: "Gafsa Sud",
    phone: "+216 94 567 890",
    email: "contact@oasis-irrigation.com",
    products: ["Système goutte-à-goutte", "Pompes", "Tuyaux", "Filtres"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "4",
    name: "Eco Protect",
    category: "Pesticides",
    rating: 4.3,
    location: "Metlaoui",
    phone: "+216 97 654 321",
    email: "info@ecoprotect.com",
    products: ["Insecticides bio", "Fongicides", "Répulsifs naturels"],
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "5",
    name: "Mecagri Machines",
    category: "Machines",
    rating: 4.9,
    location: "Gafsa Est",
    phone: "+216 99 123 456",
    email: "service@mecagri.com",
    products: ["Tracteurs", "Moissonneuses", "Outils agricoles", "Pièces détachées"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: "6",
    name: "Sarah Consultante",
    category: "Conseil",
    rating: 5.0,
    location: "Gafsa Nord",
    phone: "+216 92 987 654",
    email: "sarah@agri-conseil.com",
    products: ["Conseil agricole", "Études de sol", "Optimisation de culture"],
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  }
];

const Suppliers = () => {
  const { isAuthenticated, becomeFournisseur } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
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
    
    try {
      await becomeFournisseur();
      toast.success('Félicitations! Vous êtes maintenant un fournisseur.');
    } catch (error) {
      console.error('Error becoming fournisseur:', error);
      toast.error('Erreur lors du changement de statut');
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
          >
            <Plus className="h-4 w-4 mr-2" />
            Devenir fournisseur
          </Button>
        </div>
        
        {/* Search and filter */}
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
        
        {/* Tabs */}
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
        
        {/* Supplier cards */}
        {filteredSuppliers.length > 0 ? (
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
