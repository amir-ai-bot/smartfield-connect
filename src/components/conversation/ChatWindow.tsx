import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic, Paperclip, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
  getConversationMessages,
  sendMessage,
  sendVoiceMessage,
  markMessagesAsRead
} from '@/services/conversationService';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, ar } from 'date-fns/locale';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

interface ChatWindowProps {
  conversation: any;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onClose }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState<MediaRecorder | null>(null);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (conversation?.id) {
      loadMessages();
    }
  }, [conversation?.id]);

  useEffect(() => {
    if (conversation?.id && user?.id) {
      markConversationAsRead();
    }
  }, [conversation?.id, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getConversationMessages(conversation.id);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Error loading messages');
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async () => {
    try {
      await markMessagesAsRead(conversation.id, user!.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      await sendMessage(conversation.id, newMessage, user!.id);
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getLocale = () => {
    switch (language) {
      case 'fr':
        return fr;
      case 'ar':
        return ar;
      default:
        return enUS;
    }
  };

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: getLocale() });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'N/A';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        await handleVoiceMessage(audioBlob);
      };

      mediaRecorder.start();
      setRecording(mediaRecorder);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Microphone permission denied');
    }
  };

  const stopRecording = () => {
    if (recording) {
      recording.stop();
      recording.stream.getTracks().forEach(track => track.stop());
      setRecording(null);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    try {
      await sendVoiceMessage(conversation.id, audioBlob, user!.id);
      loadMessages();
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast.error('Error sending voice message');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={conversation.otherUser?.avatar} />
            <AvatarFallback>{conversation.otherUser?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{conversation.otherUser?.name}</h2>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Fermer
        </Button>
      </div>

      <Separator />

      <div className="flex-1 overflow-auto p-4">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.sender_id === user?.id ? 'items-end' : 'items-start'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    {message.sender_id !== user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={conversation.otherUser?.avatar} />
                        <AvatarFallback>{conversation.otherUser?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 max-w-md break-words ${message.sender_id === user?.id
                        ? 'bg-agri-green-100 text-gray-900'
                        : 'bg-gray-100 text-gray-900'
                        }`}
                    >
                      {message.media ? (
                        message.media_type === 'image' ? (
                          <img src={message.media_url} alt="Image" className="max-w-full rounded-lg" />
                        ) : message.media_type === 'audio' ? (
                          <audio controls src={message.media_url} className="w-full"></audio>
                        ) : (
                          <a href={message.media_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            Document
                          </a>
                        )
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(message.created_at)}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <Separator />

      <div className="p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder={t('type_message')}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-full"
          />
          <Button
            disabled={sending}
            onClick={handleSendMessage}
            className="bg-agri-green-500 hover:bg-agri-green-600 rounded-full"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
