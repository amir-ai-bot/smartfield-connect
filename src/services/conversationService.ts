import { supabase } from '@/integrations/supabase/client';

// Types for conversation data
export interface ConversationData {
  id: string;
  participant: ParticipantProfile;
  lastMessageAt: string;
  createdAt: string;
  userId: string;
}

export interface MessageData {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read?: boolean;
}

export interface ParticipantProfile {
  id: string;
  name: string;
  avatar?: string;
}

// Get all conversations for a user
export const getUserConversations = async (userId: string) => {
  try {
    // First get all conversations where user is participant1 or participant2
    const { data: conversationsData, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);
    
    if (error) throw error;
    
    // Now for each conversation, get the other participant's details
    const conversations = await Promise.all(conversationsData.map(async (conv) => {
      const otherParticipantId = conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id;
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar, email')
        .eq('id', otherParticipantId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Return a default participant object if profile can't be fetched
        return {
          id: conv.id,
          participant: { 
            id: otherParticipantId,
            name: 'Unknown User',
            avatar: undefined
          },
          lastMessageAt: conv.last_message_at || conv.created_at,
          createdAt: conv.created_at
        };
      }
      
      return {
        id: conv.id,
        participant: {
          id: profileData.id,
          name: profileData.display_name || profileData.email || 'Unknown User',
          avatar: profileData.avatar
        },
        lastMessageAt: conv.last_message_at || conv.created_at,
        createdAt: conv.created_at
      };
    }));
    
    // Sort conversations by lastMessageAt (most recent first)
    return conversations.sort((a, b) => {
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Get a single conversation by ID
export const getConversation = async (conversationId: string, userId: string) => {
  try {
    // Get conversation details
    const { data: conversationData, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (error) throw error;
    
    // Verify user is participant
    if (conversationData.participant1_id !== userId && conversationData.participant2_id !== userId) {
      throw new Error('User not authorized to view this conversation');
    }
    
    // Get the other participant details
    const otherParticipantId = conversationData.participant1_id === userId 
      ? conversationData.participant2_id 
      : conversationData.participant1_id;
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar, email')
      .eq('id', otherParticipantId)
      .single();
    
    if (profileError) {
      throw profileError;
    }
    
    return {
      id: conversationData.id,
      participant: {
        id: profileData.id,
        name: profileData.display_name || profileData.email || 'Unknown User',
        avatar: profileData.avatar
      },
      lastMessageAt: conversationData.last_message_at,
      createdAt: conversationData.created_at,
      userId // Include the current user ID for reference
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

// Create a new conversation or return existing one between two users
export const createConversation = async (userId: string, otherUserId: string) => {
  try {
    // Check if conversation already exists
    const { data: existingConversations, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${userId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${userId})`);
    
    if (fetchError) throw fetchError;
    
    // If conversation exists, return its ID
    if (existingConversations && existingConversations.length > 0) {
      return existingConversations[0].id;
    }
    
    // Create a new conversation
    const { data: newConversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        participant1_id: userId,
        participant2_id: otherUserId,
      })
      .select('id')
      .single();
    
    if (insertError) throw insertError;
    
    return newConversation.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Send a message
export const sendMessage = async (conversationId: string, senderId: string, receiverId: string, content: string) => {
  try {
    // Insert the message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      })
      .select()
      .single();
    
    if (messageError) throw messageError;
    
    // Update the conversation's last_message_at timestamp
    const { error: conversationError } = await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    if (conversationError) throw conversationError;
    
    return messageData;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark all messages in a conversation as read for a specific user
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('mark_messages_as_read', {
      p_conversation_id: conversationId,
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    return false;
  }
};

// Get favorite suppliers for a user
export const getFavoriteSuppliers = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_favorite_suppliers', { p_user_id: userId });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching favorite suppliers:', error);
    return [];
  }
};

/**
 * Toggle favorite supplier for a user
 */
export const toggleFavoriteFournisseur = async (userId: string, supplierId: string): Promise<{ isFavorite: boolean }> => {
  try {
    // Check if the supplier is already a favorite
    const isFavorite = await isFournisseurFavorite(userId, supplierId);
    
    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorite_suppliers')
        .delete()
        .eq('user_id', userId)
        .eq('supplier_id', supplierId);
      
      if (error) throw error;
      
      return { isFavorite: false };
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorite_suppliers')
        .insert({
          user_id: userId,
          supplier_id: supplierId
        });
      
      if (error) throw error;
      
      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite supplier:', error);
    throw error;
  }
};

/**
 * Check if a supplier is a favorite for a user
 */
export const isFournisseurFavorite = async (userId: string, supplierId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('favorite_suppliers')
      .select()
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the error code for "no rows returned"
      console.error('Error checking if supplier is favorite:', error);
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking if supplier is favorite:', error);
    return false;
  }
};
