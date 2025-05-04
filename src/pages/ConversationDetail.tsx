
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getConversationById, 
  getConversationMessages, 
  sendMessage, 
  markMessagesAsRead, 
  ConversationData, 
  MessageData,
  ParticipantProfile
} from '@/services/conversationService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Send, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const ConversationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Determine other user (not the current user)
  const otherUser = conversation && user ? (
    user.id === conversation.participant1_id 
      ? conversation.participant2 
      : conversation.participant1
  ) : null;

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load conversation and messages
  useEffect(() => {
    const loadConversation = async () => {
      if (!id || !user) return;
      
      setLoading(true);
      try {
        const conversationData = await getConversationById(id);
        if (!conversationData) {
          toast.error('Conversation not found');
          return;
        }
        
        setConversation(conversationData);
        
        // Load messages
        const messagesData = await getConversationMessages(id);
        setMessages(messagesData);
        
        // Mark messages as read
        await markMessagesAsRead(id, user.id);
      } catch (error) {
        console.error('Error loading conversation:', error);
        toast.error('Error loading conversation');
      } finally {
        setLoading(false);
      }
    };
    
    loadConversation();
  }, [id, user]);

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !conversation || !otherUser) return;
    
    setSendingMessage(true);
    try {
      const sentMessage = await sendMessage(
        user.id,
        otherUser.id,
        conversation.id,
        newMessage.trim()
      );
      
      if (sentMessage) {
        // Add sender profile to the message for display
        const messageWithSender = {
          ...sentMessage,
          sender: {
            id: user.id,
            display_name: user.name || '',
            avatar: user.avatar || null,
            email: user.email || '',
            role: user.role || '',
            name: user.name || ''
          } as ParticipantProfile
        };
        
        setMessages([...messages, messageWithSender]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  if (!conversation || !user) {
    return <div className="text-center p-4">Conversation not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <Link to="/conversations" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Conversations
        </Link>
      </div>
      
      {otherUser && (
        <div className="flex items-center mb-4 p-3 bg-white rounded-lg shadow">
          <Avatar className="h-12 w-12 mr-3">
            {otherUser.avatar ? (
              <AvatarImage src={otherUser.avatar} alt={otherUser.display_name || 'User'} />
            ) : (
              <AvatarFallback>
                {(otherUser.display_name || otherUser.name || 'U').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">
              {otherUser.display_name || otherUser.name || 'Unnamed User'}
            </h2>
            {otherUser.role === 'fournisseur' && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                Fournisseur
              </span>
            )}
          </div>
        </div>
      )}
      
      <Card className="mb-4">
        <CardContent className="p-0">
          <div className="h-[60vh] overflow-y-auto p-4">
            {messages.length > 0 ? (
              messages.map((msg) => {
                const isCurrentUser = msg.sender_id === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isCurrentUser && msg.sender && (
                      <Avatar className="h-8 w-8 mr-2">
                        {msg.sender.avatar ? (
                          <AvatarImage src={msg.sender.avatar} alt={msg.sender.display_name || 'User'} />
                        ) : (
                          <AvatarFallback>
                            {(msg.sender.display_name || 'U').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                    
                    <div
                      className={`rounded-lg p-3 max-w-[70%] ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.created_at && format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                    
                    {isCurrentUser && (
                      <Avatar className="h-8 w-8 ml-2">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.name || 'You'} />
                        ) : (
                          <AvatarFallback>
                            {(user.name || 'U').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 my-10">
                No messages yet. Start the conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <Separator />
          
          <form onSubmit={handleSendMessage} className="p-4 flex">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="mr-2"
              disabled={sendingMessage}
            />
            <Button type="submit" disabled={!newMessage.trim() || sendingMessage}>
              {sendingMessage ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending
                </span>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationDetail;
