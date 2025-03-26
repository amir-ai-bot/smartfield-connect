import { useState, useEffect, useRef } from 'react';
import { User } from '@/types/auth';
import { getMessages, sendMessage, markMessagesAsRead } from '@/services/authService';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define Message type
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

interface ChatWindowProps {
  conversationId: string;
  currentUser: User;
  otherUser: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

const ChatWindow = ({ conversationId, currentUser, otherUser }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getMessages(conversationId);
        // Cast the data to Message[] to avoid type errors
        setMessages(data as unknown as Message[]);
        
        // Mark messages as read
        await markMessagesAsRead(conversationId, currentUser.id);
        
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Erreur lors du chargement des messages');
      }
    };

    fetchMessages();

    // Set up real-time subscription to new messages
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async (payload) => {
        // Fetch new messages to keep the message format consistent
        const data = await getMessages(conversationId);
        // Cast the data to Message[] to avoid type errors
        setMessages(data as unknown as Message[]);
        
        // Mark messages as read if we're currently viewing the conversation
        await markMessagesAsRead(conversationId, currentUser.id);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, currentUser.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (initialLoadComplete && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, initialLoadComplete]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    
    try {
      await sendMessage(conversationId, currentUser.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageBubble = (message: Message, isCurrentUser: boolean) => (
    <div 
      key={message.id}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={otherUser.avatar || undefined} alt={otherUser.name} />
          <AvatarFallback className="bg-agri-green-100 text-agri-green-700">
            {otherUser.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={`max-w-[75%] px-4 py-2 rounded-lg ${
          isCurrentUser 
            ? 'bg-agri-green-500 text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}
      >
        <div className="text-sm">{message.content}</div>
        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-green-100' : 'text-gray-500'}`}>
          {timeAgo(message.created_at)}
          {isCurrentUser && (
            <span className="ml-2">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
      
      {isCurrentUser && (
        <Avatar className="h-8 w-8 ml-2">
          <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
          <AvatarFallback className="bg-agri-green-100 text-agri-green-700">
            {currentUser.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );

  return (
    <div className="bg-white border rounded-lg shadow-sm h-[60vh] md:h-[70vh] flex flex-col">
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Commencez la conversation en envoyant un message...
          </div>
        ) : (
          <>
            {messages.map((message) => 
              renderMessageBubble(message, message.sender_id === currentUser.id)
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </ScrollArea>
      
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            className="resize-none"
            rows={2}
          />
          <Button 
            onClick={handleSend} 
            disabled={sending || !newMessage.trim()}
            className="bg-agri-green-500 hover:bg-agri-green-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
