
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Get all conversations for a user
export const getConversations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:profiles!conversations_participant1_id_fkey(*),
        participant2:profiles!conversations_participant2_id_fkey(*)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map the data to a more usable format
    return data.map(conversation => {
      // Determine which participant is the other user
      let otherUser;
      let isParticipant1 = conversation.participant1_id === userId;

      if (isParticipant1) {
        otherUser = conversation.participant2 && typeof conversation.participant2 === 'object' ? {
          id: conversation.participant2.id || conversation.participant2_id || '',
          name: conversation.participant2.display_name || 'Utilisateur inconnu',
          avatar: conversation.participant2.avatar || null,
          email: conversation.participant2.email || '',
          role: conversation.participant2.role || 'user'
        } : {
          id: conversation.participant2_id || '',
          name: 'Utilisateur inconnu',
          avatar: null,
          email: '',
          role: 'user'
        };
      } else {
        otherUser = conversation.participant1 && typeof conversation.participant1 === 'object' ? {
          id: conversation.participant1.id || conversation.participant1_id || '',
          name: conversation.participant1.display_name || 'Utilisateur inconnu',
          avatar: conversation.participant1.avatar || null,
          email: conversation.participant1.email || '',
          role: conversation.participant1.role || 'user'
        } : {
          id: conversation.participant1_id || '',
          name: 'Utilisateur inconnu',
          avatar: null,
          email: '',
          role: 'user'
        };
      }

      return {
        id: conversation.id,
        otherUser,
        lastMessageAt: conversation.last_message_at
      };
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    toast.error('Erreur lors de la récupération des conversations');
    return [];
  }
};

// Get user conversations - alias for getConversations
export const getUserConversations = getConversations;

// Get a specific conversation
export const getConversation = async (conversationId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:profiles!conversations_participant1_id_fkey(*),
        participant2:profiles!conversations_participant2_id_fkey(*)
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return data; // Return the full conversation data with profiles
  } catch (error) {
    console.error('Error getting conversation:', error);
    toast.error('Erreur lors de la récupération de la conversation');
    return null;
  }
};

// Get messages for a conversation
export const getMessages = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting messages:', error);
    toast.error('Erreur lors de la récupération des messages');
    return [];
  }
};

// Alias for getMessages to match the import in ConversationDetail.tsx
export const getConversationMessages = getMessages;

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

// Send a message
export const sendMessage = async (conversationId: string, content: string, senderId: string) => {
  try {
    // Get the conversation to determine the receiver
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .single();

    if (conversationError) {
      throw conversationError;
    }

    const receiverId = conversationData.participant1_id === senderId 
      ? conversationData.participant2_id 
      : conversationData.participant1_id;
    
    // Insert the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update the conversation's last_message_at
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Erreur lors de l\'envoi du message');
    throw error;
  }
};

// Check if a user has a conversation with a supplier
export const checkUserSupplierConversation = async (userId: string, supplierId: string) => {
  try {
    // Get the supplier's user_id
    const { data: supplierData, error: supplierError } = await supabase
      .from('suppliers')
      .select('user_id')
      .eq('id', supplierId)
      .single();

    if (supplierError) {
      throw supplierError;
    }

    const supplierUserId = supplierData.user_id;

    // Check if a conversation already exists
    const { data, error } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${userId},participant2_id.eq.${supplierUserId}),and(participant1_id.eq.${supplierUserId},participant2_id.eq.${userId})`)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error checking user supplier conversation:', error);
    return null;
  }
};

// Toggle supplier as favorite
export const toggleFavoriteFournisseur = async (userId: string, supplierId: string) => {
  try {
    // Check if supplier is already a favorite
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorite_suppliers')
      .select('id')
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existingFavorite) {
      // Remove from favorites
      const { error: removeError } = await supabase
        .from('favorite_suppliers')
        .delete()
        .eq('id', existingFavorite.id);

      if (removeError) {
        throw removeError;
      }

      return { isFavorite: false };
    } else {
      // Add to favorites
      const { error: addError } = await supabase
        .from('favorite_suppliers')
        .insert({
          user_id: userId,
          supplier_id: supplierId
        });

      if (addError) {
        throw addError;
      }

      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite supplier:', error);
    toast.error('Erreur lors de la mise à jour des favoris');
    return false;
  }
};

// Check if a supplier is in the user's favorites
export const isFournisseurFavorite = async (userId: string, supplierId: string) => {
  try {
    const { data, error } = await supabase
      .from('favorite_suppliers')
      .select('id')
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Get all favorite suppliers for a user
export const getFavoriteFournisseurs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('favorite_suppliers')
      .select(`
        *,
        suppliers:supplier_id(*)
      `)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Extract the suppliers from the response
    return data.map(item => item.suppliers).filter(Boolean);
  } catch (error) {
    console.error('Error getting favorite suppliers:', error);
    toast.error('Erreur lors de la récupération des favoris');
    return [];
  }
};

