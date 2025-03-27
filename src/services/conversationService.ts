
import { supabase } from '@/integrations/supabase/client';

// Function to create a new conversation with a fournisseur
export const createConversation = async (userId: string, fournisseurId: string): Promise<string> => {
  // First check if a conversation already exists
  const { data: existingConv, error: checkError } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', userId)
    .eq('fournisseur_id', fournisseurId)
    .maybeSingle();

  if (checkError) {
    throw new Error(checkError.message);
  }

  if (existingConv) {
    return existingConv.id;
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
    throw new Error(error.message);
  }

  return data.id;
};

// Function to send a message in a conversation
export const sendMessage = async (conversationId: string, senderId: string, content: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content
    });

  if (error) {
    throw new Error(error.message);
  }
  
  // Update conversation's updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);
};

// Function to get messages from a conversation
export const getMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      read,
      sender_id,
      profiles:sender_id (name, avatar)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Function to get user conversations
export const getUserConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      created_at,
      updated_at,
      user_id,
      fournisseur_id,
      user:user_id (name, avatar),
      fournisseur:fournisseur_id (name, avatar)
    `)
    .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Function to mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId);

  if (error) {
    throw new Error(error.message);
  }
};

// Function to get unread message count
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`);
    
    if (!conversations || conversations.length === 0) {
      return 0;
    }
    
    const conversationIds = conversations.map(c => c.id);
    
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .neq('sender_id', userId)
      .eq('read', false)
      .in('conversation_id', conversationIds);

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
};

// Function to rate a fournisseur
export const rateFournisseur = async (
  userId: string, 
  fournisseurId: string, 
  rating: number, 
  comment?: string
): Promise<void> => {
  const { error } = await supabase
    .from('fournisseur_ratings')
    .insert({
      user_id: userId,
      fournisseur_id: fournisseurId,
      rating,
      comment
    });

  if (error) {
    throw new Error(error.message);
  }
};

// Function to get fournisseur ratings
export const getFournisseurRatings = async (fournisseurId: string) => {
  const { data, error } = await supabase
    .from('fournisseur_ratings')
    .select('*')
    .eq('fournisseur_id', fournisseurId);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Function to get average fournisseur rating
export const getFournisseurAverageRating = async (fournisseurId: string): Promise<number> => {
  const ratings = await getFournisseurRatings(fournisseurId);
  
  if (ratings.length === 0) return 0;
  
  const sum = ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0);
  return sum / ratings.length;
};
