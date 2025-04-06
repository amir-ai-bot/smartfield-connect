
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types for conversations
export interface Conversation {
  id: string;
  user_id: string;
  fournisseur_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  fournisseur?: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  media?: MediaItem[];
}

export interface MediaItem {
  id: string;
  message_id: string;
  media_type: 'image' | 'audio' | 'document';
  media_url: string;
  created_at: string;
}

export interface Rating {
  id: string;
  user_id: string;
  fournisseur_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles?: {
    name: string;
    avatar: string;
  };
}

export interface FavoriteSupplier {
  id: string;
  user_id: string;
  supplier_id: string;
  created_at: string;
}

// Get all conversations for a user (either as user or fournisseur)
export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    // Get conversations where the user is either the user or the fournisseur
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user:user_id (id, name, avatar, email),
        fournisseur:fournisseur_id (id, name, avatar, email)
      `)
      .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
}

// Alias for getConversations for backward compatibility
export const getUserConversations = getConversations;

// Get a specific conversation by ID
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user:user_id (id, name, avatar, email),
        fournisseur:fournisseur_id (id, name, avatar, email)
      `)
      .eq('id', conversationId)
      .single();
    
    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getConversation:', error);
    return null;
  }
}

// Get all messages for a conversation
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    // Get media for messages if any
    const messagesWithMedia = await Promise.all(
      (data || []).map(async (message) => {
        const { data: mediaData, error: mediaError } = await supabase
          .from('conversation_media')
          .select('*')
          .eq('message_id', message.id);
        
        if (mediaError) {
          console.error('Error fetching media:', mediaError);
          return message;
        }
        
        return {
          ...message,
          media: mediaData || []
        };
      })
    );

    return messagesWithMedia;
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
}

// Create a new conversation between user and fournisseur
export async function createConversation(userId: string, fournisseurId: string): Promise<string | null> {
  try {
    // Check if conversation already exists
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('fournisseur_id', fournisseurId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing conversation:', checkError);
    }
    
    // Return existing conversation if found
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
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in createConversation:', error);
    return null;
  }
}

// Send a message in a conversation
export async function sendMessage(
  conversationId: string,
  content: string,
  senderId: string
): Promise<string | null> {
  try {
    // Insert message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
        read: false
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
    
    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data?.id || null;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
}

// Send a message with file attachments
export async function sendMessageWithFiles(
  conversationId: string,
  content: string,
  senderId: string,
  files: File[]
): Promise<string | null> {
  try {
    // First send the message
    const messageId = await sendMessage(conversationId, content, senderId);
    
    if (!messageId) {
      throw new Error('Failed to send message');
    }
    
    // Then upload files and create media entries
    for (const file of files) {
      // Determine media type
      let mediaType: 'image' | 'audio' | 'document' = 'document';
      if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type.startsWith('audio/')) {
        mediaType = 'audio';
      }
      
      // Generate a unique file name
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `conversations/${conversationId}/${messageId}/${fileName}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        continue;
      }
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      
      // Create media entry
      const { error: mediaError } = await supabase
        .from('conversation_media')
        .insert({
          message_id: messageId,
          media_type: mediaType,
          media_url: publicUrl.publicUrl
        });
      
      if (mediaError) {
        console.error('Error creating media entry:', mediaError);
      }
    }

    return messageId;
  } catch (error) {
    console.error('Error in sendMessageWithFiles:', error);
    return null;
  }
}

// Send a voice message
export async function sendVoiceMessage(
  conversationId: string,
  audioBlob: Blob,
  senderId: string
): Promise<string | null> {
  try {
    // Convert Blob to File
    const file = new File([audioBlob], 'voice-message.webm', {
      type: 'audio/webm',
      lastModified: Date.now()
    });
    
    return await sendMessageWithFiles(
      conversationId,
      'Message vocal',
      senderId,
      [file]
    );
  } catch (error) {
    console.error('Error in sendVoiceMessage:', error);
    return null;
  }
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);
    
    if (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    return false;
  }
}

// Rate a fournisseur
export async function rateFournisseur(
  userId: string,
  fournisseurId: string,
  rating: number,
  comment?: string
): Promise<boolean> {
  try {
    // Check if user has already rated this fournisseur
    const { data: existingRating, error: checkError } = await supabase
      .from('fournisseur_ratings')
      .select('id')
      .eq('user_id', userId)
      .eq('fournisseur_id', fournisseurId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing rating:', checkError);
    }
    
    let result;
    
    if (existingRating) {
      // Update existing rating
      result = await supabase
        .from('fournisseur_ratings')
        .update({
          rating,
          comment
        })
        .eq('id', existingRating.id);
    } else {
      // Create new rating
      result = await supabase
        .from('fournisseur_ratings')
        .insert({
          user_id: userId,
          fournisseur_id: fournisseurId,
          rating,
          comment
        });
    }
    
    if (result.error) {
      console.error('Error rating fournisseur:', result.error);
      throw result.error;
    }

    // Update average rating in supplier profile (if needed)
    // This would be better handled by a database trigger

    return true;
  } catch (error) {
    console.error('Error in rateFournisseur:', error);
    return false;
  }
}

// Get ratings for a fournisseur
export async function getFournisseurRatings(fournisseurId: string): Promise<Rating[]> {
  try {
    const { data, error } = await supabase
      .from('fournisseur_ratings')
      .select(`
        *,
        profiles:user_id (name, avatar)
      `)
      .eq('fournisseur_id', fournisseurId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching ratings:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFournisseurRatings:', error);
    return [];
  }
}

// Add a fournisseur to favorites
export async function toggleFavoriteFournisseur(
  userId: string,
  fournisseurId: string
): Promise<{ isFavorite: boolean }> {
  try {
    // Check if already favorite
    const { data: existing, error: checkError } = await supabase
      .from('favorite_suppliers')
      .select('id')
      .eq('user_id', userId)
      .eq('supplier_id', fournisseurId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking favorite status:', checkError);
    }
    
    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorite_suppliers')
        .delete()
        .eq('id', existing.id);
      
      if (error) {
        console.error('Error removing favorite:', error);
        throw error;
      }
      
      return { isFavorite: false };
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorite_suppliers')
        .insert({
          user_id: userId,
          supplier_id: fournisseurId
        });
      
      if (error) {
        console.error('Error adding favorite:', error);
        throw error;
      }
      
      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error in toggleFavoriteFournisseur:', error);
    throw error;
  }
}

// Check if a fournisseur is in favorites
export async function isFournisseurFavorite(userId: string, fournisseurId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('favorite_suppliers')
      .select('id')
      .eq('user_id', userId)
      .eq('supplier_id', fournisseurId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in isFournisseurFavorite:', error);
    return false;
  }
}

// Get all favorite suppliers
export async function getFavoriteFournisseurs(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('favorite_suppliers')
      .select(`
        id,
        supplier:supplier_id (*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching favorite suppliers:', error);
      throw error;
    }
    
    // Extract supplier data from results
    return data?.map(item => item.supplier) || [];
  } catch (error) {
    console.error('Error in getFavoriteFournisseurs:', error);
    return [];
  }
}
