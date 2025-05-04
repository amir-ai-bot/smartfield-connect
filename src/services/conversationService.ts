
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Define proper types for conversations
export interface ParticipantProfile {
  id: string;
  display_name: string;
  avatar: string | null;
  email: string;
  role: string;
  name?: string;
}

export interface ConversationData {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at?: string;
  created_at?: string;
  participant1?: ParticipantProfile;
  participant2?: ParticipantProfile;
}

export interface MessageData {
  id: string;
  content?: string;
  sender_id: string;
  receiver_id: string;
  created_at?: string;
  updated_at?: string;
  read?: boolean;
  sender?: ParticipantProfile;
  receiver?: ParticipantProfile;
}

// Fetch conversations for a user
export const getConversations = async (userId: string): Promise<ConversationData[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:participant1_id(id, display_name, avatar, email, role),
        participant2:participant2_id(id, display_name, avatar, email, role)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    const formattedConversations: ConversationData[] = data.map((conversation: any) => {
      // Determine the other participant profile (not the current user)
      const otherParticipant = conversation.participant1_id === userId 
        ? {
            id: conversation.participant2?.id || '',
            display_name: conversation.participant2?.display_name || '',
            avatar: conversation.participant2?.avatar || null,
            email: conversation.participant2?.email || '',
            role: conversation.participant2?.role || '',
            name: conversation.participant2?.display_name || ''
          }
        : {
            id: conversation.participant1?.id || '',
            display_name: conversation.participant1?.display_name || '',
            avatar: conversation.participant1?.avatar || null,
            email: conversation.participant1?.email || '',
            role: conversation.participant1?.role || '',
            name: conversation.participant1?.display_name || ''
          };

      return {
        ...conversation,
        participant1: conversation.participant1 ? {
          id: conversation.participant1.id || '',
          display_name: conversation.participant1.display_name || '',
          avatar: conversation.participant1.avatar || null,
          email: conversation.participant1.email || '',
          role: conversation.participant1.role || '',
          name: conversation.participant1.display_name || ''
        } : undefined,
        participant2: conversation.participant2 ? {
          id: conversation.participant2.id || '',
          display_name: conversation.participant2.display_name || '',
          avatar: conversation.participant2.avatar || null,
          email: conversation.participant2.email || '',
          role: conversation.participant2.role || '',
          name: conversation.participant2.display_name || ''
        } : undefined,
        otherParticipant
      };
    });

    return formattedConversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    toast.error('Failed to load conversations');
    return [];
  }
};

// Get a specific conversation by ID
export const getConversationById = async (conversationId: string): Promise<ConversationData | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:participant1_id(id, display_name, avatar, email, role),
        participant2:participant2_id(id, display_name, avatar, email, role)
      `)
      .eq('id', conversationId)
      .single();

    if (error) throw error;

    if (!data) return null;

    return {
      ...data,
      participant1: data.participant1 ? {
        id: data.participant1.id || '',
        display_name: data.participant1.display_name || '',
        avatar: data.participant1.avatar || null,
        email: data.participant1.email || '',
        role: data.participant1.role || '',
        name: data.participant1.display_name || ''
      } : undefined,
      participant2: data.participant2 ? {
        id: data.participant2.id || '',
        display_name: data.participant2.display_name || '',
        avatar: data.participant2.avatar || null,
        email: data.participant2.email || '',
        role: data.participant2.role || '',
        name: data.participant2.display_name || ''
      } : undefined
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    toast.error('Failed to load conversation');
    return null;
  }
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId: string): Promise<MessageData[]> => {
  try {
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, display_name, avatar, email, role),
        receiver:receiver_id(id, display_name, avatar, email, role)
      `)
      .or(`
        and(sender_id.eq.${conversationId}),
        and(receiver_id.eq.${conversationId})
      `)
      .order('created_at');

    if (messagesError) throw messagesError;

    // Format messages with sender and receiver information
    return messagesData.map((message: any) => ({
      ...message,
      sender: message.sender ? {
        id: message.sender.id || '',
        display_name: message.sender.display_name || '',
        avatar: message.sender.avatar || null,
        email: message.sender.email || '',
        role: message.sender.role || '',
        name: message.sender.display_name || ''
      } : undefined,
      receiver: message.receiver ? {
        id: message.receiver.id || '',
        display_name: message.receiver.display_name || '',
        avatar: message.receiver.avatar || null,
        email: message.receiver.email || '',
        role: message.receiver.role || '',
        name: message.receiver.display_name || ''
      } : undefined
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    toast.error('Failed to load messages');
    return [];
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    // Update messages where the current user is the recipient
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', userId)
      .eq('conversation_id', conversationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// Send a message in a conversation
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  conversationId: string,
  content: string
): Promise<MessageData | null> => {
  try {
    // Create unique ID for the message
    const messageId = uuidv4();
    
    // Insert the message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        id: messageId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        conversation_id: conversationId,
      })
      .select()
      .single();
    
    if (messageError) throw messageError;
    
    // Update the conversation's last_message_at
    const { error: conversationError } = await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    if (conversationError) throw conversationError;
    
    return messageData as MessageData;
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Failed to send message');
    return null;
  }
};

// Create a new conversation between two users
export const createConversation = async (
  participant1Id: string,
  participant2Id: string
): Promise<string | null> => {
  try {
    // Check if conversation already exists
    const { data: existingConvo, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${participant1Id},participant2_id.eq.${participant2Id}),and(participant1_id.eq.${participant2Id},participant2_id.eq.${participant1Id})`)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // Return existing conversation if found
    if (existingConvo) {
      return existingConvo.id;
    }
    
    // Create a new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant1_id: participant1Id,
        participant2_id: participant2Id
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    toast.error('Failed to create conversation');
    return null;
  }
};

// Create a supplier conversation (from user to fournisseur)
export const createSupplierConversation = async (
  userId: string,
  supplierId: string
): Promise<string | null> => {
  try {
    // Get supplier user_id
    const { data: supplierData, error: supplierError } = await supabase
      .from('suppliers')
      .select('user_id')
      .eq('id', supplierId)
      .maybeSingle();
    
    if (supplierError) throw supplierError;
    if (!supplierData || !supplierData.user_id) {
      throw new Error('Supplier user ID not found');
    }
    
    // Create conversation
    return createConversation(userId, supplierData.user_id);
  } catch (error) {
    console.error('Error creating supplier conversation:', error);
    toast.error('Failed to create conversation with supplier');
    return null;
  }
};
