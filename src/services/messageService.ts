import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  user_id: string;
  supplier_id: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

// Create a new conversation between a user and a supplier
export const createConversation = async (userId: string, supplierId: string): Promise<string> => {
  try {
    // First check if a conversation already exists
    const { data: existingConversations, error: searchError } = await supabase
      .from('conversations')
      .select('id')
      .match({ user_id: userId, fournisseur_id: supplierId })
      .limit(1);

    if (searchError) {
      console.error('Error searching for existing conversation:', searchError);
      throw new Error('Failed to search for existing conversation: ' + searchError.message);
    }

    // Check reverse combination if not found
    if (!existingConversations || existingConversations.length === 0) {
      const { data: reverseConversations, error: reverseError } = await supabase
        .from('conversations')
        .select('id')
        .match({ user_id: supplierId, fournisseur_id: userId })
        .limit(1);

      if (reverseError) {
        console.error('Error searching for reverse conversation:', reverseError);
        throw new Error('Failed to search for reverse conversation: ' + reverseError.message);
      }

      if (reverseConversations && reverseConversations.length > 0) {
        console.log('Found existing reverse conversation:', reverseConversations[0].id);
        return reverseConversations[0].id;
      }

      // No conversation exists, create a new one
      console.log('Creating new conversation between', userId, 'and', supplierId);
      const { data: newConv, error: insertError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          fournisseur_id: supplierId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating conversation:', insertError);
        throw new Error('Failed to create conversation: ' + insertError.message);
      }

      if (!newConv) {
        throw new Error('No conversation was created');
      }

      console.log('Created new conversation:', newConv.id);
      return newConv.id;
    }

    // Return the existing conversation ID
    console.log('Found existing conversation:', existingConversations[0].id);
    return existingConversations[0].id;
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
};

// Get all conversations for a user (either as user or supplier)
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages:messages (
          content,
          created_at,
          read
        )
      `)
      .or(`user_id.eq.${userId},supplier_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(conv => ({
      id: conv.id,
      user_id: conv.user_id,
      supplier_id: conv.fournisseur_id, // Changed to match Conversation type
      last_message: conv.messages?.[0]?.content,
      last_message_time: conv.messages?.[0]?.created_at,
      unread_count: conv.messages?.filter(m => !m.read).length || 0
    }));
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

// Get messages for a specific conversation
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Send a new message
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
        read: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}; 