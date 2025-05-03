
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Rating } from '@/types/auth';

// Get conversations for the current user
export const getConversations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:profiles!conversations_participant1_id_fkey (id, display_name, avatar, email),
        participant2:profiles!conversations_participant2_id_fkey (id, display_name, avatar, email)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Map the conversations to include user information, handling potential nulls safely
    return data.map(conversation => {
      // Determine if the current user is participant1 or participant2
      const isParticipant1 = conversation.participant1_id === userId;
      
      // Handle potential null relations with default values
      const participant1 = conversation.participant1 || {};
      const participant2 = conversation.participant2 || {};
      
      // Map the profile data with safe access
      const participant1Profile = {
        id: typeof participant1 === 'object' ? (participant1.id || '') : '',
        name: typeof participant1 === 'object' ? (participant1.display_name || 'Unknown') : 'Unknown',
        avatar: typeof participant1 === 'object' ? (participant1.avatar || null) : null,
        email: typeof participant1 === 'object' ? (participant1.email || '') : ''
      };

      const participant2Profile = {
        id: typeof participant2 === 'object' ? (participant2.id || '') : '',
        name: typeof participant2 === 'object' ? (participant2.display_name || 'Unknown') : 'Unknown',
        avatar: typeof participant2 === 'object' ? (participant2.avatar || null) : null,
        email: typeof participant2 === 'object' ? (participant2.email || '') : ''
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
export const getConversation = async (conversationId: string, userId?: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:profiles!conversations_participant1_id_fkey (id, display_name, avatar, email),
        participant2:profiles!conversations_participant2_id_fkey (id, display_name, avatar, email)
      `)
      .eq('id', conversationId)
      .single();

    if (error) throw error;

    // Handle potential null relations with default values
    const participant1 = data.participant1 || {};
    const participant2 = data.participant2 || {};

    // Determine if the current user is participant1 or participant2
    const isParticipant1 = userId ? data.participant1_id === userId : false;
    
    // Map the profile data with safe access
    const participant1Profile = {
      id: typeof participant1 === 'object' ? (participant1.id || '') : '',
      name: typeof participant1 === 'object' ? (participant1.display_name || 'Unknown') : 'Unknown',
      avatar: typeof participant1 === 'object' ? (participant1.avatar || null) : null,
      email: typeof participant1 === 'object' ? (participant1.email || '') : ''
    };

    const participant2Profile = {
      id: typeof participant2 === 'object' ? (participant2.id || '') : '',
      name: typeof participant2 === 'object' ? (participant2.display_name || 'Unknown') : 'Unknown',
      avatar: typeof participant2 === 'object' ? (participant2.avatar || null) : null,
      email: typeof participant2 === 'object' ? (participant2.email || '') : ''
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
        sender:profiles!messages_sender_id_fkey (id, display_name, avatar),
        receiver:profiles!messages_receiver_id_fkey (id, display_name, avatar)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map(message => {
      // Handle potential null relations with default values
      const sender = message.sender || {};
      const receiver = message.receiver || {};

      return {
        id: message.id,
        content: message.content,
        created_at: message.created_at,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        sender: {
          id: typeof sender === 'object' ? (sender.id || '') : '',
          name: typeof sender === 'object' ? (sender.display_name || 'Unknown') : 'Unknown',
          avatar: typeof sender === 'object' ? (sender.avatar || null) : null
        },
        receiver: {
          id: typeof receiver === 'object' ? (receiver.id || '') : '',
          name: typeof receiver === 'object' ? (receiver.display_name || 'Unknown') : 'Unknown',
          avatar: typeof receiver === 'object' ? (receiver.avatar || null) : null
        },
        read: message.read || false
      };
    });
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    toast.error('Erreur lors de la récupération des messages');
    return [];
  }
};

// Send a message
export const sendMessage = async (
  conversationId: string,
  content: string,
  senderId: string
) => {
  try {
    // Get the conversation to find the receiver
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    // Determine the receiver
    const receiverId = conversation.participant1_id === senderId
      ? conversation.participant2_id
      : conversation.participant1_id;

    // Insert the message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
        read: false
      })
      .select()
      .single();

    if (msgError) throw msgError;

    // Update the conversation last_message_at
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (updateError) throw updateError;

    return message;
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
export const isFournisseurFavorite = async (userId: string, fournisseurId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('favorite_suppliers')
      .select('*')
      .eq('user_id', userId)
      .eq('supplier_id', fournisseurId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking if supplier is favorite:', error);
    return false;
  }
};

export const toggleFavoriteFournisseur = async (
  userId: string, 
  fournisseurId: string
): Promise<{ isFavorite: boolean }> => {
  try {
    // First check if it's already a favorite
    const isFavorite = await isFournisseurFavorite(userId, fournisseurId);
    
    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorite_suppliers')
        .delete()
        .eq('user_id', userId)
        .eq('supplier_id', fournisseurId);
      
      if (error) throw error;
      
      return { isFavorite: false };
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorite_suppliers')
        .insert({
          user_id: userId,
          supplier_id: fournisseurId
        });
      
      if (error) throw error;
      
      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite supplier:', error);
    toast.error('Erreur lors de la modification des favoris');
    return { isFavorite: await isFournisseurFavorite(userId, fournisseurId) };
  }
};

export const getFavoriteFournisseurs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('favorite_suppliers')
      .select(`
        *,
        supplier:suppliers!favorite_suppliers_supplier_id_fkey (*)
      `)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return data.map(item => item.supplier);
  } catch (error) {
    console.error('Error getting favorite suppliers:', error);
    toast.error('Erreur lors de la récupération des fournisseurs favoris');
    return [];
  }
};

// Add alias for rateFournisseur function from ratingService
import { rateFournisseur as rateSupplier } from '@/services/ratingService';
export const rateFournisseur = rateSupplier;
