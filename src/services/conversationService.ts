
// Fix for the function that was causing the error
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Function to get user's conversations
export const getUserConversations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:participant1_id (id, name:display_name, avatar),
        participant2:participant2_id (id, name:display_name, avatar)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Format the conversations to show the other participant's info
    const formattedConversations = data.map(conversation => {
      const isParticipant1 = conversation.participant1_id === userId;
      const otherParticipant = isParticipant1 ? conversation.participant2 : conversation.participant1;
      
      return {
        id: conversation.id,
        participant: otherParticipant,
        lastMessageAt: conversation.last_message_at,
        createdAt: conversation.created_at
      };
    });

    return formattedConversations;
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    return [];
  }
};

// Get conversation by ID
export const getConversationById = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:participant1_id (id, name:display_name, avatar),
        participant2:participant2_id (id, name:display_name, avatar)
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getConversationById:', error);
    return null;
  }
};

// Get conversation messages
export const getConversationMessages = async (conversationId: string) => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        created_at,
        sender:sender_id (id, name:display_name, avatar)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at');

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return messages || [];
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
};

// Send message in conversation
export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  try {
    // Add message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Update last_message_at in conversation
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (updateError) throw updateError;

    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Failed to send message');
    return null;
  }
};

// Create a new conversation between two users
export const createConversation = async (userId1: string, userId2: string) => {
  try {
    // Check if conversation already exists
    const { data: existingConv, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${userId1},participant2_id.eq.${userId2}),and(participant1_id.eq.${userId2},participant2_id.eq.${userId1})`)
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing conversation:', checkError);
      throw checkError;
    }

    // If conversation exists, return its ID
    if (existingConv) {
      return existingConv.id;
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant1_id: userId1,
        participant2_id: userId2
      })
      .select('id')
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    toast.error('Failed to create conversation');
    return null;
  }
};

// Create a conversation with a supplier
export const createSupplierConversation = async (userId: string, supplierId: string) => {
  try {
    // Get the supplier's user_id
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('user_id')
      .eq('id', supplierId)
      .single();

    if (supplierError || !supplier || !supplier.user_id) {
      console.error('Error fetching supplier:', supplierError);
      toast.error('This supplier does not have an associated user account');
      return null;
    }

    // Create conversation with the supplier's user
    return createConversation(userId, supplier.user_id);
  } catch (error) {
    console.error('Error in createSupplierConversation:', error);
    toast.error('Failed to start conversation with supplier');
    return null;
  }
};

// Toggle a fournisseur as favorite
export const toggleFavoriteFournisseur = async (userId: string, fournisseurId: string) => {
  try {
    // Check if already a favorite
    const { data: checkData, error: checkError } = await supabase
      .rpc('check_favorite_supplier', {
        p_user_id: userId,
        p_supplier_id: fournisseurId
      });
    
    if (checkError) throw checkError;
    
    const isFavorite = checkData;
    
    if (isFavorite) {
      // Remove from favorites
      const { error: removeError } = await supabase
        .rpc('remove_favorite_supplier', {
          p_user_id: userId,
          p_supplier_id: fournisseurId
        });
        
      if (removeError) throw removeError;
      
      return { isFavorite: false };
    } else {
      // Add to favorites
      const { error: addError } = await supabase
        .rpc('add_favorite_supplier', {
          p_user_id: userId,
          p_supplier_id: fournisseurId
        });
        
      if (addError) throw addError;
      
      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    toast.error('Error updating favorites');
    return false;
  }
};

// Check if a fournisseur is in user's favorites
export const isFournisseurFavorite = async (userId: string, fournisseurId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('check_favorite_supplier', {
        p_user_id: userId,
        p_supplier_id: fournisseurId
      });
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking if fournisseur is favorite:', error);
    return false;
  }
};

// Get user's favorite fournisseurs
export const getFavoriteSuppliers = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_favorite_suppliers', { p_user_id: userId });
    
    if (error) {
      console.error('Error fetching favorite suppliers:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getFavoriteSuppliers:', error);
    return [];
  }
};
