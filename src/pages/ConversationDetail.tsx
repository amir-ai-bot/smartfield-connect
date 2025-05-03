import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { isFournisseurFavorite, toggleFavoriteFournisseur, getConversation, getMessages, markMessagesAsRead, sendMessage } from '@/services/conversationService';
import RatingDialog from '@/components/conversation/RatingDialog';

interface ParticipantProfile {
  id?: string;
  name?: string;
  avatar?: string;
  email?: string;
  role?: string;
  display_name?: string;
}

interface ConversationData {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at?: string;
  created_at?: string;
  participant1?: ParticipantProfile;
  participant2?: ParticipantProfile;
  participant1Profile?: ParticipantProfile;
  participant2Profile?: ParticipantProfile;
}

const ConversationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  useEffect(() => {
    document.title = 'Conversation | AgriSmart';
    if (!user) return;
    if (!id) {
      navigate('/conversations');
      return;
    }

    loadConversation();
  }, [id, user]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      if (!user || !id) return;

      const conversationData = await getConversation(id, user.id);
      if (!conversationData) {
        toast.error('Conversation non trouvée');
        navigate('/conversations');
        return;
      }

      // Create a clean conversation object with proper typing
      const cleanConversation: ConversationData = {
        id: conversationData.id,
        participant1_id: conversationData.participant1_id,
        participant2_id: conversationData.participant2_id,
        last_message_at: conversationData.last_message_at,
        created_at: conversationData.created_at,
        // Convert potentially problematic fields to safe ParticipantProfile objects
        participant1: conversationData.participant1 && typeof conversationData.participant1 === 'object' ? {
          id: conversationData.participant1.id || '',
          name: conversationData.participant1.display_name || conversationData.participant1.name || 'Unknown',
          avatar: conversationData.participant1.avatar || undefined,
          email: conversationData.participant1.email || undefined,
          role: conversationData.participant1.role || undefined,
          display_name: conversationData.participant1.display_name || undefined
        } : {},
        participant2: conversationData.participant2 && typeof conversationData.participant2 === 'object' ? {
          id: conversationData.participant2.id || '',
          name: conversationData.participant2.display_name || conversationData.participant2.name || 'Unknown',
          avatar: conversationData.participant2.avatar || undefined,
          email: conversationData.participant2.email || undefined,
          role: conversationData.participant2.role || undefined,
          display_name: conversationData.participant2.display_name || undefined
        } : {}
      };

      setConversation(cleanConversation);

      // Determine if the other user is a supplier to check favorites
      const otherParticipant = user.id === cleanConversation.participant1_id 
        ? cleanConversation.participant2 
        : cleanConversation.participant1;
      
      const isSupplier = otherParticipant && otherParticipant.role === 'fournisseur';

      if (isSupplier && otherParticipant && otherParticipant.id) {
        const favoriteStatus = await isFournisseurFavorite(user.id, otherParticipant.id);
        setIsFavorite(favoriteStatus);
      }

      const messagesData = await getMessages(id);
      setMessages(messagesData || []);

      // Mark messages as read
      if (messagesData && messagesData.length > 0) {
        await markMessagesAsRead(id, user.id);
      }
      
      setLoading(false);

      // Scroll to bottom after messages load
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Erreur lors du chargement de la conversation');
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBack = () => {
    navigate('/conversations');
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !id) return;
    
    try {
      setSending(true);
      const newMessage = await sendMessage(id, messageText, user.id);
      if (newMessage) {
        setMessages([...messages, newMessage]);
        setMessageText('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !conversation) return;
    
    try {
      const otherParticipantId = conversation.participant1_id === user.id ? 
        conversation.participant2_id : 
        conversation.participant1_id;
        
      const result = await toggleFavoriteFournisseur(user.id, otherParticipantId);
      
      if (result && typeof result === 'object' && 'isFavorite' in result) {
        setIsFavorite(result.isFavorite);
        toast.success(result.isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris');
      } else {
        // Handle case when result is just a boolean
        setIsFavorite(!!result);
        toast.success(!!result ? 'Ajouté aux favoris' : 'Retiré des favoris');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erreur lors de la modification des favoris');
    }
  };

  const handleShowRating = () => {
    setShowRatingDialog(true);
  };

  // Helper function to format dates
  const formatMessageDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  const getOtherUser = (): ParticipantProfile | null => {
    if (!conversation || !user) return null;
    
    if (conversation.participant1_id === user.id) {
      return conversation.participant2 || null;
    } else {
      return conversation.participant1 || null;
    }
  };

  const otherUser = getOtherUser();
  const isSupplier = otherUser?.role === 'fournisseur';
  
  if (!user) {
    return <div className="text-center py-8">Please log in to view conversations.</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-agri-green-500" />
      </div>
    );
  }

  return (
    
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {otherUser && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherUser.avatar || ''} alt={otherUser.name || otherUser.display_name || ''} />
                  <AvatarFallback>{(otherUser.name || otherUser.display_name || '?').charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">{otherUser.name || otherUser.display_name}</h2>
                  <p className="text-sm text-gray-500">{otherUser.email}</p>
                </div>
              </div>
            )}
            
            <div className="ml-auto space-x-2">
              {isSupplier && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleShowRating}
                    className="hidden sm:inline-flex"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Évaluer
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleFavorite}
                    className={isFavorite ? "text-yellow-500" : ""}
                  >
                    <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-500" : ""}`} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Messages */}
      <Card className="mb-4 mt-2">
        <CardContent className="p-4">
          <div className="h-[calc(70vh-200px)] overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md md:max-w-lg rounded-lg p-3 ${
                      message.sender_id === user.id
                        ? 'bg-agri-green-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === user.id ? 'text-agri-green-100' : 'text-gray-500'
                    }`}>
                      {formatMessageDate(message.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                Aucun message. Commencez la conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>
      
      {/* Message input */}
      <div className="flex items-end space-x-2">
        <Textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Tapez votre message..."
          className="flex-1 resize-none"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={sending || !messageText.trim()}
          className="bg-agri-green-500 hover:bg-agri-green-600"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
      
      {isSupplier && otherUser && conversation && (
        <RatingDialog
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          userId={user.id}
          fournisseurId={conversation.participant1_id === user.id ? conversation.participant2_id : conversation.participant1_id}
          fournisseurName={otherUser.name || otherUser.display_name || 'Fournisseur'}
          onRatingSubmitted={loadConversation}
        />
      )}
    </div>
  );
};

export default ConversationDetail;
