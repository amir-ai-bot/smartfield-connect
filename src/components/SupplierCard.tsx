
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, Mail, MapPin } from 'lucide-react';

type SupplierCardProps = {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  phone: string;
  email: string;
  products: string[];
  image: string;
};

const SupplierCard = ({ 
  id, name, category, rating, location, phone, email, products, image 
}: SupplierCardProps) => {
  // Convert rating to an array for rendering stars
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating));
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full">
      <div className="relative p-5 pb-3">
        <div className="flex items-center">
          <div className="h-14 w-14 rounded-full overflow-hidden mr-4 border-2 border-agri-green-100">
            <img 
              src={image} 
              alt={name} 
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          
          <div>
            <h3 className="font-display text-lg font-semibold">{name}</h3>
            <div className="flex items-center">
              <Badge variant="outline" className="bg-agri-blue-50 text-agri-blue-700 border-agri-blue-200 mr-2 text-xs">
                {category}
              </Badge>
              <div className="flex">
                {stars.map((filled, i) => (
                  <Star 
                    key={i} 
                    className={`h-3.5 w-3.5 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
                <span className="text-xs text-gray-600 ml-1">{rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3 flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span>{location}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            <span>{phone}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{email}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Produits:</p>
          <div className="flex flex-wrap gap-1">
            {products.map((product, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
              >
                {product}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3 border-t border-gray-100 flex justify-between mt-auto">
        <Button variant="outline" size="sm" className="text-gray-700 flex-1 mr-2">
          Message
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          className="bg-agri-green-500 hover:bg-agri-green-600 text-white flex-1"
        >
          Contacter
        </Button>
      </div>
    </div>
  );
};

export default SupplierCard;
