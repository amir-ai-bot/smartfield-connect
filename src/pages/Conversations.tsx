
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserConversations } from '@/services/conversationService';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessageAt: string;
}

const Conversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (user) {
        try {
          const data = await getUserConversations(user.id);
          setConversations(data);
        } catch (error) {
          console.error('Error fetching conversations:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchConversations();
  }, [user]);

  if (loading) {
    return <div>Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
        <p className="text-gray-500 mb-4">Start chatting with suppliers to see conversations here.</p>
        <Link to="/suppliers" className="text-blue-500 hover:underline">
          Browse Suppliers
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Conversations</h1>
      <div className="space-y-3">
        {conversations.map((conversation) => (
          <Link key={conversation.id} to={`/messages/${conversation.id}`}>
            <Card className="hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={conversation.participant.avatar || ''} />
                    <AvatarFallback>
                      {conversation.participant.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{conversation.participant.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">
                      {conversation.lastMessageAt
                        ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
                        : 'No messages yet'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Conversations;
