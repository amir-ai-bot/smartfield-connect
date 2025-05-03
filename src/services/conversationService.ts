
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConversationProfile {
  id?: string;
  name?: string;
  avatar?: string | null;
  email?: string;
  role?: string;
  display_name?: string;
}

// Get a conversation by ID
export const getConversation = async (conversationId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:participant1_id(id, display_name, avatar, email, role),
        participant2:participant2_id(id, display_name, avatar, email, role)
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) return null;

    // Create a typed response with safe property access
    const participant1Profile: ConversationProfile = data.participant1 ? {
      id: data.participant1?.id || '',
      name: data.participant1?.display_name || '',
      avatar: data.participant1?.avatar || null,
      email: data.participant1?.email || '',
      role: data.participant1?.role || '',
    } : {};

    const participant2Profile: ConversationProfile = data.participant2 ? { 
      id: data.participant2?.id || '',
      name: data.participant2?.display_name || '',
      avatar: data.participant2?.avatar || null,
      email: data.participant2?.email || '',
      role: data.participant2?.role || '',
    } : {};

    return {
      ...data,
      participant1Profile,
      participant2Profile
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
};

// Get conversations for a user
export const getConversations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:participant1_id(id, display_name, avatar, email, role),
        participant2:participant2_id(id, display_name, avatar, email, role),
        messages:id(id, content, created_at)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data?.map(conversation => {
      // Determine who is the other participant
      const isParticipant1 = conversation.participant1_id === userId;
      
      // Create safe accessor for the other participant
      const otherParticipantProfile = isParticipant1 
        ? (conversation.participant2 ? {
            id: conversation.participant2?.id || '',
            name: conversation.participant2?.display_name || '',
            avatar: conversation.participant2?.avatar || null,
            email: conversation.participant2?.email || '',
            role: conversation.participant2?.role || '',
          } : {})
        : (conversation.participant1 ? {
            id: conversation.participant1?.id || '',
            name: conversation.participant1?.display_name || '',
            avatar: conversation.participant1?.avatar || null,
            email: conversation.participant1?.email || '',
            role: conversation.participant1?.role || '',
          } : {});
      
      // Treat messages as an array (with safe fallback)
      const recentMessages = Array.isArray(conversation.messages) 
        ? conversation.messages 
        : [];
      
      return {
        ...conversation,
        otherParticipantProfile,
        recentMessage: recentMessages[0] || null
      };
    }) || [];
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

// Get all messages for a conversation
export const getConversationMessages = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, display_name, avatar),
        receiver:receiver_id(id, display_name, avatar)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data?.map(message => {
      // Create safe accessors for sender and receiver profiles
      const senderProfile = message.sender ? {
        id: message.sender?.id || '',
        name: message.sender?.display_name || '',
        avatar: message.sender?.avatar || null,
      } : {};
      
      const receiverProfile = message.receiver ? {
        id: message.receiver?.id || '',
        name: message.receiver?.display_name || '',
        avatar: message.receiver?.avatar || null,
      } : {};
      
      return {
        ...message,
        sender: senderProfile,
        receiver: receiverProfile,
        read: message.read || false
      };
    }) || [];
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    return [];
  }
};

// Send a message
export const sendMessage = async (conversationId: string, content: string, senderId: string) => {
  try {
    // Get the conversation to find the receiver
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    // Find the receiver
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
        content,
        read: false
      })
      .select('*, sender_id(id, display_name, avatar)')
      .single();

    if (error) throw error;

    // Update the conversation's last_message_at
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
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .neq('read', true);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

// Toggle whether a supplier is a favorite
export const toggleFavoriteFournisseur = async (userId: string, supplierId: string) => {
  try {
    // Check if the favorite already exists
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorite_suppliers')
      .select('*')
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingFavorite) {
      // Remove favorite
      const { error: deleteError } = await supabase
        .from('favorite_suppliers')
        .delete()
        .eq('user_id', userId)
        .eq('supplier_id', supplierId);

      if (deleteError) throw deleteError;
      return { isFavorite: false };
    } else {
      // Add favorite
      const { error: insertError } = await supabase
        .from('favorite_suppliers')
        .insert({ user_id: userId, supplier_id: supplierId });

      if (insertError) throw insertError;
      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    toast.error('Erreur lors de la modification des favoris');
    return false;
  }
};

// Check if a supplier is a favorite
export const isFournisseurFavorite = async (userId: string, supplierId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('favorite_suppliers')
      .select('*')
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Get favorite suppliers
export const getFavoriteFournisseurs = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_favorite_suppliers', { p_user_id: userId });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting favorite suppliers:', error);
    toast.error('Erreur lors de la récupération des fournisseurs favoris');
    return [];
  }
};

// Get user conversations - Alias for getConversations for backward compatibility
export const getUserConversations = getConversations;
