
import { supabase } from '@/integrations/supabase/client';

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

export const createConversation = async (userId: string, participantId: string): Promise<string | null> => {
  try {
    // First, check if a conversation already exists between these two users
    const { data: existingConversations, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .or(`participant1_id.eq.${participantId},participant2_id.eq.${participantId}`);

    if (fetchError) {
      console.error('Error checking for existing conversations:', fetchError);
      return null;
    }

    if (existingConversations && existingConversations.length > 0) {
      // Find the conversation between these two users
      for (const conv of existingConversations) {
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conv.id)
          .single();

        if (convError || !conversation) continue;

        // Check if this conversation is between our two users
        if (
          (conversation.participant1_id === userId && conversation.participant2_id === participantId) ||
          (conversation.participant1_id === participantId && conversation.participant2_id === userId)
        ) {
          return conversation.id;
        }
      }
    }

    // If no existing conversation, create a new one
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        participant1_id: userId,
        participant2_id: participantId,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      return null;
    }

    return newConversation.id;
  } catch (error) {
    console.error('Error in createConversation:', error);
    return null;
  }
};

export const getConversations = async (userId: string): Promise<ConversationData[]> => {
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
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map the conversations to get the other participant's profile
    const conversationsWithProfiles: ConversationData[] = await Promise.all(
      data.map(async (conversation) => {
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

export const getMessages = async (
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<MessageData[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string
): Promise<MessageData | null> => {
  try {
    // Insert the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    // Update the conversation's last message timestamp
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
};

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
      .is('read', false);

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

export const getParticipants = async (
  conversationId: string
): Promise<[string, string] | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .single();

    if (error || !data) {
      console.error('Error fetching participants:', error);
      return null;
    }

    return [data.participant1_id, data.participant2_id];
  } catch (error) {
    console.error('Error in getParticipants:', error);
    return null;
  }
};

export const getUserProfile = async (userId: string): Promise<ParticipantProfile | null> => {
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
      name: data.display_name || 'Utilisateur',
      avatar: data.avatar || undefined,
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};
