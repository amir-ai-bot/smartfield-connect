
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Conversation, Message, Profile } from '@/types/supabase';

// Get conversations for the current user
export const getConversations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1: participant1_id(id, display_name, avatar, email),
        participant2: participant2_id(id, display_name, avatar, email)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Map the conversations to include user information
    return data.map(conversation => {
      // Determine if the current user is participant1 or participant2
      const isParticipant1 = conversation.participant1_id === userId;
      const currentUser = isParticipant1 ? conversation.participant1 : conversation.participant2;
      const otherUser = isParticipant1 ? conversation.participant2 : conversation.participant1;

      // Map the profile data
      const participant1Profile = {
        id: conversation.participant1?.id || '',
        name: conversation.participant1?.display_name || 'Unknown',
        avatar: conversation.participant1?.avatar || null,
        email: conversation.participant1?.email || ''
      };

      const participant2Profile = {
        id: conversation.participant2?.id || '',
        name: conversation.participant2?.display_name || 'Unknown',
        avatar: conversation.participant2?.avatar || null,
        email: conversation.participant2?.email || ''
      };

      return {
        id: conversation.id,
        participant1_id: conversation.participant1_id,
        participant2_id: conversation.participant2_id,
        created_at: conversation.created_at,
        last_message_at: conversation.last_message_at,
        participant1Profile,
        participant2Profile,
        otherProfile: isParticipant1 ? participant2Profile : participant1Profile
      };
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    toast.error('Erreur lors de la récupération des conversations');
    return [];
  }
};

// Get a specific conversation by ID
export const getConversation = async (conversationId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1: participant1_id(id, display_name, avatar, email),
        participant2: participant2_id(id, display_name, avatar, email)
      `)
      .eq('id', conversationId)
      .single();

    if (error) throw error;

    // Determine if the current user is participant1 or participant2
    const isParticipant1 = data.participant1_id === userId;
    
    // Map the profile data
    const participant1Profile = {
      id: data.participant1?.id || '',
      name: data.participant1?.display_name || 'Unknown',
      avatar: data.participant1?.avatar || null,
      email: data.participant1?.email || ''
    };

    const participant2Profile = {
      id: data.participant2?.id || '',
      name: data.participant2?.display_name || 'Unknown',
      avatar: data.participant2?.avatar || null,
      email: data.participant2?.email || ''
    };

    return {
      id: data.id,
      participant1_id: data.participant1_id,
      participant2_id: data.participant2_id,
      created_at: data.created_at,
      last_message_at: data.last_message_at,
      participant1Profile,
      participant2Profile,
      otherProfile: isParticipant1 ? participant2Profile : participant1Profile
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    toast.error('Erreur lors de la récupération de la conversation');
    return null;
  }
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender: sender_id(id, display_name, avatar),
        receiver: receiver_id(id, display_name, avatar)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map(message => ({
      id: message.id,
      content: message.content,
      created_at: message.created_at,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      sender: {
        id: message.sender?.id || '',
        name: message.sender?.display_name || 'Unknown',
        avatar: message.sender?.avatar || null
      },
      receiver: {
        id: message.receiver?.id || '',
        name: message.receiver?.display_name || 'Unknown',
        avatar: message.receiver?.avatar || null
      },
      read: message.read || false
    }));
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    toast.error('Erreur lors de la récupération des messages');
    return [];
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

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

// Alias for getConversations for backward compatibility
export const getUserConversations = getConversations;

// Functions for favorite suppliers
export const isFournisseurFavorite = async (userId: string, fournisseurId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('check_favorite_supplier', { 
        p_user_id: userId, 
        p_supplier_id: fournisseurId 
      });

    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking if supplier is favorite:', error);
    return false;
  }
};

export const toggleFavoriteFournisseur = async (userId: string, fournisseurId: string, isFavorite: boolean) => {
  try {
    const functionName = isFavorite 
      ? 'remove_favorite_supplier' 
      : 'add_favorite_supplier';
    
    const { data, error } = await supabase
      .rpc(functionName, { 
        p_user_id: userId, 
        p_supplier_id: fournisseurId 
      });

    if (error) throw error;
    
    return !isFavorite;
  } catch (error) {
    console.error('Error toggling favorite supplier:', error);
    toast.error('Erreur lors de la modification des favoris');
    return isFavorite; // Return original state if failed
  }
};

export const getFavoriteFournisseurs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_favorite_suppliers', { p_user_id: userId });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting favorite suppliers:', error);
    toast.error('Erreur lors de la récupération des fournisseurs favoris');
    return [];
  }
};
