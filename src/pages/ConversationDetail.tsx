import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Paperclip, Mic, Send, Star, Heart, Image as ImageIcon, Plus, X, Star as StarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { isFournisseurFavorite, toggleFavoriteFournisseur, getConversation, getConversationMessages, sendMessage, markMessagesAsRead } from '@/services/conversationService';
import RatingDialog from '@/components/conversation/RatingDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConversationDetail = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [conversation, setConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const loadConversationData = async () => {
    if (!user || !conversationId) return;
    
    try {
      setIsLoading(true);
      
      // Get conversation details
      const conversationData = await getConversation(conversationId, user.id);
      setConversation(conversationData);
      
      // Set other participant
      const otherParticipantData = conversationData.otherParticipant;
      setOtherParticipant(otherParticipantData);
      
      // Get messages
      const messagesData = await getConversationMessages(conversationId, user.id);
      setMessages(messagesData);
      
      // Check if other participant is a fournisseur and in favorites
      if (otherParticipantData?.role === 'fournisseur') {
        const favoriteStatus = await isFournisseurFavorite(user.id, otherParticipantData.id);
        setIsFavorite(favoriteStatus);
      }
      
      // Mark messages as read
      await markMessagesAsRead(conversationId, user.id);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Erreur lors du chargement de la conversation');
      navigate('/conversations');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load conversation data on mount
  useEffect(() => {
    if (user) {
      loadConversationData();
    }
    
    document.title = 'Conversation | AgriSmart';
    
    // Set up polling for new messages
    const intervalId = setInterval(() => {
      if (user && conversationId) {
        getConversationMessages(conversationId, user.id)
          .then(newMessages => {
            if (newMessages.length > messages.length) {
              setMessages(newMessages);
            }
          })
          .catch(error => console.error('Error polling messages:', error));
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [user, conversationId, navigate]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        setRecordingTime(0);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);
  
  const handleSendMessage = async () => {
    if (!user || !conversationId || (!newMessage.trim() && !selectedFile)) return;
    
    try {
      setIsSending(true);
      
      // Send the message with optional file
      await sendMessage(
        conversationId, 
        newMessage.trim() || (selectedFile ? 'A envoyé un fichier' : 'A envoyé un message vocal'), 
        user.id,
        selectedFile,
        selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'document') : undefined
      );
      
      // Clear input and reload messages
      setNewMessage('');
      setSelectedFile(null);
      
      // Reload messages
      const updatedMessages = await getConversationMessages(conversationId, user.id);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleBackClick = () => {
    navigate('/conversations');
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux. Limite: 5MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };
  
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(prev => [...prev, e.data]);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Convert blob to File
        const audioFile = new File([audioBlob], 'voice-message.webm', { 
          type: 'audio/webm', 
          lastModified: Date.now() 
        });
        
        try {
          setIsSending(true);
          
          // Send the audio message
          await sendMessage(
            conversationId as string, 
            'Message vocal', 
            user?.id as string,
            audioFile,
            'audio'
          );
          
          // Reload messages
          const updatedMessages = await getConversationMessages(conversationId as string, user?.id as string);
          setMessages(updatedMessages);
        } catch (error) {
          console.error('Error sending audio message:', error);
          toast.error('Erreur lors de l\'envoi du message vocal');
        } finally {
          setIsSending(false);
          setAudioChunks([]);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Impossible d\'accéder au microphone');
    }
  };
  
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  const handleToggleFavorite = async () => {
    if (!user || !otherParticipant) return;
    
    try {
      setIsTogglingFavorite(true);
      const result = await toggleFavoriteFournisseur(user.id, otherParticipant.id);
      setIsFavorite(result.isFavorite);
      
      toast.success(
        result.isFavorite 
          ? `${otherParticipant.name} ajouté aux favoris` 
          : `${otherParticipant.name} retiré des favoris`
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erreur lors de la mise à jour des favoris');
    } finally {
      setIsTogglingFavorite(false);
    }
  };
  
  // Format time (for voice recording display)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const removeSelectedFile = () => {
    setSelectedFile(null);
  };
  
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm', { locale: fr });
  };
  
  const formatMessageDate = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Today
    if (messageDate.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }
    
    // Yesterday
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Hier";
    }
    
    // Other days
    return format(messageDate, 'EEEE d MMMM', { locale: fr });
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: {date: string, messages: any[]}[] = [];
    let currentDate = '';
    let currentGroup: any[] = [];
    
    messages.forEach(message => {
      const messageDate = formatMessageDate(message.created_at);
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: currentGroup
          });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({
        date: currentDate,
        messages: currentGroup
      });
    }
    
    return groups;
  };
  
  const renderMediaContent = (media: any) => {
    if (!media) return null;
    
    switch (media.media_type) {
      case 'image':
        return (
          <a href={media.media_url} target="_blank" rel="noopener noreferrer">
            <img 
              src={media.media_url} 
              alt="Image" 
              className="rounded-lg max-h-60 object-contain cursor-pointer"
            />
          </a>
        );
      case 'audio':
        return (
          <audio controls className="max-w-full">
            <source src={media.media_url} type="audio/webm" />
            Votre navigateur ne supporte pas l'élément audio.
          </audio>
        );
      case 'document':
        return (
          <a 
            href={media.media_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <Paperclip className="h-4 w-4" />
            <span>Voir le document</span>
          </a>
        );
      default:
        return null;
    }
  };
  
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agri-green-500"></div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-16 pb-16 flex flex-col h-[calc(100vh-4rem)] max-w-screen-md">
        {/* Conversation header */}
        <div className="bg-white shadow-sm py-3 px-4 flex items-center sticky top-16 z-10 border-b rounded-t-lg">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-2"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={otherParticipant?.avatar} alt={otherParticipant?.name} />
            <AvatarFallback>{otherParticipant?.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold">{otherParticipant?.name}</h3>
            <p className="text-xs text-gray-500">
              {otherParticipant?.role === 'fournisseur' ? 'Fournisseur' : 'Utilisateur'}
            </p>
          </div>
          
          {otherParticipant?.role === 'fournisseur' && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRatingDialog(true)}
                title="Évaluer ce fournisseur"
              >
                <Star className="h-5 w-5 text-yellow-500" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
                title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              </Button>
            </div>
          )}
        </div>
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto py-4 px-2 bg-gray-50">
          {groupMessagesByDate().map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-200 text-gray-600 text-xs py-1 px-3 rounded-full">
                  {group.date}
                </div>
              </div>
              
              {group.messages.map((message, index) => {
                const isCurrentUser = message.sender_id === user.id;
                return (
                  <div 
                    key={message.id}
                    className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarImage 
                          src={otherParticipant?.avatar} 
                          alt={otherParticipant?.name} 
                        />
                        <AvatarFallback>
                          {otherParticipant?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[70%] ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                      <div 
                        className={`rounded-lg px-4 py-2 inline-block ${
                          isCurrentUser 
                            ? 'bg-agri-green-500 text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                        }`}
                      >
                        <p className={`text-sm ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
                          {message.content}
                        </p>
                        
                        {/* Render media if any */}
                        {message.media && message.media.map((mediaItem: any, mediaIndex: number) => (
                          <div key={mediaIndex} className="mt-2">
                            {renderMediaContent(mediaItem)}
                          </div>
                        ))}
                        
                        <div className={`text-xs mt-1 text-right ${isCurrentUser ? 'text-white/80' : 'text-gray-500'}`}>
                          {formatMessageTime(message.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
              <p>Aucun message. Commencez la conversation !</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <Card className="mt-auto border-t rounded-b-lg">
          <CardContent className="p-3">
            {selectedFile && (
              <div className="mb-3 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  {selectedFile.type.startsWith('image/') ? (
                    <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />
                  ) : (
                    <Paperclip className="h-4 w-4 mr-2 text-blue-500" />
                  )}
                  <span className="text-sm truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={removeSelectedFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {isRecording ? (
              <div className="flex items-center">
                <div className="flex-1 p-3 bg-gray-100 rounded-l-lg flex items-center">
                  <div className="animate-pulse h-3 w-3 rounded-full bg-red-500 mr-3"></div>
                  <span className="text-red-500 font-medium">Enregistrement: {formatTime(recordingTime)}</span>
                </div>
                <Button 
                  className="rounded-l-none bg-red-500 hover:bg-red-600"
                  onClick={handleStopRecording}
                >
                  <div className="h-3 w-3 rounded-sm bg-white"></div>
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                
                <Textarea 
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 min-h-0 h-10 py-2.5"
                  disabled={isSending || isRecording}
                />
                
                {newMessage.trim() || selectedFile ? (
                  <Button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={isSending}
                    className="bg-agri-green-500 hover:bg-agri-green-600"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleStartRecording}
                    disabled={isSending}
                    className="bg-agri-green-500 hover:bg-agri-green-600"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Rating dialog */}
      {otherParticipant && (
        <RatingDialog
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          userId={user.id}
          fournisseurId={otherParticipant.id}
          fournisseurName={otherParticipant.name}
        />
      )}
    </div>
  );
};

export default ConversationDetail;
