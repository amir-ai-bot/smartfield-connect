
import { useState, useEffect } from 'react';
import { getUserConversations } from '@/services/conversationService'; 
import { User } from '@/types/auth';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ConversationListProps {
  currentUser: User;
  filterUnread?: boolean;
}

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  user: { name: string; avatar: string | null };
  fournisseur: { name: string; avatar: string | null };
  user_id: string;
  fournisseur_id: string;
  unreadCount?: number;
}

const ConversationList = ({ currentUser, filterUnread = false }: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getUserConversations(currentUser.id);
        
        // Cast the data to the correct type to avoid type errors
        let conversationsData = data as unknown as Conversation[];
        
        // Filter for unread messages if specified
        if (filterUnread) {
          conversationsData = conversationsData.filter(conv => 
            conv.unreadCount && conv.unreadCount > 0
          );
        }
        
        setConversations(conversationsData);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    
    // Subscribe to conversation changes
    const channel = supabase
      .channel('public:conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, () => {
        // Refresh the conversations list when changes occur
        fetchConversations();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id, filterUnread]);

  const getOtherParty = (conversation: Conversation) => {
    if (conversation.user_id === currentUser.id) {
      return conversation.fournisseur;
    }
    return conversation.user;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-agri-green-500" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <p className="text-gray-500 mb-4">
          {filterUnread 
            ? "Vous n'avez pas de messages non lus." 
            : "Vous n'avez pas encore de conversations."}
        </p>
        {!filterUnread && (
          <Button 
            onClick={() => navigate('/suppliers')}
            className="bg-agri-green-500 hover:bg-agri-green-600"
          >
            Trouver des fournisseurs
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => {
        const otherParty = getOtherParty(conversation);
        
        return (
          <Card 
            key={conversation.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/conversations/${conversation.id}`)}
          >
            <CardContent className="p-4 flex items-center">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={otherParty.avatar || undefined} alt={otherParty.name} />
                <AvatarFallback className="bg-agri-green-100 text-agri-green-700">
                  {otherParty.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{otherParty.name}</h3>
                  <span className="text-xs text-gray-500">
                    {timeAgo(conversation.updated_at)}
                  </span>
                </div>
                
                {conversation.unreadCount ? (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600 truncate">
                      Nouveaux messages
                    </span>
                    <Badge className="bg-agri-green-500">
                      {conversation.unreadCount}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-sm text-gray-600">
                    Voir la conversation
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ConversationList;
