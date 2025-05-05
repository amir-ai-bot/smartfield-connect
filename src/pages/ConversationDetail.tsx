
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getConversation, 
  getConversationMessages, 
  sendMessage,
  markMessagesAsRead
} from '@/services/conversationService';
import { toast } from 'sonner';

// Define missing types
interface ParticipantProfile {
  id: string;
  name: string;
  avatar?: string;
}

interface ConversationData {
  id: string;
  participant: ParticipantProfile;
  lastMessageAt: string;
  createdAt: string;
  userId: string;
}

interface MessageData {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read?: boolean;
}

const ConversationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id && user) {
      fetchConversation();
    }
  }, [id, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    setLoading(true);
    try {
      if (!id || !user) {
        toast.error('Invalid conversation or user');
        return;
      }
      
      const conversationData = await getConversation(id, user.id);
      setConversation(conversationData);
      
      const messagesData = await getConversationMessages(id);
      setMessages(messagesData);
      
      // Mark messages as read
      await markMessagesAsRead(id, user.id);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !conversation) return;
    
    setSending(true);
    try {
      await sendMessage(
        conversation.id,
        user.id,
        conversation.participant.id,
        newMessage
      );
      
      setNewMessage('');
      await fetchConversation(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>Conversation Detail</div> // Placeholder return
  );
};

export default ConversationDetail;
