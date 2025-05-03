
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
        if (!conversation.participant2) {
          // Handle case where participant2 might not exist
          return {
            id: conversation.id,
            otherUser: {
              id: conversation.participant2_id || '',
              name: 'Utilisateur inconnu',
              avatar: null,
              email: '',
              role: 'user'
            },
            lastMessageAt: conversation.last_message_at
          };
        }
        otherUser = {
          id: conversation.participant2.id || '',
          name: conversation.participant2.display_name || 'Utilisateur inconnu',
          avatar: conversation.participant2.avatar || null,
          email: conversation.participant2.email || '',
          role: conversation.participant2.role || 'user'
        };
      } else {
        if (!conversation.participant1) {
          // Handle case where participant1 might not exist
          return {
            id: conversation.id,
            otherUser: {
              id: conversation.participant1_id || '',
              name: 'Utilisateur inconnu',
              avatar: null,
              email: '',
              role: 'user'
            },
            lastMessageAt: conversation.last_message_at
          };
        }
        otherUser = {
          id: conversation.participant1.id || '',
          name: conversation.participant1.display_name || 'Utilisateur inconnu',
          avatar: conversation.participant1.avatar || null,
          email: conversation.participant1.email || '',
          role: conversation.participant1.role || 'user'
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

    // Determine which participant is the other user
    let otherUser;
    let currentUser;
    let isParticipant1 = data.participant1_id === userId;

    if (isParticipant1) {
      if (!data.participant2 || typeof data.participant2 !== 'object') {
        // Handle case where participant2 might not exist or is an error
        otherUser = {
          id: data.participant2_id || '',
          name: 'Utilisateur inconnu',
          avatar: null,
          email: '',
          role: 'user'
        };
      } else {
        otherUser = {
          id: data.participant2.id || '',
          name: data.participant2.display_name || 'Utilisateur inconnu',
          avatar: data.participant2.avatar || null,
          email: data.participant2.email || '',
          role: data.participant2.role || 'user'
        };
      }
      
      if (data.participant1 && typeof data.participant1 === 'object') {
        currentUser = {
          id: data.participant1.id || userId,
          name: data.participant1.display_name || 'Vous',
          avatar: data.participant1.avatar || null,
          email: data.participant1.email || '',
          role: data.participant1.role || 'user'
        };
      } else {
        currentUser = {
          id: userId,
          name: 'Vous',
          avatar: null,
          email: '',
          role: 'user'
        };
      }
    } else {
      if (!data.participant1 || typeof data.participant1 !== 'object') {
        // Handle case where participant1 might not exist or is an error
        otherUser = {
          id: data.participant1_id || '',
          name: 'Utilisateur inconnu',
          avatar: null,
          email: '',
          role: 'user'
        };
      } else {
        otherUser = {
          id: data.participant1.id || '',
          name: data.participant1.display_name || 'Utilisateur inconnu',
          avatar: data.participant1.avatar || null,
          email: data.participant1.email || '',
          role: data.participant1.role || 'user'
        };
      }
      
      if (data.participant2 && typeof data.participant2 === 'object') {
        currentUser = {
          id: data.participant2.id || userId,
          name: data.participant2.display_name || 'Vous',
          avatar: data.participant2.avatar || null,
          email: data.participant2.email || '',
          role: data.participant2.role || 'user'
        };
      } else {
        currentUser = {
          id: userId,
          name: 'Vous',
          avatar: null,
          email: '',
          role: 'user'
        };
      }
    }

    return {
      id: data.id,
      otherUser,
      currentUser
    };
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

    if (!data || data.length === 0) {
      return [];
    }

    // Map the data to a more usable format
    return data.map(message => {
      const sender = message.sender && typeof message.sender === 'object' ? {
        id: message.sender.id || message.sender_id || '',
        name: message.sender.display_name || 'Utilisateur inconnu',
        avatar: message.sender.avatar || null
      } : {
        id: message.sender_id || '',
        name: 'Utilisateur inconnu',
        avatar: null
      };

      const receiver = message.receiver && typeof message.receiver === 'object' ? {
        id: message.receiver.id || message.receiver_id || '',
        name: message.receiver.display_name || 'Utilisateur inconnu',
        avatar: message.receiver.avatar || null
      } : {
        id: message.receiver_id || '',
        name: 'Utilisateur inconnu',
        avatar: null
      };

      return {
        id: message.id,
        sender,
        receiver,
        content: message.content,
        createdAt: message.created_at
      };
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    toast.error('Erreur lors de la récupération des messages');
    return [];
  }
};

// Send a message
export const sendMessage = async (
  conversationId: string, 
  senderId: string, 
  receiverId: string, 
  content: string
) => {
  try {
    // Check if the conversation exists
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .single();

    if (conversationError) {
      throw conversationError;
    }

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
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No conversation found
        return null;
      }
      throw error;
    }

    return data;
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
