
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message, Conversation, Rating, ConversationMedia } from '@/types/supabase';

// Get all conversations for a user
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    // Get conversations where the user is either the user or the supplier
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching conversations:', error);
      throw new Error(error.message);
    }
    
    return conversations || [];
  } catch (error) {
    console.error('Error in getConversations:', error);
    throw error;
  }
};

// Get a single conversation by ID
export const getConversationById = async (conversationId: string): Promise<Conversation | null> => {
  try {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
    
    return conversation;
  } catch (error) {
    console.error('Error in getConversationById:', error);
    return null;
  }
};

// Create a new conversation between a user and a supplier
export const createConversation = async (userId: string, supplierId: string): Promise<string> => {
  try {
    // First check if a conversation already exists
    const { data: existingConvs, error: searchError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user_id.eq.${userId},fournisseur_id.eq.${supplierId}),and(user_id.eq.${supplierId},fournisseur_id.eq.${userId})`)
      .limit(1);
    
    if (searchError) {
      console.error('Error searching for existing conversation:', searchError);
      throw new Error(`Error searching for conversations: ${searchError.message}`);
    }
    
    if (existingConvs && existingConvs.length > 0) {
      console.log('Found existing conversation:', existingConvs[0].id);
      return existingConvs[0].id;
    }
    
    // No conversation exists, create a new one
    const { data: newConv, error: insertError } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        fournisseur_id: supplierId
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating conversation:', insertError);
      throw new Error(`Error creating conversation: ${insertError.message}`);
    }
    
    if (!newConv) {
      throw new Error('No conversation was created');
    }
    
    return newConv.id;
  } catch (error: any) {
    console.error('Error in createConversation:', error);
    if (error.message.includes('violates foreign key constraint')) {
      toast.error('Erreur: Un des utilisateurs n\'existe pas');
    } else {
      toast.error('Erreur lors de la création de la conversation');
    }
    throw error;
  }
};

// Get all messages for a conversation
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      throw new Error(error.message);
    }
    
    return messages || [];
  } catch (error) {
    console.error('Error in getMessages:', error);
    throw error;
  }
};

// Send a message in a conversation
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  mediaFiles: File[] = []
): Promise<Message | null> => {
  try {
    // Update the conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    // Insert the message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error sending message:', error);
      return null;
    }
    
    // If there are media files, upload them
    if (mediaFiles.length > 0 && message) {
      await uploadMessageMedia(message.id, mediaFiles);
    }
    
    return message;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
};

// Upload media files for a message
export const uploadMessageMedia = async (messageId: string, files: File[]): Promise<string[]> => {
  const mediaUrls: string[] = [];
  
  try {
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `message_media/${messageId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('message_media')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading media:', uploadError);
        continue;
      }
      
      const { data: urlData } = supabase.storage
        .from('message_media')
        .getPublicUrl(filePath);
      
      const mediaUrl = urlData.publicUrl;
      mediaUrls.push(mediaUrl);
      
      // Store media reference in the database
      await supabase.from('conversation_media').insert({
        message_id: messageId,
        media_type: file.type,
        media_url: mediaUrl
      });
    }
    
    return mediaUrls;
  } catch (error) {
    console.error('Error in uploadMessageMedia:', error);
    return mediaUrls;
  }
};

// Get media for a message
export const getMessageMedia = async (messageId: string): Promise<ConversationMedia[]> => {
  try {
    const { data, error } = await supabase
      .from('conversation_media')
      .select('*')
      .eq('message_id', messageId);
    
    if (error) {
      console.error('Error fetching message media:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getMessageMedia:', error);
    return [];
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    // Update all messages in the conversation that were not sent by the current user
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// Get unread message count for a user
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    // Get all conversations involving the user
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`);
    
    if (convError || !conversations) {
      console.error('Error fetching conversations for unread count:', convError);
      return 0;
    }
    
    // No conversations found
    if (conversations.length === 0) {
      return 0;
    }
    
    const conversationIds = conversations.map(conv => conv.id);
    
    // Count unread messages across all conversations
    const { count, error: countError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .eq('is_read', false)
      .neq('sender_id', userId);
    
    if (countError) {
      console.error('Error counting unread messages:', countError);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadMessageCount:', error);
    return 0;
  }
};

// Add a rating to a conversation
export const addRating = async (
  conversationId: string,
  ratingValue: number,
  comment: string = ''
): Promise<Rating | null> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        conversation_id: conversationId,
        rating: ratingValue,
        comment
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding rating:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in addRating:', error);
    return null;
  }
};

// Get the rating for a conversation
export const getConversationRating = async (conversationId: string): Promise<Rating | null> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('conversation_id', conversationId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching conversation rating:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getConversationRating:', error);
    return null;
  }
};

// Delete a conversation
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    // Delete the conversation (cascade should delete all messages too)
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    
    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    return false;
  }
};
