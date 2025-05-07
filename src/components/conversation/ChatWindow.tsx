
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Paperclip, Send, Image as ImageIcon, File, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { 
  getConversation, 
  getMessages, 
  sendMessage as sendMessageApi,
  markMessagesAsRead
} from '@/services/conversationService';
import { Message, Conversation } from '@/types/auth';

const ChatWindow: React.FC = () => {
  const { id: conversationId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation and messages
  useEffect(() => {
    if (!conversationId || !user) return;

    const fetchConversationData = async () => {
      try {
        setIsLoading(true);
        const conv = await getConversation(conversationId);
        setConversation(conv);

        const msgs = await getMessages(conversationId);
        setMessages(msgs);

        // Mark messages from other user as read
        const unreadMessages = msgs
          .filter(msg => msg.sender_id !== user.id && !msg.read)
          .map(msg => msg.id);

        if (unreadMessages.length > 0) {
          await markMessagesAsRead(unreadMessages);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
        toast.error('Erreur lors du chargement de la conversation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversationData();

    // Set up real-time updates
    const channel = supabase
      .channel('conversation-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, payload => {
        const newMsg = payload.new as Message;
        
        setMessages(prev => {
          // Check if we already have this message to avoid duplication
          if (prev.some(msg => msg.id === newMsg.id)) {
            return prev;
          }
          return [...prev, newMsg];
        });

        // Mark message as read if it's from the other user
        if (newMsg.sender_id !== user.id) {
          markMessagesAsRead([newMsg.id]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 attachments
    if (attachments.length + files.length > 5) {
      toast.error('Maximum 5 pièces jointes autorisées');
      return;
    }

    setAttachments(prev => [...prev, ...files]);

    // Create previews for images
    const newPreviews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });

    setAttachmentPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    
    // Revoke URL to prevent memory leaks
    if (attachmentPreviews[index]) {
      URL.revokeObjectURL(attachmentPreviews[index]);
    }
    
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !conversationId || !user) return;

    try {
      setIsSending(true);

      const otherUserId = conversation?.participant1_id === user.id 
        ? conversation?.participant2_id 
        : conversation?.participant1_id;

      if (!otherUserId) {
        throw new Error('Recipient not found');
      }

      // Upload attachments first if any
      const uploadPromises = attachments.map(async file => {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `conversations/${conversationId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (error) {
          throw error;
        }

        return {
          url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/attachments/${filePath}`,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name
        };
      });

      let uploadedAttachments: any[] = [];
      if (attachments.length > 0) {
        uploadedAttachments = await Promise.all(uploadPromises);
      }

      // Send message with attachments
      await sendMessageApi(
        conversationId, 
        user.id, 
        otherUserId, 
        newMessage.trim(),
        uploadedAttachments
      );

      // Clear form
      setNewMessage('');
      setAttachments([]);
      setAttachmentPreviews([]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOtherUser = () => {
    if (!conversation || !user) return null;

    return conversation.participant1_id === user.id
      ? conversation.participant2_id 
        ? { 
            id: conversation.participant2_id,
            display_name: conversation.fournisseur?.display_name || 'Fournisseur',
            avatar: conversation.fournisseur?.avatar || ''
          }
        : null
      : conversation.participant1_id
        ? {
            id: conversation.participant1_id,
            display_name: conversation.user?.display_name || 'Utilisateur',
            avatar: conversation.user?.avatar || ''
          }
        : null;
  };

  const otherUser = getOtherUser();

  // Group messages by date
  const groupedMessages = messages.reduce<{
    [date: string]: Message[];
  }>((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString('fr-FR');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Sélectionnez une conversation pour commencer</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center">
        {isLoading ? (
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-3">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser?.avatar || ''} />
              <AvatarFallback className="bg-agri-green-100 text-agri-green-800">
                {otherUser?.display_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h3 className="font-medium">{otherUser?.display_name || 'Utilisateur inconnu'}</h3>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[70%] ${i % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}>
                  <Skeleton className="h-20 w-64 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Aucun message pour le moment</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-600">
                  {date}
                </div>
              </div>
              
              {dateMessages.map((message) => {
                const isSentByMe = message.sender_id === user?.id;
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[70%]">
                      {!isSentByMe && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={otherUser?.avatar || ''} />
                          <AvatarFallback className="bg-agri-green-100 text-agri-green-800">
                            {otherUser?.display_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`
                          rounded-lg p-3 
                          ${isSentByMe 
                            ? 'bg-agri-green-500 text-white' 
                            : 'bg-gray-100 text-gray-800'
                          }
                        `}
                      >
                        <div className="whitespace-pre-wrap break-words">{message.content}</div>
                        
                        <div className="text-xs mt-1 text-right">
                          {formatDistanceToNow(new Date(message.created_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="p-2 border-t">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {attachments.map((file, index) => (
              <div 
                key={index} 
                className="relative bg-gray-100 rounded-lg p-2 min-w-20 h-20 flex items-center justify-center"
              >
                {file.type.startsWith('image/') ? (
                  <div className="w-full h-full">
                    <img 
                      src={attachmentPreviews[index]} 
                      alt={file.name} 
                      className="h-full w-full object-cover rounded" 
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <File className="h-6 w-6 text-gray-500" />
                    <span className="text-xs text-gray-600 truncate w-full">{file.name}</span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleAttachment}
            disabled={isSending}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez votre message..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="button"
            variant="default"
            size="icon"
            onClick={sendMessage}
            disabled={(!newMessage.trim() && attachments.length === 0) || isSending}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
      </div>
    </div>
  );
};

export default ChatWindow;
