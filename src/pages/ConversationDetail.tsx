
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getMessages, clearConversationHistory } from '@/services/conversationService';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trash2, MoreVertical } from 'lucide-react';
import ChatWindow from '@/components/conversation/ChatWindow';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ConversationDetail = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    document.title = 'Conversation | AgriSmart';
    
    const fetchConversationDetails = async () => {
      if (!conversationId || !user) return;
      
      try {
        setLoading(true);
        
        // Fetch the conversation to determine the other participant
        const { data: conversation, error } = await supabase
          .from('conversations')
          .select(`
            user_id,
            fournisseur_id,
            user:user_id (id, name, avatar),
            fournisseur:fournisseur_id (id, name, avatar)
          `)
          .eq('id', conversationId)
          .single();
          
        if (error) {
          throw new Error(error.message);
        }
        
        // Determine which participant is the "other" user
        const isCurrentUserFournisseur = conversation.fournisseur_id === user.id;
        setOtherUser(isCurrentUserFournisseur ? conversation.user : conversation.fournisseur);
      } catch (error) {
        console.error('Error fetching conversation details:', error);
        toast.error('Erreur lors du chargement de la conversation');
        navigate('/conversations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversationDetails();
  }, [conversationId, user, navigate]);
  
  const handleClearConversation = async () => {
    if (!conversationId || !user) return;
    
    try {
      await clearConversationHistory(conversationId, user.id);
      // Refresh the page or refetch messages
      window.location.reload();
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 pb-20 md:pb-8 mt-16">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/conversations')}
            className="mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour aux conversations
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-red-600 cursor-pointer"
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer la conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {!loading && user && otherUser && conversationId && (
          <ChatWindow 
            conversationId={conversationId}
            currentUser={user}
            otherUser={otherUser}
          />
        )}
        
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Effacer la conversation</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir effacer cette conversation ? 
                Cette action ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearConversation} className="bg-red-600">
                Effacer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ConversationDetail;
