import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@/types/supabase';
import { toast } from 'sonner';

// Add the missing function
export const getFavoriteFournisseurs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_favorite_suppliers', { p_user_id: userId });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting favorite suppliers:", error);
    toast.error("Erreur lors de la récupération des fournisseurs favoris");
    return [];
  }
}

export const getUserConversations = async (userId: string) => {
  return getConversations(userId);
}

// Get conversation by id
export const getConversation = async (conversationId: string, currentUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:participant1_id (id, display_name, avatar, email, role),
        participant2:participant2_id (id, display_name, avatar, email, role)
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error getting conversation:', error);
      return null;
    }

    // Extract profile data safely
    let participant1Profile = {};
    let participant2Profile = {};
    
    if (data.participant1 && typeof data.participant1 === 'object') {
      participant1Profile = {
        id: data.participant1.id || '',
        name: data.participant1.display_name || '',
        avatar: data.participant1.avatar || '',
        email: data.participant1.email || '',
        role: data.participant1.role || ''
      };
    }

    if (data.participant2 && typeof data.participant2 === 'object') {
      participant2Profile = {
        id: data.participant2.id || '',
        name: data.participant2.display_name || '',
        avatar: data.participant2.avatar || '',
        email: data.participant2.email || '',
        role: data.participant2.role || ''
      };
    }

    // Determine which profile is the other participant
    let otherProfile;
    if (data.participant1_id === currentUserId) {
      otherProfile = participant2Profile;
    } else {
      otherProfile = participant1Profile;
    }

    return {
      ...data,
      participant1Profile,
      participant2Profile,
      otherProfile
    };
  } catch (error) {
    console.error('Error in getConversation:', error);
    return null;
  }
};

// Get all conversations for a user (either as user or supplier)
export const getConversations = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:participant1_id (id, display_name, avatar, email),
        participant2:participant2_id (id, display_name, avatar, email),
        messages:messages (
          content,
          created_at,
          sender_id,
          read
        )
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting conversations:', error);
      return [];
    }

    return data.map(conversation => {
      const participant1 = conversation.participant1 as any;
      const participant2 = conversation.participant2 as any;
      const messages = conversation.messages as any[];

      const lastMessage = messages && messages.length > 0 ? messages[0].content : null;
      const lastMessageTime = messages && messages.length > 0 ? messages[0].created_at : null;
      const unreadCount = messages ? messages.filter(m => m.sender_id !== userId && !m.read).length : 0;

      let otherParticipant;
      if (participant1 && participant1.id === userId) {
        otherParticipant = participant2;
      } else {
        otherParticipant = participant1;
      }

      return {
        id: conversation.id,
        participant1_id: conversation.participant1_id,
        participant2_id: conversation.participant2_id,
        last_message: lastMessage,
        last_message_time: lastMessageTime,
        unread_count: unreadCount,
        otherParticipant: otherParticipant
      };
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

// Get messages for a specific conversation
export const getConversationMessages = async (conversationId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id(id, display_name, avatar)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting messages:', error);
      return [];
    }

    return data.map(message => ({
      ...message,
      sender: message.sender as any
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

// Check if a fournisseur is in the user's favorites
export const isFournisseurFavorite = async (userId: string, fournisseurId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('favorite_suppliers')
      .select('*')
      .eq('user_id', userId)
      .eq('supplier_id', fournisseurId);

    if (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Toggle a fournisseur in the user's favorites
export const toggleFavoriteFournisseur = async (userId: string, fournisseurId: string): Promise<{ isFavorite: boolean }> => {
  try {
    const isCurrentlyFavorite = await isFournisseurFavorite(userId, fournisseurId);

    if (isCurrentlyFavorite) {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from('favorite_suppliers')
        .delete()
        .eq('user_id', userId)
        .eq('supplier_id', fournisseurId);

      if (deleteError) {
        console.error('Error removing from favorites:', deleteError);
        toast.error('Erreur lors de la suppression des favoris');
        return { isFavorite: true }; // Return true to indicate it was already a favorite
      }

      toast.success('Retiré des favoris');
      return { isFavorite: false };
    } else {
      // Add to favorites
      const { error: insertError } = await supabase
        .from('favorite_suppliers')
        .insert({
          user_id: userId,
          supplier_id: fournisseurId
        });

      if (insertError) {
        console.error('Error adding to favorites:', insertError);
        toast.error('Erreur lors de l\'ajout aux favoris');
        return { isFavorite: false }; // Return false to indicate it was not yet a favorite
      }

      toast.success('Ajouté aux favoris');
      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    toast.error('Erreur lors de la modification des favoris');
    return { isFavorite: false };
  }
};

// Send a message in a conversation
export const sendMessage = async (
  conversationId: string,
  content: string,
  senderId: string
) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        read: false
      })
      .select('*, sender:sender_id(*), receiver:receiver_id(*)')
      .single();

    if (error) {
      throw error;
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Erreur lors de l\'envoi du message');
    return null;
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

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    toast.error('Erreur lors du marquage des messages comme lus');
  }
};
