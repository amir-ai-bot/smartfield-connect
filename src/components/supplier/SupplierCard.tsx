import { useNavigate } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';
import { createConversation } from '@/services/messageService';
import { toast } from 'sonner';
import { useState } from 'react';

interface SupplierCardProps {
  supplier: {
    id: string;
    user_id: string;
    name: string;
    category: string;
    rating: number;
    location: string;
    products: string[];
    avatar: string;
  };
}

export default function SupplierCard({ supplier }: SupplierCardProps) {
  const navigate = useNavigate();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleMessage = async () => {
    console.log('Current session:', session);
    console.log('Supplier data:', supplier);
    
    if (!session) {
      toast.error('Vous devez être connecté pour envoyer un message');
      return;
    }

    if (!supplier.user_id) {
      console.error('Missing supplier user_id:', supplier);
      toast.error('Ce fournisseur n\'est pas disponible pour les messages');
      return;
    }

    if (supplier.user_id === session.user.id) {
      toast.error('Vous ne pouvez pas vous envoyer un message');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Attempting to create conversation between:', {
        userId: session.user.id,
        supplierId: supplier.user_id
      });
      // Create or get existing conversation
      const conversationId = await createConversation(session.user.id, supplier.user_id);
      console.log('Conversation created/found:', conversationId);
      // Navigate to messages page
      navigate(`/messages?conversation=${conversationId}`);
    } catch (error) {
      console.error('Detailed error in handleMessage:', error);
      toast.error('Erreur lors de la création de la conversation. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {supplier.avatar ? (
              <img
                src={supplier.avatar}
                alt={supplier.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xl">
                  {supplier.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{supplier.name}</h3>
              <p className="text-sm text-gray-500">{supplier.category}</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-yellow-400">{'★'.repeat(Math.round(supplier.rating))}</span>
            <span className="text-gray-300">{'★'.repeat(5 - Math.round(supplier.rating))}</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Localisation:</span> {supplier.location}
          </p>
          {supplier.products && supplier.products.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900">Produits:</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {supplier.products.map((product, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleMessage}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </>
            ) : (
              'Envoyer un message'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 