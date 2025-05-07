
import { supabase } from '@/integrations/supabase/client';
// Import specific types needed
import { Message } from '../services/conversationService';

// Create a conversation or get existing one
export async function createConversation(userId: string, fournisseurId: string): Promise<string> {
  try {
    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('fournisseur_id', fournisseurId)
      .maybeSingle();
    
    if (existingConversation) {
      return existingConversation.id;
    }
    
    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        fournisseur_id: fournisseurId
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

// Get messages for a conversation
export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data as Message[];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  content: string,
  senderId: string
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        read: false
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data as Message;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

// Mark a message as read
export async function markAsRead(messageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    return false;
  }
}

// Mark all messages in a conversation as read
export async function markAllAsRead(conversationId: string, currentUserId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    return false;
  }
}
