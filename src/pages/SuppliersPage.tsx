
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllSuppliers, Supplier } from '@/services/supplierService';
import SupplierCard from '@/components/SupplierCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [categories, setCategories] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const data = await getAllSuppliers();
        setSuppliers(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(s => s.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuppliers();
  }, []);
  
  // Filter and sort suppliers
  const filteredSuppliers = suppliers
    .filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(search.toLowerCase()) ||
        supplier.products.some(p => p.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Annuaire des Fournisseurs</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher un fournisseur ou un produit..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Évaluation (de la meilleure à la moins bonne)</SelectItem>
                <SelectItem value="name">Nom (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-agri-green-500 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <>
          {filteredSuppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuppliers.map((supplier) => (
                <Link to={`/suppliers/${supplier.id}`} key={supplier.id} className="block">
                  <SupplierCard {...supplier} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium text-gray-900">Aucun fournisseur trouvé</h3>
              <p className="mt-1 text-gray-500">Essayez de modifier vos critères de recherche</p>
              <Button 
                className="mt-4 bg-agri-green-500 hover:bg-agri-green-600"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SuppliersPage;
