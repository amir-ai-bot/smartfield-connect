
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  getConversationMessages, 
  sendMessage, 
  sendMessageWithFiles, 
  sendVoiceMessage 
} from '@/services/conversationService';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Mic, MicOff, User, Image, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { timeAgo } from '@/lib/utils';
import { toast } from 'sonner';
import { LoadingImage } from '@/components/ui/LoadingImage';

interface ChatWindowProps {
  conversationId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  recipientId,
  recipientName,
  recipientAvatar
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId) return;
      
      try {
        setLoading(true);
        const messagesData = await getConversationMessages(conversationId);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Erreur lors du chargement des messages');
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
    
    // Real-time message updates
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle send message
  const handleSendMessage = async () => {
    if (!user || (!newMessage.trim() && selectedFiles.length === 0)) return;
    
    try {
      setSending(true);
      
      if (selectedFiles.length > 0) {
        // Send with files
        await sendMessageWithFiles(
          conversationId,
          newMessage.trim() || 'Images/Fichiers',
          user.id,
          selectedFiles
        );
        setSelectedFiles([]);
      } else {
        // Send text only
        await sendMessage(conversationId, newMessage.trim(), user.id);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...filesArray]);
    }
  };
  
  // Clear selected file
  const clearFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };
  
  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(chunks => [...chunks, e.data]);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        if (audioBlob.size > 0) {
          try {
            setSending(true);
            await sendVoiceMessage(conversationId, audioBlob, user!.id);
          } catch (error) {
            console.error('Error sending voice message:', error);
            toast.error('Erreur lors de l\'envoi du message vocal');
          } finally {
            setSending(false);
          }
        }
        
        setAudioChunks([]);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Erreur d\'accès au microphone');
    }
  };
  
  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] border rounded-md overflow-hidden">
      <div className="border-b p-3 flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={recipientAvatar} />
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium line-clamp-1">{recipientName}</h3>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            Aucun message. Démarrez la conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === user?.id;
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[75%] rounded-lg p-3 ${
                      isOwnMessage 
                        ? 'bg-agri-green-500 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {message.content && (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    
                    {message.media && message.media.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.media.map((item: any) => (
                          <div key={item.id} className="overflow-hidden">
                            {item.media_type === 'image' ? (
                              <LoadingImage 
                                src={item.media_url} 
                                alt="Image" 
                                className="rounded max-h-72 w-auto object-contain"
                              />
                            ) : item.media_type === 'audio' ? (
                              <audio 
                                controls 
                                src={item.media_url} 
                                className="w-full"
                              />
                            ) : (
                              <a 
                                href={item.media_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:underline"
                              >
                                <Paperclip className="h-4 w-4 mr-1" />
                                Document
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div 
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-green-50' : 'text-gray-500'
                      }`}
                    >
                      {timeAgo(message.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {selectedFiles.length > 0 && (
        <div className="border-t p-2">
          <div className="flex gap-2 overflow-x-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative">
                {file.type.startsWith('image/') ? (
                  <div className="h-20 w-20 rounded overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Selected ${index}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded">
                    <Paperclip className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                <button
                  onClick={() => clearFile(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t p-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="h-5 w-5" />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,application/pdf,application/msword,application/vnd.ms-excel"
          />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={recording ? 'text-red-500' : ''}
        >
          {recording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tapez votre message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={sending || recording}
          className="flex-1"
        />
        
        <Button
          onClick={handleSendMessage}
          disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending || recording}
          size="icon"
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;
