
import { supabase } from '@/integrations/supabase/client';
import { Supplier } from '@/types/supabase';

// Define minimal types to avoid circular references
interface MessageData {
  id: string;
  sender_id: string;
  receiver_id: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  conversation_id?: string; // Add this field
  is_read?: boolean; // Use this instead of 'read'
}

interface ConversationData {
  id: string;
  participant1_id?: string;
  participant2_id?: string;
  last_message_at?: string;
  created_at?: string;
  participant?: {
    id: string;
    display_name?: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
}

// Get user conversations
export const getConversations = async (userId: string): Promise<ConversationData[]> => {
  try {
    // Query conversations where the user is either participant
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        *,
        profiles!conversations_participant1_id_fkey (id, display_name, avatar),
        profiles!conversations_participant2_id_fkey (id, display_name, avatar),
        messages!inner (content, created_at)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return [];
    }

    // No conversations found
    if (!conversationsData || conversationsData.length === 0) {
      return [];
    }

    // Process conversations to get the correct participant data
    const conversations: ConversationData[] = conversationsData.map((conversation) => {
      // Determine which participant is the other user
      const isParticipant1 = conversation.participant1_id === userId;
      const otherParticipantId = isParticipant1 ? conversation.participant2_id : conversation.participant1_id;
      const otherParticipantData = isParticipant1 
        ? conversation.profiles_conversations_participant2_id_fkey 
        : conversation.profiles_conversations_participant1_id_fkey;

      // Get last message
      const messages = conversation.messages || [];
      const lastMessage = messages.length > 0 
        ? { 
            content: messages[0].content || '', 
            created_at: messages[0].created_at || '' 
          } 
        : undefined;

      return {
        id: conversation.id,
        participant1_id: conversation.participant1_id,
        participant2_id: conversation.participant2_id,
        last_message_at: conversation.last_message_at,
        created_at: conversation.created_at,
        // Add participant info
        participant: {
          id: otherParticipantId || '',
          display_name: otherParticipantData?.display_name || 'Unknown',
          avatar: otherParticipantData?.avatar || '',
        },
        lastMessage
      };
    });

    return conversations;
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
};

// Alias for getConversations to support the old function name
export const getUserConversations = getConversations;

// Get conversation details
export const getConversation = async (conversationId: string): Promise<ConversationData | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data as ConversationData;
  } catch (error) {
    console.error('Error in getConversation:', error);
    return null;
  }
};

// Get conversation messages
export const getConversationMessages = async (conversationId: string): Promise<MessageData[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    // Add conversation_id to each message
    const messages: MessageData[] = (data || []).map(msg => ({
      ...msg,
      conversation_id: conversationId
    }));

    return messages;
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true }) // Using is_read instead of read
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    return false;
  }
};

// For compatibility - supplier service functions
export const getFavoriteSuppliers = async (userId: string): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_favorite_suppliers', { user_id: userId });

    if (error) {
      console.error('Error fetching favorite suppliers:', error);
      return [];
    }

    return data as Supplier[];
  } catch (error) {
    console.error('Error in getFavoriteSuppliers:', error);
    return [];
  }
};

// Additional functions for supplier favorites
export const toggleFavoriteFournisseur = async (userId: string, fournisseurId: string): Promise<boolean> => {
  try {
    const isFavorite = await isFournisseurFavorite(userId, fournisseurId);
    
    if (isFavorite) {
      const { error } = await supabase
        .rpc('remove_favorite_supplier', { 
          user_id: userId, 
          supplier_id: fournisseurId 
        });
      
      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .rpc('add_favorite_supplier', { 
          user_id: userId, 
          supplier_id: fournisseurId 
        });
      
      if (error) throw error;
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    return false;
  }
};

export const isFournisseurFavorite = async (userId: string, fournisseurId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('check_favorite_supplier', {
        user_id: userId,
        supplier_id: fournisseurId
      });
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking if supplier is favorite:', error);
    return false;
  }
};
