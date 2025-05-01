import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllSuppliers, searchSuppliers } from '@/services/supplierService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from '@/contexts/LanguageContext';
import ComboBox from '@/components/ui/ComboBox';

interface SupplierCardProps {
  id: string;
  name: string;
  category: string;
  rating?: number;
  location: string;
  phone: string;
  email?: string;
  products: string[];
  avatar?: string;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ id, name, category, rating, location, phone, email, products, avatar }) => {
  const { t } = useLanguage();

  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        </div>
        <CardDescription>
          <Badge variant="secondary">{category}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center">
          <span className="font-medium">{t('location')}:</span>
          <span className="ml-1">{location}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium">{t('phone')}:</span>
          <span className="ml-1">{phone}</span>
        </div>
        {email && (
          <div className="flex items-center">
            <span className="font-medium">Email:</span>
            <span className="ml-1">{email}</span>
          </div>
        )}
        <div>
          <span className="font-medium">{t('products')}:</span>
          <ul className="list-disc pl-5">
            {products.map((product, index) => (
              <li key={index}>{product}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="justify-between items-center">
        <div>
          <span className="font-medium">{t('rating')}:</span>
          <span className="ml-1">{rating || 'N/A'}</span>
        </div>
        <Link to={`/suppliers/${id}`}>
          <Button variant="secondary" size="sm">
            {t('viewDetails')}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<SupplierCardProps[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const suppliersData = await getAllSuppliers();
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await searchSuppliers(searchQuery);
      setSuppliers(searchResults);
    } catch (error) {
      console.error('Error searching suppliers:', error);
      toast.error('Failed to search suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Implement category-based filtering here if needed
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Fertilisants', label: 'Fertilisants' },
    { value: 'Équipement', label: 'Équipement' },
    { value: 'Semences', label: 'Semences' },
    // Add more categories as needed
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">{t('suppliers')}</h1>

      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4">
        <Input
          type="text"
          placeholder={t('searchSuppliers')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="mr-2 h-4 w-4" />
          {t('search')}
        </Button>
      </div>

      {/* Category ComboBox */}
      <ComboBox
        items={categoryOptions}
        placeholder="Select Category"
        value={selectedCategory}
        onValueChange={handleCategoryChange}
        className="mb-4"
      />

      {loading ? (
        <p>{t('loading')}</p>
      ) : (
        <ScrollArea className="rounded-md border p-2 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                id={supplier.id}
                name={supplier.name}
                category={supplier.category}
                rating={supplier.rating}
                location={supplier.location}
                phone={supplier.phone}
                email={supplier.email}
                products={supplier.products}
                avatar={supplier.avatar}
                // Don't pass user_id, it's not needed by SupplierCard
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default SuppliersPage;
