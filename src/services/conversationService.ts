
import { supabase } from '@/integrations/supabase/client';
import { toggleFavoriteFournisseur as toggleFavSupplier, isFournisseurFavorite as isSupplierFav } from '@/services/supplierService';

export interface ParticipantProfile {
  id: string;
  name: string;
  avatar?: string;
}

export interface ConversationData {
  id: string;
  participant: ParticipantProfile;
  lastMessageAt: string;
  createdAt: string;
  userId: string;
}

export interface MessageData {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read?: boolean;
}

// Re-export supplier functions for backward compatibility
export const toggleFavoriteFournisseur = toggleFavSupplier;
export const isFournisseurFavorite = isSupplierFav;

// Get all conversations for a user
export const getConversations = async (userId: string): Promise<ConversationData[]> => {
  try {
    // Get conversations where user is either participant1 or participant2
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        last_message_at,
        created_at,
        participant1_id,
        participant2_id
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Map the conversations to get the other participant's profile
    const conversationsWithProfiles: ConversationData[] = await Promise.all(
      data.map(async (conversation: {
        id: string;
        last_message_at?: string;
        created_at: string;
        participant1_id: string;
        participant2_id: string;
      }) => {
        // Determine the other participant
        const otherParticipantId =
          conversation.participant1_id === userId
            ? conversation.participant2_id
            : conversation.participant1_id;

        // Get the other participant's profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, display_name, avatar')
          .eq('id', otherParticipantId)
          .single();

        const participant: ParticipantProfile = {
          id: otherParticipantId,
          name: profileData?.display_name || 'Utilisateur',
          avatar: profileData?.avatar || undefined,
        };

        return {
          id: conversation.id,
          participant,
          lastMessageAt: conversation.last_message_at || conversation.created_at,
          createdAt: conversation.created_at,
          userId,
        };
      })
    );

    return conversationsWithProfiles;
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
};

// Get messages for a conversation
export const getMessages = async (conversationId: string): Promise<MessageData[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    // Cast the data to MessageData with read property
    const messages: MessageData[] = data.map((message: any) => ({
      id: message.id,
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      content: message.content,
      created_at: message.created_at,
      read: message.read || false
    }));

    return messages;
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
};

// Send a new message
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string
): Promise<MessageData | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    // Update last_message_at in the conversation
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Cast to MessageData with read property
    const message: MessageData = {
      id: data.id,
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      content: data.content,
      created_at: data.created_at,
      read: false
    };

    return message;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    return false;
  }
};

// Create a new conversation or get an existing one
export const createConversation = async (userId: string, participantId: string): Promise<string | null> => {
  try {
    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${userId},participant2_id.eq.${participantId}),and(participant1_id.eq.${participantId},participant2_id.eq.${userId})`)
      .single();

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create a new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant1_id: userId,
        participant2_id: participantId,
        last_message_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error in createConversation:', error);
    return null;
  }
};

// Helper function to get participants for a conversation
const getParticipants = async (conversationId: string): Promise<[string, string] | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .single();

    if (error || !data) {
      console.error('Error fetching conversation participants:', error);
      return null;
    }

    return [data.participant1_id, data.participant2_id];
  } catch (error) {
    console.error('Error in getParticipants:', error);
    return null;
  }
};

// Helper function to get user profile
const getUserProfile = async (userId: string): Promise<ParticipantProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.display_name || 'Unknown User',
      avatar: data.avatar || undefined,
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

// Add aliases for backward compatibility
export const getUserConversations = getConversations;
export const getConversationMessages = getMessages;
