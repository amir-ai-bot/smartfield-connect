
import { supabase } from '@/integrations/supabase/client';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

// Define proper types
export interface ParticipantProfile {
  id: string;
  display_name?: string;
  avatar?: string | null;
  email?: string;
  role?: string;
  name?: string;
}

export interface ConversationData {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  created_at: string;
  participant1?: ParticipantProfile;
  participant2?: ParticipantProfile;
  last_message?: string;
}

export interface MessageData {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  sender?: ParticipantProfile;
  receiver?: ParticipantProfile;
  is_read?: boolean;
}

// Safely handle type errors
interface ConversationResult {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  created_at: string;
  [key: string]: any;
}

interface MessageResult {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

// Helper function to enhance a conversation with participant details
const enrichConversationWithParticipants = async (conversation: ConversationResult): Promise<ConversationData> => {
  try {
    // Fetch participant 1 details
    const { data: participant1 } = await supabase
      .from('profiles')
      .select('id, display_name, avatar, email, role')
      .eq('id', conversation.participant1_id)
      .single();
    
    // Fetch participant 2 details
    const { data: participant2 } = await supabase
      .from('profiles')
      .select('id, display_name, avatar, email, role')
      .eq('id', conversation.participant2_id)
      .single();
    
    // Fetch the last message
    const { data: lastMessage } = await supabase
      .from('messages')
      .select('content')
      .or(`sender_id.eq.${conversation.participant1_id},sender_id.eq.${conversation.participant2_id}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    return {
      id: conversation.id,
      participant1_id: conversation.participant1_id,
      participant2_id: conversation.participant2_id,
      last_message_at: conversation.last_message_at,
      created_at: conversation.created_at,
      participant1: participant1 || undefined,
      participant2: participant2 || undefined,
      last_message: lastMessage?.content
    };
  } catch (error) {
    console.error('Error enriching conversation:', error);
    return {
      id: conversation.id,
      participant1_id: conversation.participant1_id,
      participant2_id: conversation.participant2_id,
      last_message_at: conversation.last_message_at,
      created_at: conversation.created_at
    };
  }
};

// Get conversations for a user
export const getUserConversations = async (userId: string): Promise<ConversationData[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Enrich conversations with participant details
    const enrichedConversations = await Promise.all(
      data.map((conversation: ConversationResult) => enrichConversationWithParticipants(conversation))
    );
    
    return enrichedConversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Get a single conversation
export const getConversationById = async (conversationId: string): Promise<ConversationData | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (error) throw error;
    
    return await enrichConversationWithParticipants(data as ConversationResult);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId: string): Promise<MessageData[]> => {
  try {
    // First, get all messages
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`conversation_id.eq.${conversationId},conversation_id.is.null`)
      .order('created_at', { ascending: true });
    
    if (messagesError) throw messagesError;
    
    if (!messagesData || messagesData.length === 0) return [];
    
    // Fetch all unique user IDs from messages
    const userIds = new Set<string>();
    messagesData.forEach((message: MessageResult) => {
      if (message.sender_id) userIds.add(message.sender_id);
      if (message.receiver_id) userIds.add(message.receiver_id);
    });
    
    // Fetch all users in one go
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar, email, role')
      .in('id', Array.from(userIds));
    
    if (usersError) throw usersError;
    
    const usersMap = new Map<string, ParticipantProfile>();
    if (usersData) {
      usersData.forEach((user: ParticipantProfile) => {
        usersMap.set(user.id, user);
      });
    }
    
    // Enhance messages with user data
    return messagesData.map((message: MessageResult) => ({
      id: message.id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      content: message.content,
      created_at: message.created_at,
      updated_at: message.updated_at,
      sender: usersMap.get(message.sender_id),
      receiver: usersMap.get(message.receiver_id),
      is_read: message.is_read || false
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Send a message
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  conversationId: string,
  content: string
): Promise<MessageData | null> => {
  try {
    // Create the message
    const message = {
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      conversation_id: conversationId,
      is_read: false
    };
    
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
    
    if (messageError) throw messageError;
    
    // Update conversation last_message_at
    const { error: conversationError } = await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    if (conversationError) throw conversationError;
    
    return messageData as unknown as MessageData;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .is('is_read', false);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

// Create a new conversation with a supplier
export const createSupplierConversation = async (userId: string, supplierId: string): Promise<string | null> => {
  try {
    // Get supplier user_id from suppliers table
    const { data: supplierData, error: supplierError } = await supabase
      .from('suppliers')
      .select('user_id')
      .eq('id', supplierId)
      .single();
    
    if (supplierError || !supplierData?.user_id) {
      console.error('Error finding supplier:', supplierError);
      return null;
    }
    
    // Check if conversation already exists
    const { data: existingConversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${userId},participant2_id.eq.${supplierData.user_id}),and(participant1_id.eq.${supplierData.user_id},participant2_id.eq.${userId})`)
      .maybeSingle();
    
    if (conversationError && conversationError.code !== 'PGRST116') {
      console.error('Error checking existing conversation:', conversationError);
    }
    
    if (existingConversation?.id) {
      return existingConversation.id;
    }
    
    // Create new conversation
    const { data: newConversation, error: newConversationError } = await supabase
      .from('conversations')
      .insert({
        participant1_id: userId,
        participant2_id: supplierData.user_id,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (newConversationError) throw newConversationError;
    
    return newConversation?.id || null;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

// Check if a supplier is in user's favorites
export const isFournisseurFavorite = async (userId: string, fournisseurId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('check_favorite_supplier', {
        p_user_id: userId,
        p_supplier_id: fournisseurId
      });
    
    if (error) throw error;
    
    return Boolean(data);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Toggle favorite status for a supplier
export const toggleFavoriteFournisseur = async (
  userId: string,
  supplierId: string
): Promise<{ isFavorite: boolean } | boolean> => {
  try {
    // Check current favorite status
    const isFavorite = await isFournisseurFavorite(userId, supplierId);
    
    if (isFavorite) {
      // Remove from favorites
      const { error: removeError } = await supabase
        .rpc('remove_favorite_supplier', {
          p_user_id: userId,
          p_supplier_id: supplierId
        });
      
      if (removeError) throw removeError;
      
      return { isFavorite: false };
    } else {
      // Add to favorites
      const { error: addError } = await supabase
        .rpc('add_favorite_supplier', {
          p_user_id: userId,
          p_supplier_id: supplierId
        });
      
      if (addError) throw addError;
      
      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
};
