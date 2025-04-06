
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star } from 'lucide-react';
import { LoadingImage } from './ui/LoadingImage';

interface SupplierCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  phone?: string;
  products?: string[];
  avatar?: string;
  email?: string;
}

const SupplierCard = ({
  name,
  category,
  rating,
  location,
  products = [],
  avatar
}: SupplierCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="h-40 bg-gradient-to-r from-green-50 to-blue-50 relative">
        {avatar ? (
          <LoadingImage
            src={avatar}
            alt={name}
            className="w-full h-full object-cover"
            fallbackSrc="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-2xl font-bold text-gray-300">{name.charAt(0)}</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Badge className="bg-white text-gray-800">
            {category}
          </Badge>
          <Badge className="bg-yellow-400 text-gray-800 flex items-center">
            <Star className="h-3 w-3 mr-1 fill-current" />
            {rating.toFixed(1)}
          </Badge>
        </div>
        
        <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-full bg-white p-0.5 shadow-md">
          {avatar ? (
            <LoadingImage
              src={avatar}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-400">{name.charAt(0)}</span>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="pt-8 px-4 pb-4">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          
          <div className="flex items-center mt-1 text-sm text-gray-600">
            <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
            {location}
          </div>
        </div>
        
        {products && products.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-1">Produits et services:</p>
            <div className="flex flex-wrap gap-1">
              {products.slice(0, 3).map((product, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {product}
                </Badge>
              ))}
              {products.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-100">
                  +{products.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupplierCard;
