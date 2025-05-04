
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserConversations } from '@/services/conversationService';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ConversationData } from '@/types/auth';

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessageAt: string;
  createdAt: string;
}

const ConversationList: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadConversations = async () => {
      if (user) {
        setLoading(true);
        try {
          const data = await getUserConversations(user.id);
          // Transform the data to match the Conversation type
          const formattedConversations: Conversation[] = data.map((conv: any) => ({
            id: conv.id,
            participant: {
              id: conv.participant?.id || '',
              name: conv.participant?.name || 'Unknown',
              avatar: conv.participant?.avatar,
            },
            lastMessageAt: conv.lastMessageAt || conv.last_message_at || new Date().toISOString(),
            createdAt: conv.createdAt || conv.created_at || new Date().toISOString(),
          }));
          setConversations(formattedConversations);
        } catch (error) {
          console.error('Error loading conversations:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadConversations();
  }, [user]);

  const navigateToSuppliers = () => {
    navigate('/suppliers');
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">Please log in to see your conversations.</p>
        <Link to="/login" className="text-blue-600 hover:underline">
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="p-4">Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">You have no conversations yet.</p>
        <Button onClick={navigateToSuppliers}>Browse Suppliers</Button>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          to={`/messages/${conversation.id}`}
          className="flex items-center p-4 hover:bg-gray-50 transition-colors"
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={conversation.participant.avatar || ''} />
            <AvatarFallback>{conversation.participant.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <p className="font-medium truncate">{conversation.participant.name || 'Unknown'}</p>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {conversation.lastMessageAt
                  ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
                  : 'New'}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ConversationList;
