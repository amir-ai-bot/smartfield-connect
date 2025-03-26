
import { useState, useEffect, useRef } from 'react';
import { User } from '@/types/auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMessages, sendMessage, markMessagesAsRead } from '@/services/authService';
import { formatDate } from '@/lib/utils';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChatWindowProps {
  conversationId: string;
  currentUser: User;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_id: string;
  profiles: {
    name: string;
    avatar: string | null;
  };
}

const ChatWindow = ({ conversationId, currentUser, otherUser }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await getMessages(conversationId);
        setMessages(data);
        
        // Mark messages as read
        await markMessagesAsRead(conversationId, currentUser.id);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Erreur lors du chargement des messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        try {
          // When a new message comes in, fetch all messages again to get proper data structure
          const data = await getMessages(conversationId);
          setMessages(data);
          
          // If we receive a message, mark it as read
          if (payload.new.sender_id !== currentUser.id) {
            await markMessagesAsRead(conversationId, currentUser.id);
          }
        } catch (error) {
          console.error('Error updating messages:', error);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, currentUser.id]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      await sendMessage(conversationId, currentUser.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const groupMessagesByDate = () => {
    const groups: { [date: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = message.created_at.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <Card className="flex flex-col h-[80vh] shadow-lg">
      <CardHeader className="px-4 py-3 border-b flex-shrink-0">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-2 md:hidden"
            onClick={() => navigate('/conversations')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
            <AvatarFallback className="bg-agri-green-100 text-agri-green-700">
              {otherUser.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <CardTitle className="text-lg font-medium">{otherUser.name}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-3 flex-grow overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-agri-green-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p className="mb-2">Aucun message pour le moment</p>
            <p className="text-sm">Envoyez votre premier message pour démarrer la conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date} className="space-y-3">
                <div className="text-center">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                    {formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                
                {msgs.map(message => {
                  const isMyMessage = message.sender_id === currentUser.id;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start max-w-[70%]">
                        {!isMyMessage && (
                          <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                            <AvatarImage 
                              src={message.profiles?.avatar || undefined} 
                              alt={message.profiles?.name || 'User'} 
                            />
                            <AvatarFallback className="bg-agri-green-100 text-agri-green-700 text-xs">
                              {message.profiles?.name?.substring(0, 2).toUpperCase() || 'US'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`
                          py-2 px-3 rounded-lg 
                          ${isMyMessage 
                            ? 'bg-agri-green-500 text-white' 
                            : 'bg-gray-100 text-gray-800'}
                        `}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${isMyMessage ? 'text-green-100' : 'text-gray-500'}`}>
                            {new Date(message.created_at).toLocaleTimeString([], 
                              { hour: '2-digit', minute: '2-digit' }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </CardContent>
      
      <div className="p-3 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-grow mr-2"
            disabled={sending}
          />
          <Button 
            type="submit" 
            size="icon"
            className="bg-agri-green-500 hover:bg-agri-green-600"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ChatWindow;
