import { supabase } from '@/integrations/supabase/client';
<<<<<<< HEAD
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

export const createConversation = async (userId: string, participantId: string): Promise<string | null> => {
=======
import { ConversationData, MessageData, ParticipantProfile } from '@/types/auth';

// Get conversations for a user
export const getUserConversations = async (userId: string): Promise<ConversationData[]> => {
>>>>>>> 613c7b9f97e115c0ac8ee4273067fe2c9eff70a5
  try {
    // Get conversations where user is either participant1 or participant2
    const { data: conversationsData, error } = await supabase
      .from('conversations')
      .select(`
        id,
        participant1_id,
        participant2_id,
        created_at,
        last_message_at
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Format conversations and fetch participant details
    const conversations: ConversationData[] = [];

    for (const conv of conversationsData || []) {
      // Determine the other participant's id (not the current user)
      const otherParticipantId = conv.participant1_id === userId ? 
        conv.participant2_id : conv.participant1_id;
      
      if (!otherParticipantId) continue;
      
      // Fetch the other participant's details
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .eq('id', otherParticipantId)
        .single();
      
      // Create participant object
      const participant: ParticipantProfile = {
        id: otherParticipantId,
        name: profileData?.display_name || 'Unknown',
        avatar: profileData?.avatar
      };
      
      // Add to conversations list
      conversations.push({
        id: conv.id,
        participant,
        lastMessageAt: conv.last_message_at || conv.created_at,
        createdAt: conv.created_at,
        userId
      });
    }
<<<<<<< HEAD

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
=======
    
    return conversations;
>>>>>>> 613c7b9f97e115c0ac8ee4273067fe2c9eff70a5
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    return [];
  }
};

// Get a specific conversation by ID
export const getConversation = async (conversationId: string, userId: string): Promise<ConversationData | null> => {
  try {
    const { data: conversationData, error } = await supabase
      .from('conversations')
      .select(`
        id,
        participant1_id,
        participant2_id,
        created_at,
        last_message_at
      `)
      .eq('id', conversationId)
      .single();
    
    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    // Determine the other participant's id (not the current user)
    const otherParticipantId = conversationData.participant1_id === userId ? 
      conversationData.participant2_id : conversationData.participant1_id;
    
    if (!otherParticipantId) return null;

    // Fetch the other participant's details
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, display_name, avatar')
      .eq('id', otherParticipantId)
      .single();

    // Create participant object
    const participant: ParticipantProfile = {
      id: otherParticipantId,
      name: profileData?.display_name || 'Unknown',
      avatar: profileData?.avatar
    };

    return {
      id: conversationData.id,
      participant,
      lastMessageAt: conversationData.last_message_at || conversationData.created_at,
      createdAt: conversationData.created_at,
      userId
    };
  } catch (error) {
    console.error('Error in getConversation:', error);
    return null;
  }
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId: string): Promise<MessageData[]> => {
  try {
    const { data: messagesData, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    // Map the messages to the MessageData type
    const messages: MessageData[] = messagesData.map(msg => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      sender_id: msg.sender_id,
      receiver_id: msg.receiver_id,
      content: msg.content,
      created_at: msg.created_at,
      read: msg.read
    }));
    
    return messages;
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
};

// Create a new conversation between users
export const createConversation = async (userId1: string, userId2: string): Promise<string | null> => {
  try {
    // Check if a conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${userId1},participant2_id.eq.${userId2}),and(participant1_id.eq.${userId2},participant2_id.eq.${userId1})`)
      .maybeSingle();
    
    if (existingConversation) {
      return existingConversation.id;
    }
    
    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant1_id: userId1,
        participant2_id: userId2,
        created_at: new Date().toISOString(),
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

// Send a message in a conversation
export const sendMessage = async (
  conversationId: string, 
  senderId: string, 
  receiverId: string, 
  content: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error sending message:', error);
      return false;
    }
    
    // Update the conversation's last_message_at
    await supabase
      .from('conversations')
      .update({ 
        last_message_at: new Date().toISOString() 
      })
      .eq('id', conversationId);
    
    return true;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return false;
  }
};

// Mark messages as read for a user in a conversation
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<boolean> => {
    try {
      // Update messages where the receiver is the current user and the message is not read yet
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

// Alias for getConversations for backward compatibility
export const getUserConversations = getConversations;

// Get a single conversation by ID
export const getConversation = async (conversationId: string): Promise<ConversationData | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        last_message_at,
        created_at,
        participant1_id,
        participant2_id
      `)
      .eq('id', conversationId)
      .single();

    if (error || !data) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    // Get the participants
    const participants = await getParticipants(conversationId);
    if (!participants) {
      return null;
    }

    const [participant1Id, participant2Id] = participants;

    // For simplicity, we'll use the first participant as the user
    const userId = participant1Id;
    const otherParticipantId = participant2Id;

    // Get the other participant's profile
    const participantProfile = await getUserProfile(otherParticipantId);
    if (!participantProfile) {
      return null;
    }

    return {
      id: data.id,
      participant: participantProfile,
      lastMessageAt: data.last_message_at || data.created_at,
      createdAt: data.created_at,
      userId,
    };
  } catch (error) {
    console.error('Error in getConversation:', error);
    return null;
  }
};

// Alias for getMessages for backward compatibility
export const getConversationMessages = getMessages;

// Get favorite suppliers
export const getFavoriteSuppliers = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc(
      'get_favorite_suppliers',
      { p_user_id: userId }
    );

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
