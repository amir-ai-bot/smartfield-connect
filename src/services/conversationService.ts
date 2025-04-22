
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MediaItem } from '@/types/supabase';

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

export interface Rating {
  id: string;
  user_id: string;
  fournisseur_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Create a conversation
export async function createConversation(userId: string, supplierId: string): Promise<string | null> {
  try {
    // Check if conversation already exists
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('fournisseur_id', supplierId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing conversation:', checkError);
      throw checkError;
    }
    
    if (existingConversation) {
      return existingConversation.id;
    }
    
    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        fournisseur_id: supplierId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
}

// Get all conversations for a user (either as user or fournisseur)
export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    // Get conversations where the user is either the user or the fournisseur
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user_profile:profiles!user_id(id, name, avatar, email),
        fournisseur_profile:profiles!fournisseur_id(id, name, avatar, email)
      `)
      .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }

    // Transform data to match the Conversation interface
    return (data || []).map(item => {
      // Handle user profile and fournisseur profile data safely
      const userProfile = item.user_profile || {};
      const fournisseurProfile = item.fournisseur_profile || {};
      
      return {
        id: item.id,
        user_id: item.user_id,
        fournisseur_id: item.fournisseur_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        user: {
          id: userProfile.id || '',
          name: userProfile.name || 'Unknown',
          avatar: userProfile.avatar || '',
          email: userProfile.email || ''
        },
        fournisseur: {
          id: fournisseurProfile.id || '',
          name: fournisseurProfile.name || 'Unknown',
          avatar: fournisseurProfile.avatar || '',
          email: fournisseurProfile.email || ''
        }
      };
    });
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
        user_profile:profiles!user_id(id, name, avatar, email),
        fournisseur_profile:profiles!fournisseur_id(id, name, avatar, email)
      `)
      .eq('id', conversationId)
      .single();
    
    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    // Handle user and fournisseur profile data safely
    const userProfile = data.user_profile || {};
    const fournisseurProfile = data.fournisseur_profile || {};
    
    // Transform data to match the Conversation interface
    return {
      id: data.id,
      user_id: data.user_id,
      fournisseur_id: data.fournisseur_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user: {
        id: userProfile.id || '',
        name: userProfile.name || 'Unknown',
        avatar: userProfile.avatar || '',
        email: userProfile.email || ''
      },
      fournisseur: {
        id: fournisseurProfile.id || '',
        name: fournisseurProfile.name || 'Unknown',
        avatar: fournisseurProfile.avatar || '',
        email: fournisseurProfile.email || ''
      }
    };
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
          return message as Message;
        }
        
        // Transform media_type from string to the expected union type
        const typedMedia = mediaData ? mediaData.map(media => ({
          ...media,
          media_type: (media.media_type === 'image' || media.media_type === 'audio' || media.media_type === 'document') ? 
            media.media_type as "image" | "audio" | "document" : 
            "document"
        })) : [];
        
        return {
          ...message,
          media: typedMedia as MediaItem[]
        } as Message;
      })
    );

    return messagesWithMedia;
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
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
      let mediaType: "image" | "audio" | "document" = "document";
      if (file.type.startsWith('image/')) {
        mediaType = "image";
      } else if (file.type.startsWith('audio/')) {
        mediaType = "audio";
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
        profiles:profiles!user_id(id, name, avatar)
      `)
      .eq('fournisseur_id', fournisseurId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching ratings:', error);
      throw error;
    }

    // Transform data to match the Rating interface with safe access
    return (data || []).map(item => {
      // Get profile data safely with default values
      const profileData = item.profiles || {};
      
      return {
        id: item.id,
        user_id: item.user_id,
        fournisseur_id: item.fournisseur_id,
        rating: item.rating,
        comment: item.comment,
        created_at: item.created_at,
        profiles: {
          id: profileData.id || '',
          name: profileData.name || 'Anonymous',
          avatar: profileData.avatar || ''
        }
      } as Rating;
    });
  } catch (error) {
    console.error('Error in getFournisseurRatings:', error);
    return [];
  }
}

// Add a fournisseur to favorites
export async function toggleFavoriteFournisseur(
  userId: string,
  supplierId: string
): Promise<{ isFavorite: boolean }> {
  try {
    // Instead of using RPC, use direct query approach
    // First check if favorite already exists
    const { data: existingFavorites, error: checkError } = await supabase
      .from('favorite_suppliers')
      .select('id')
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking favorite status:', checkError);
      throw checkError;
    }

    // If favorite exists, remove it
    if (existingFavorites) {
      const { error: removeError } = await supabase
        .from('favorite_suppliers')
        .delete()
        .eq('user_id', userId)
        .eq('supplier_id', supplierId);
      
      if (removeError) throw removeError;
      return { isFavorite: false };
    } else {
      // Add to favorites
      const { error: addError } = await supabase
        .from('favorite_suppliers')
        .insert({
          user_id: userId,
          supplier_id: supplierId
        });
      
      if (addError) throw addError;
      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error in toggleFavoriteFournisseur:', error);
    throw error;
  }
}

// Check if a fournisseur is in favorites
export async function isFournisseurFavorite(userId: string, supplierId: string): Promise<boolean> {
  try {
    // Use direct query instead of RPC
    const { data, error } = await supabase
      .from('favorite_suppliers')
      .select('id')
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
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
    // Use direct join query instead of RPC
    const { data, error } = await supabase
      .from('favorite_suppliers')
      .select(`
        suppliers!supplier_id(
          id,
          user_id,
          name,
          category,
          location,
          phone,
          products,
          rating,
          image,
          profiles:profiles!user_id(
            email,
            avatar
          )
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching favorite suppliers:', error);
      return [];
    }
    
    // Transform the data to the expected format
    return Array.isArray(data) ? data.map(item => {
      const supplier = item.suppliers || {};
      const profileData = supplier.profiles || {};
      
      return {
        ...supplier,
        email: profileData.email || '',
        avatar: profileData.avatar || '',
        isFavorite: true
      };
    }) : [];
    
  } catch (error) {
    console.error('Error in getFavoriteFournisseurs:', error);
    return [];
  }
}

/**
 * Marks all messages in a conversation as read
 * @param conversationId ID of the conversation to mark as read
 * @param currentUserId ID of the current user
 */
export const markMessagesAsRead = async (conversationId: string, currentUserId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .match({ conversation_id: conversationId })
      .neq('sender_id', currentUserId)
      .eq('read', false);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};
