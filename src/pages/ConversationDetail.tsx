
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWindow from '@/components/conversation/ChatWindow';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const ConversationDetail = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
      return;
    }

    const fetchConversation = async () => {
      if (!conversationId || !user) return;

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            user_id,
            fournisseur_id,
            user:user_id (id, name, avatar),
            fournisseur:fournisseur_id (id, name, avatar)
          `)
          .eq('id', conversationId)
          .single();

        if (error) throw error;
        
        if (!data) {
          toast.error('Conversation non trouvée');
          navigate('/conversations');
          return;
        }

        // Check if the current user is part of this conversation
        if (data.user_id !== user.id && data.fournisseur_id !== user.id) {
          toast.error('Vous n\'avez pas accès à cette conversation');
          navigate('/conversations');
          return;
        }

        // Determine the other user
        if (data.user_id === user.id) {
          setOtherUser(data.fournisseur);
        } else {
          setOtherUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
        toast.error('Erreur lors du chargement de la conversation');
        navigate('/conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId, user, isAuthenticated, isLoading, navigate]);

  if (isLoading || loading || !user || !otherUser) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-agri-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-6 flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-4 hidden md:flex"
            onClick={() => navigate('/conversations')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <h1 className="font-display text-xl md:text-2xl font-bold">
            Conversation avec {otherUser.name}
          </h1>
        </div>
        
        {conversationId && (
          <ChatWindow 
            conversationId={conversationId}
            currentUser={user}
            otherUser={otherUser}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ConversationDetail;
