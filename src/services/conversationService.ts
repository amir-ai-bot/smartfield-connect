
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Get conversations for a user
export const getConversations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        profiles!conversations_participant1_id_fkey (id, display_name, avatar, email),
        profiles!conversations_participant2_id_fkey (id, display_name, avatar, email)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map((conversation) => {
      const isParticipant1 = conversation.participant1_id === userId;
      const otherParticipantProfile = isParticipant1 
        ? conversation.profiles.conversations_participant2_id_fkey
        : conversation.profiles.conversations_participant1_id_fkey;
      
      // Format the conversation data for the frontend
      return {
        id: conversation.id,
        user_id: conversation.participant1_id,
        fournisseur_id: conversation.participant2_id,
        created_at: conversation.created_at,
        updated_at: conversation.last_message_at,
        user: {
          id: conversation.profiles.conversations_participant1_id_fkey.id,
          name: conversation.profiles.conversations_participant1_id_fkey.display_name,
          avatar: conversation.profiles.conversations_participant1_id_fkey.avatar,
          email: conversation.profiles.conversations_participant1_id_fkey.email
        },
        fournisseur: {
          id: conversation.profiles.conversations_participant2_id_fkey.id,
          name: conversation.profiles.conversations_participant2_id_fkey.display_name,
          avatar: conversation.profiles.conversations_participant2_id_fkey.avatar,
          email: conversation.profiles.conversations_participant2_id_fkey.email
        },
        unreadCount: 0 // Will be calculated in a separate query if needed
      };
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    toast.error('Error fetching conversations');
    return [];
  }
};

// Alias for getConversations to match existing function calls
export const getUserConversations = getConversations;

// Get a specific conversation
export const getConversation = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        profiles!conversations_participant1_id_fkey (id, display_name, avatar, email),
        profiles!conversations_participant2_id_fkey (id, display_name, avatar, email)
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      throw error;
    }

    // Format the conversation data for the frontend
    return {
      id: data.id,
      user_id: data.participant1_id,
      fournisseur_id: data.participant2_id,
      created_at: data.created_at,
      updated_at: data.last_message_at,
      user: {
        id: data.profiles.conversations_participant1_id_fkey.id,
        name: data.profiles.conversations_participant1_id_fkey.display_name,
        avatar: data.profiles.conversations_participant1_id_fkey.avatar,
        email: data.profiles.conversations_participant1_id_fkey.email
      },
      fournisseur: {
        id: data.profiles.conversations_participant2_id_fkey.id,
        name: data.profiles.conversations_participant2_id_fkey.display_name,
        avatar: data.profiles.conversations_participant2_id_fkey.avatar,
        email: data.profiles.conversations_participant2_id_fkey.email
      }
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    toast.error('Error fetching conversation');
    return null;
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

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    toast.error('Error fetching messages');
    return [];
  }
};

// Send a message
export const sendMessage = async (
  conversationId: string, 
  content: string, 
  senderId: string,
  mediaUrl?: string
) => {
  try {
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .single();

    if (convError) {
      throw convError;
    }

    // Determine the receiver ID based on the sender
    const receiverId = conversation.participant1_id === senderId 
      ? conversation.participant2_id 
      : conversation.participant1_id;

    // Insert the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update the conversation's last_message_at timestamp
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Handle media attachments if present
    if (mediaUrl && data.id) {
      const { error: mediaError } = await supabase
        .from('media_items')
        .insert({
          message_id: data.id,
          media_url: mediaUrl,
          media_type: mediaUrl.split('.').pop()?.toLowerCase() || 'file'
        });

      if (mediaError) {
        console.error('Error adding media to message:', mediaError);
      }
    }

    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Error sending message');
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

// Check if a supplier is in favorites
export const isFournisseurFavorite = async (userId: string, fournisseurId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('check_favorite_supplier', { 
        p_user_id: userId, 
        p_supplier_id: fournisseurId 
      });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error checking if supplier is favorite:', error);
    return false;
  }
};

// Toggle a supplier in favorites
export const toggleFavoriteFournisseur = async (userId: string, fournisseurId: string) => {
  try {
    // Check if it's already a favorite
    const isFavorite = await isFournisseurFavorite(userId, fournisseurId);
    
    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .rpc('remove_favorite_supplier', {
          p_user_id: userId,
          p_supplier_id: fournisseurId
        });
        
      if (error) throw error;
      
      return { success: true, isFavorite: false };
    } else {
      // Add to favorites
      const { error } = await supabase
        .rpc('add_favorite_supplier', {
          p_user_id: userId,
          p_supplier_id: fournisseurId
        });
        
      if (error) throw error;
      
      return { success: true, isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite supplier:', error);
    toast.error('Error updating favorites');
    throw error;
  }
};

// Get favorite suppliers for a user
export const getFavoriteFournisseurs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_favorite_suppliers', {
        p_user_id: userId
      });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting favorite suppliers:', error);
    toast.error('Error fetching favorite suppliers');
    return [];
  }
};
