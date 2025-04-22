import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Paperclip, Mic, Send, Star, Heart, Image as ImageIcon, Plus, X, MessageSquare, ChevronUp, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { isFournisseurFavorite, toggleFavoriteFournisseur, getConversation, getConversationMessages, sendMessage, markMessagesAsRead } from '@/services/conversationService';
import RatingDialog from '@/components/conversation/RatingDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

const MESSAGES_CACHE_VERSION = 1;

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
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messagesHidden, setMessagesHidden] = useState(true);
  const [otherParticipant, setOtherParticipant] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollToBottomFlag = useRef(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Load only conversation and participant data first, without messages
  const loadConversationData = async () => {
    if (!user || !conversationId) return;
    
    try {
      setIsLoadingProfile(true);
      setLoadError(null); // Reset error state on new attempt
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout loading conversation data')), 8000);
      });
      
      // Race the conversation data fetch against the timeout
      const conversationData = await Promise.race([
        getConversation(conversationId),
        timeoutPromise
      ]) as any;
      
      console.log('Conversation data loaded:', conversationData);
      
      if (!conversationData) {
        // If no data, show a meaningful error and proceed anyway
        console.error('No conversation data returned');
        setLoadError('Données de conversation indisponibles');
        toast.error('Données de conversation incomplètes');
        // Still continue to show UI but with defaults
      }
      
      if (conversationData) {
        setConversation(conversationData);
        
        // Process conversation data to determine the other participant
        let otherParticipantData: any = null;
        
        // Determine if the user is the first participant or the second
        if (conversationData.user_id === user.id) {
          // User is the first participant, so other is the fournisseur
          otherParticipantData = conversationData.fournisseur || {
            id: conversationData.fournisseur_id,
            name: 'Fournisseur',
            role: 'fournisseur'
          };
        } else {
          // User is the second participant, so other is the first user
          otherParticipantData = conversationData.user || {
            id: conversationData.user_id,
            name: 'Utilisateur',
            role: 'user'
          };
        }
        
        console.log('Setting other participant:', otherParticipantData);
        setOtherParticipant(otherParticipantData);
        
        // Check if other participant is a fournisseur and in favorites
        if (otherParticipantData && otherParticipantData.role === 'fournisseur') {
          isFournisseurFavorite(user.id, otherParticipantData.id)
            .then(status => setIsFavorite(status))
            .catch(err => console.error('Error checking favorite status:', err));
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setLoadError('Erreur lors du chargement de la conversation');
      toast.error('Erreur lors du chargement de la conversation');
      
      // Even on error, let's proceed to show the interface with default values
      if (!otherParticipant) {
        setOtherParticipant({
          name: 'Contact',
          role: 'user',
          id: conversationId
        });
      }
    } finally {
      // Always set loading to false
      setIsLoadingProfile(false);
    }
  };
  
  // Get messages with caching - only called when user wants to see messages
  const fetchMessages = async (page: number = 1, append: boolean = false) => {
    if (!conversationId) return;
    
    if (messagesHidden) {
      setMessagesHidden(false);
    }
    
    try {
      if (page === 1 && !append) {
        setIsLoadingMessages(true);
      }
      
      const pageSize = 20;
      
      // Check cache first if it's the first page
      if (page === 1 && !append) {
        const cachedData = getCachedMessages();
        if (cachedData) {
          setMessages(cachedData);
          // Still fetch from server in background to ensure fresh data
        }
      }
      
      if (page > 1) {
        setIsLoadingMore(true);
        scrollToBottomFlag.current = false;
      }
      
      const result = await getConversationMessages(conversationId, page, pageSize);
      const messagesData = result.messages || [];
      const hasMore = result.hasMore || false;
      
      if (append) {
        setMessages(prev => [...messagesData, ...prev]);
      } else {
        setMessages(messagesData);
        // Cache first page
        if (page === 1) {
          cacheMessages(messagesData);
        }
      }
      
      setHasMoreMessages(hasMore);
      setCurrentPage(page);
      
      // Mark messages as read in the background
      markMessagesAsRead(conversationId, user?.id || '')
        .catch(err => console.error('Error marking messages as read:', err));
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (page === 1) toast.error('Erreur lors du chargement des messages');
    } finally {
      setIsLoadingMessages(false);
      setIsLoadingMore(false);
    }
  };
  
  // Cache messages in localStorage
  const cacheMessages = (messagesToCache: any[]) => {
    if (!conversationId || !messagesToCache.length) return;
    
    try {
      const cacheKey = `messages_${conversationId}_v${MESSAGES_CACHE_VERSION}`;
      localStorage.setItem(cacheKey, JSON.stringify(messagesToCache));
      
      // Set expiry (30 minutes)
      const expiryKey = `${cacheKey}_expiry`;
      const expiryTime = Date.now() + (30 * 60 * 1000);
      localStorage.setItem(expiryKey, expiryTime.toString());
    } catch (error) {
      console.error('Error caching messages:', error);
    }
  };
  
  // Get cached messages
  const getCachedMessages = () => {
    if (!conversationId) return null;
    
    try {
      const cacheKey = `messages_${conversationId}_v${MESSAGES_CACHE_VERSION}`;
      const expiryKey = `${cacheKey}_expiry`;
      
      const expiryTimeStr = localStorage.getItem(expiryKey);
      if (!expiryTimeStr) return null;
      
      const expiryTime = parseInt(expiryTimeStr, 10);
      if (Date.now() > expiryTime) {
        // Cache expired, clear it
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(expiryKey);
        return null;
      }
      
      const cachedData = localStorage.getItem(cacheKey);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Error retrieving cached messages:', error);
      return null;
    }
  };
  
  const loadMoreMessages = () => {
    if (isLoadingMore || !hasMoreMessages) return;
    fetchMessages(currentPage + 1, true);
  };
  
  // Set up WebSocket subscription - only if messages have been loaded
  useEffect(() => {
    if (!conversationId || !user || messagesHidden) return;
    
    try {
      // Subscribe to new messages
      const channel = supabase
        .channel(`conversation-${conversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, async (payload) => {
          try {
            // When a new message is received
            console.log('New message received via WebSocket:', payload);
            
            // Refresh the first page to get the latest messages
            await fetchMessages(1);
            
            // Mark as read in the background
            markMessagesAsRead(conversationId, user.id).catch(console.error);
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to conversation updates');
          } else {
            console.warn('Subscription status:', status);
          }
        });
      
      return () => {
        // Unsubscribe when component unmounts
        supabase.removeChannel(channel).catch(console.error);
      };
    } catch (error) {
      console.error('Error setting up WebSocket subscription:', error);
      // Fallback to polling if WebSocket fails
      const intervalId = setInterval(() => {
        if (user && conversationId && !messagesHidden) {
          fetchMessages(1).catch(console.error);
        }
      }, 10000);
      
      return () => clearInterval(intervalId);
    }
  }, [conversationId, user, messagesHidden]);
  
  useEffect(() => {
    if (user) {
      loadConversationData();
    }
    
    document.title = 'Conversation | AgriSmart';
    
    return () => {
      // Cleanup
    };
  }, [user, conversationId, navigate]);
  
  useEffect(() => {
    if (scrollToBottomFlag.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
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
    
    // If messages are still hidden, load them first
    if (messagesHidden) {
      await fetchMessages(1);
    }
    
    try {
      setIsSending(true);
      scrollToBottomFlag.current = true;
      
      // Send the message
      await sendMessage(
        conversationId, 
        newMessage.trim() || (selectedFile ? 'A envoyé un fichier' : 'A envoyé un message vocal'), 
        user.id
      );
      
      // Clear input and reload messages
      setNewMessage('');
      setSelectedFile(null);
      
      // Message will be received via WebSocket, or fetch as fallback
      if (messagesHidden) {
        await fetchMessages(1);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
      
      // Fallback to manual reload if WebSocket fails
      fetchMessages(1);
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
          scrollToBottomFlag.current = true;
          
          // Send the audio message using the correct function signature
          await sendMessage(
            conversationId as string, 
            'Message vocal', 
            user?.id as string
          );
          
          // Message will be received via WebSocket
        } catch (error) {
          console.error('Error sending audio message:', error);
          toast.error('Erreur lors de l\'envoi du message vocal');
          // Fallback to manual reload
          fetchMessages(1);
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
  
  // Added manual refresh function for the button
  const handleManualRefresh = () => {
    window.location.reload();
  };
  
  // Loading profile state
  if (isLoadingProfile || !user) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0c1317] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#00a884] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de la conversation...</p>
        </div>
      </div>
    );
  }
  
  // Emergency fallback if we don't have participant data but loading is done
  if (!otherParticipant && !isLoadingProfile) {
    // Still show UI with limited functionality
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0c1317]">
        <main className="container mx-auto px-4 pt-6 pb-16">
          {/* Header */}
          <div className="bg-[#202c33] py-3 px-4 flex items-center z-10 rounded-t-lg shadow-md">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2 text-gray-300 hover:bg-[#374248]"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback className="bg-[#6a7175] text-white">?</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold text-white">Contact</h3>
              <p className="text-xs text-gray-400">Conversation</p>
            </div>
          </div>
          
          {/* Error state */}
          <div className="h-[60vh] overflow-y-auto py-4 px-2 bg-[#0c1317]" style={{ backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4AQMAAAADqqSRAAAABlBMVEUAAAD///+l2Z/dAAAAAnRSTlP/AOW3MEoAAAA4SURBVFjD7cexCQAgDABBmFjBOQqOkKzdInIX+hQsHEYPiIiIiIiIiIiI/KCJ6Rp9Wu83qx8nPgAUKOrYOAAAAABJRU5ErkJggg==')" }}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center mb-6">
                <MessageSquare className="h-16 w-16 mb-4 opacity-30 text-[#00a884] mx-auto" />
                <p className="text-gray-400 mb-2">Impossible de charger les détails de la conversation</p>
                <p className="text-gray-500 text-sm mb-4">Essayez de recharger la page ou retournez à la liste des conversations</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-[#00a884] hover:bg-[#029676] text-white mr-2"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Recharger</span>
                </Button>
                <Button 
                  onClick={handleBackClick}
                  variant="outline"
                  className="text-gray-300 border-[#374248] hover:bg-[#374248] mt-2 sm:mt-0"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span>Retour</span>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0c1317]">
      <main className="container mx-auto px-4 pt-6 pb-16">
        {/* Header */}
        <div className="bg-[#202c33] py-3 px-4 flex items-center z-10 rounded-t-lg shadow-md">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-2 text-gray-300 hover:bg-[#374248]"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={otherParticipant?.avatar} alt={otherParticipant?.name} />
            <AvatarFallback className="bg-[#6a7175] text-white">{otherParticipant?.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-white">{otherParticipant?.name || 'Contact'}</h3>
            <p className="text-xs text-gray-400">
              {otherParticipant?.role === 'fournisseur' ? 'Fournisseur' : 'Utilisateur'}
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* Refresh button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleManualRefresh}
              className="text-gray-300 hover:bg-[#374248]"
              title="Rafraîchir la conversation"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            
            {otherParticipant?.role === 'fournisseur' && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-300 hover:bg-[#374248]"
                  disabled={isTogglingFavorite}
                  onClick={handleToggleFavorite}
                  title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  {isFavorite ? (
                    <Heart className="h-5 w-5 text-red-500 fill-current" />
                  ) : (
                    <Heart className="h-5 w-5" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-300 hover:bg-[#374248]"
                  onClick={() => setShowRatingDialog(true)}
                  title="Évaluer ce fournisseur"
                >
                  <Star className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Chat area with WhatsApp style background */}
        <div className="h-[60vh] overflow-y-auto py-4 px-2 bg-[#0c1317]" style={{ backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4AQMAAAADqqSRAAAABlBMVEUAAAD///+l2Z/dAAAAAnRSTlP/AOW3MEoAAAA4SURBVFjD7cexCQAgDABBmFjBOQqOkKzdInIX+hQsHEYPiIiIiIiIiIiI/KCJ6Rp9Wu83qx8nPgAUKOrYOAAAAABJRU5ErkJggg==')" }}>
          {/* Error state - show above all other states */}
          {loadError && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-red-900/70 text-white p-4 rounded-lg mb-4 max-w-md">
                <p className="text-center">{loadError}</p>
                <p className="text-center text-sm mt-2 text-gray-300">Veuillez rafraîchir la page pour réessayer</p>
              </div>
              <Button 
                onClick={handleManualRefresh}
                className="bg-[#00a884] hover:bg-[#029676] text-white mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Rafraîchir
              </Button>
            </div>
          )}
          
          {/* Loading state */}
          {isLoadingProfile && !loadError && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-600 border-t-[#00a884] mb-2"></div>
                <p className="text-gray-400">Chargement de la conversation...</p>
              </div>
            </div>
          )}
          
          {/* No error and not loading profile - show messages or message loading UI */}
          {!loadError && !isLoadingProfile && (
            <>
              {messagesHidden ? (
                // Show a placeholder with a button to load messages
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center mb-6">
                    <MessageSquare className="h-16 w-16 mb-4 opacity-30 text-[#00a884] mx-auto" />
                    <p className="text-gray-400 mb-2">Messages en mode hors ligne</p>
                    <p className="text-gray-500 text-sm mb-4">Économisez des données en chargeant les messages uniquement lorsque vous en avez besoin</p>
                  </div>
                  <Button 
                    onClick={() => fetchMessages(1)}
                    className="bg-[#00a884] hover:bg-[#029676] text-white"
                    disabled={isLoadingMessages}
                  >
                    {isLoadingMessages ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Chargement...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span>Charger les messages</span>
                      </div>
                    )}
                  </Button>
                </div>
              ) : isLoadingMessages ? (
                // Show loading skeleton for messages
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`flex mb-1 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${i % 2 === 0 ? 'order-1' : 'order-2'}`}>
                        <div className={`rounded-lg h-10 w-48 ${i % 2 === 0 ? 'bg-[#1e3932] ml-auto rounded-tr-none' : 'bg-[#131e24] rounded-tl-none'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Actual messages
                <>
                  {/* Load more button */}
                  {hasMoreMessages && (
                    <div className="text-center my-4">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={loadMoreMessages}
                        disabled={isLoadingMore}
                        className="text-xs text-gray-400 hover:bg-[#374248]"
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="h-3 w-3 rounded-full border-2 border-gray-400 border-t-[#00a884] animate-spin mr-2"></div>
                            Chargement...
                          </>
                        ) : (
                          "Charger les messages précédents"
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {/* Message list */}
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 my-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-600 mb-2" />
                      <p className="text-gray-400">Aucun message. Commencez la conversation!</p>
                    </div>
                  ) : (
                    <>
                      {groupMessagesByDate().map((group, groupIndex) => (
                        <div key={groupIndex} className="mb-6">
                          <div className="flex justify-center mb-4">
                            <div className="bg-[#182229] text-gray-400 text-xs py-1 px-3 rounded-full">
                              {group.date}
                            </div>
                          </div>
                          
                          {group.messages.map((message, index) => {
                            const isCurrentUser = message.sender_id === user.id;
                            return (
                              <div 
                                key={message.id}
                                className={`flex mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                              >
                                {!isCurrentUser && (
                                  <Avatar className="h-8 w-8 mr-2 mt-1 hidden">
                                    <AvatarImage 
                                      src={otherParticipant?.avatar} 
                                      alt={otherParticipant?.name} 
                                    />
                                    <AvatarFallback className="bg-[#6a7175] text-white">
                                      {otherParticipant?.name?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div className={`max-w-[70%] ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                                  <div 
                                    className={`rounded-lg px-3 py-2 inline-block ${
                                      isCurrentUser 
                                        ? 'bg-[#005c4b] text-white rounded-tr-none' 
                                        : 'bg-[#202c33] text-gray-200 rounded-tl-none'
                                    }`}
                                  >
                                    <p className="text-sm">
                                      {message.content}
                                    </p>
                                    
                                    {message.media && message.media.map((mediaItem: any, mediaIndex: number) => (
                                      <div key={mediaIndex} className="mt-2">
                                        {renderMediaContent(mediaItem)}
                                      </div>
                                    ))}
                                    
                                    <div className="flex items-center justify-end text-xs mt-1 text-right space-x-1">
                                      <span className={`${isCurrentUser ? 'text-gray-300/80' : 'text-gray-400'}`}>
                                        {formatMessageTime(message.created_at)}
                                      </span>
                                      {isCurrentUser && (
                                        <div className="flex">
                                          <Check className="h-3 w-3 text-gray-300/80" />
                                          <Check className="h-3 w-3 text-gray-300/80 -ml-1" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area - only show if no error and not loading */}
        {!loadError && !isLoadingProfile && (
          <div className="bg-[#202c33] p-2 rounded-b-lg">
            {selectedFile && (
              <div className="mb-3 p-2 bg-[#2a3942] rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  {selectedFile.type.startsWith('image/') ? (
                    <ImageIcon className="h-4 w-4 mr-2 text-blue-400" />
                  ) : (
                    <Paperclip className="h-4 w-4 mr-2 text-blue-400" />
                  )}
                  <span className="text-sm truncate max-w-[200px] text-gray-300">
                    {selectedFile.name}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-gray-300 hover:bg-[#374248]" 
                  onClick={removeSelectedFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {isRecording ? (
              <div className="flex items-center">
                <div className="flex-1 p-3 bg-[#2a3942] rounded-l-lg flex items-center">
                  <div className="animate-pulse h-3 w-3 rounded-full bg-red-500 mr-3"></div>
                  <span className="text-red-400 font-medium">Enregistrement: {formatTime(recordingTime)}</span>
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
                    variant="ghost"
                    size="icon"
                    className="bg-[#2a3942] hover:bg-[#374248] text-gray-300"
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
                  className="flex-1 min-h-0 h-10 py-2.5 bg-[#2a3942] border-[#2a3942] text-gray-200 placeholder:text-gray-400 resize-none"
                  disabled={isSending || isRecording}
                />
                
                {newMessage.trim() || selectedFile ? (
                  <Button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={isSending}
                    className="bg-[#00a884] hover:bg-[#029676] rounded-full"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleStartRecording}
                    disabled={isSending}
                    className="bg-[#00a884] hover:bg-[#029676] rounded-full"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Rating Dialog */}
      {otherParticipant && (
        <RatingDialog
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          fournisseurId={otherParticipant.id}
          userId={user?.id || ''}
          fournisseurName={otherParticipant.name || ''}
        />
      )}
    </div>
  );
};

export default ConversationDetail;
