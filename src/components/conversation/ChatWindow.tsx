import { useState, useEffect, useRef } from 'react';
import { User } from '@/types/auth';
import { getConversationMessages, sendMessage, markMessagesAsRead, sendMessageWithFiles } from '@/services/conversationService';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, Mic, X, Image, Paperclip, FilesIcon, StopCircle } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  media?: {
    id: string;
    media_type: string;
    media_url: string;
  }[];
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getConversationMessages(conversationId);
        setMessages(data as unknown as Message[]);
        
        await markMessagesAsRead(conversationId, currentUser.id);
        
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Erreur lors du chargement des messages');
      }
    };

    fetchMessages();

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async (payload) => {
        const data = await getConversationMessages(conversationId);
        setMessages(data as unknown as Message[]);
        
        await markMessagesAsRead(conversationId, currentUser.id);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    };
  }, [conversationId, currentUser.id]);

  useEffect(() => {
    if (initialLoadComplete && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, initialLoadComplete]);

  const handleSend = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    
    setSending(true);
    
    try {
      if (selectedFiles.length > 0) {
        await sendMessageWithFiles(
          conversationId, 
          newMessage.trim() || `📎 ${selectedFiles.length} fichier(s)`, 
          currentUser.id,
          selectedFiles
        );
      } else {
        await sendMessage(
          conversationId, 
          newMessage.trim(), 
          currentUser.id
        );
      }
      setNewMessage('');
      setSelectedFiles([]);
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

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(prev => [...prev, e.data]);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          try {
            setSending(true);
            await sendVoiceMessage(conversationId, currentUser.id, audioBlob);
          } catch (error) {
            console.error('Error sending voice message:', error);
            toast.error('Erreur lors de l\'envoi du message vocal');
          } finally {
            setSending(false);
          }
        }
        
        setAudioChunks([]);
        setRecordingTime(0);
        setIsRecording(false);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);
      
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Erreur lors de l\'accès au microphone. Veuillez vérifier les permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMediaContent = (media: any) => {
    const { media_type, media_url } = media;
    
    if (media_type.startsWith('image/')) {
      return (
        <a href={media_url} target="_blank" rel="noopener noreferrer" className="block">
          <img 
            src={media_url} 
            alt="Image" 
            className="max-w-[200px] max-h-[200px] rounded-md object-cover"
          />
        </a>
      );
    } else if (media_type.startsWith('audio/')) {
      return (
        <audio controls className="max-w-[200px]">
          <source src={media_url} type={media_type} />
          Votre navigateur ne supporte pas le format audio.
        </audio>
      );
    } else if (media_type.startsWith('video/')) {
      return (
        <video controls className="max-w-[200px] max-h-[200px]">
          <source src={media_url} type={media_type} />
          Votre navigateur ne supporte pas le format vidéo.
        </video>
      );
    } else {
      return (
        <a 
          href={media_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 underline"
        >
          <FilesIcon size={16} />
          Télécharger le fichier
        </a>
      );
    }
  };

  const renderMessageBubble = (message: Message, isCurrentUser: boolean) => (
    <div 
      key={message.id}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
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
        <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
        
        {message.media && message.media.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.media.map((item) => (
              <div key={item.id} className="rounded overflow-hidden">
                {renderMediaContent(item)}
              </div>
            ))}
          </div>
        )}
        
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
        <Avatar className="h-8 w-8 ml-2 flex-shrink-0">
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
      <div className="border-b p-3 flex justify-between items-center">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={otherUser.avatar || undefined} alt={otherUser.name} />
            <AvatarFallback className="bg-agri-green-100 text-agri-green-700">
              {otherUser.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{otherUser.name}</h3>
            <p className="text-xs text-gray-500">
              {messages.length > 0 
                ? `Dernière activité: ${timeAgo(messages[messages.length - 1]?.created_at)}` 
                : 'Nouvelle conversation'}
            </p>
          </div>
        </div>
      </div>
      
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
      
      {selectedFiles.length > 0 && (
        <div className="border-t p-2 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative bg-gray-100 rounded p-1 flex items-center">
              <span className="text-xs truncate max-w-[100px]">{file.name}</span>
              <button 
                className="ml-1 text-gray-500 hover:text-red-500"
                onClick={() => removeSelectedFile(index)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {isRecording && (
        <div className="border-t p-3 flex items-center justify-between bg-red-50">
          <div className="flex items-center text-red-600">
            <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-red-600"></div>
            <span>Enregistrement en cours {formatRecordingTime(recordingTime)}</span>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={stopRecording}
            className="rounded-full"
          >
            <StopCircle size={18} />
          </Button>
        </div>
      )}
      
      <div className="border-t p-3">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelection}
            multiple
            className="hidden"
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                disabled={isRecording || sending}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" side="top">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Photos & Fichiers
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={startRecording}
                  disabled={isRecording}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Audio
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            className="resize-none"
            rows={2}
            disabled={isRecording || sending}
          />
          
          <Button 
            onClick={handleSend} 
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending || isRecording}
            className="bg-agri-green-500 hover:bg-agri-green-600 rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
