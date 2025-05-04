
import { supabase } from '@/integrations/supabase/client';
import { Supplier } from '@/types/supabase';

// Define minimal types to avoid circular references
interface MessageData {
  id: string;
  sender_id: string;
  receiver_id?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  conversation_id: string; 
  is_read?: boolean;
}

interface ConversationData {
  id: string;
  participant1_id?: string;
  participant2_id?: string;
  last_message_at?: string;
  created_at?: string;
  participant?: {
    id: string;
    display_name?: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
}

// Create a conversation
export const createConversation = async (userId: string, supplierId: string): Promise<string> => {
  try {
    // First check if a conversation already exists
    const { data: existingConversations, error: searchError } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .or(`participant1_id.eq.${supplierId},participant2_id.eq.${supplierId}`)
      .limit(1);

    if (searchError) {
      console.error('Error searching for existing conversation:', searchError);
      throw new Error('Failed to search for existing conversation: ' + searchError.message);
    }

    // No conversation exists, create a new one
    if (!existingConversations || existingConversations.length === 0) {
      console.log('Creating new conversation between', userId, 'and', supplierId);
      const { data: newConv, error: insertError } = await supabase
        .from('conversations')
        .insert({
          participant1_id: userId,
          participant2_id: supplierId,
          created_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating conversation:', insertError);
        throw new Error('Failed to create conversation: ' + insertError.message);
      }

      if (!newConv) {
        throw new Error('No conversation was created');
      }

      console.log('Created new conversation:', newConv.id);
      return newConv.id;
    }

    // Return the existing conversation ID
    console.log('Found existing conversation:', existingConversations[0].id);
    return existingConversations[0].id;
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
};

// Get user conversations
export const getConversations = async (userId: string): Promise<ConversationData[]> => {
  try {
    // Query conversations where the user is either participant
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        *,
        profiles!conversations_participant1_id_fkey (id, display_name, avatar),
        profiles!conversations_participant2_id_fkey (id, display_name, avatar),
        messages (content, created_at)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return [];
    }

    // No conversations found
    if (!conversationsData || conversationsData.length === 0) {
      return [];
    }

    // Process conversations to get the correct participant data
    const conversations: ConversationData[] = conversationsData.map((conversation) => {
      // Determine which participant is the other user
      const isParticipant1 = conversation.participant1_id === userId;
      const otherParticipantId = isParticipant1 ? conversation.participant2_id : conversation.participant1_id;
      
      // Extract profiles data using explicit type assumption
      const participant1Data = conversation.profiles_conversations_participant1_id_fkey;
      const participant2Data = conversation.profiles_conversations_participant2_id_fkey;
      
      // Select the appropriate profile based on which participant the current user is
      const otherParticipantData = isParticipant1 ? participant2Data : participant1Data;

      // Get last message
      const messages = conversation.messages || [];
      const lastMessage = messages.length > 0 
        ? { 
            content: messages[0].content || '', 
            created_at: messages[0].created_at || '' 
          } 
        : undefined;

      return {
        id: conversation.id,
        participant1_id: conversation.participant1_id,
        participant2_id: conversation.participant2_id,
        last_message_at: conversation.last_message_at,
        created_at: conversation.created_at,
        // Add participant info
        participant: {
          id: otherParticipantId || '',
          display_name: otherParticipantData?.display_name || 'Unknown',
          avatar: otherParticipantData?.avatar || '',
        },
        lastMessage
      };
    });

    return conversations;
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
};

// Alias for getConversations to support the old function name
export const getUserConversations = getConversations;

// Get conversation details
export const getConversation = async (conversationId: string, userId: string): Promise<ConversationData | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        profiles!conversations_participant1_id_fkey (id, display_name, avatar),
        profiles!conversations_participant2_id_fkey (id, display_name, avatar)
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    // Determine which participant is the other user
    const isParticipant1 = data.participant1_id === userId;
    const otherParticipantId = isParticipant1 ? data.participant2_id : data.participant1_id;
    
    // Extract profiles data using explicit type assumption
    const participant1Data = data.profiles_conversations_participant1_id_fkey;
    const participant2Data = data.profiles_conversations_participant2_id_fkey;
    
    // Select the appropriate profile based on which participant the current user is
    const otherParticipantData = isParticipant1 ? participant2Data : participant1Data;

    return {
      id: data.id,
      participant1_id: data.participant1_id,
      participant2_id: data.participant2_id,
      last_message_at: data.last_message_at,
      created_at: data.created_at,
      participant: {
        id: otherParticipantId || '',
        display_name: otherParticipantData?.display_name || 'Unknown',
        avatar: otherParticipantData?.avatar || '',
      }
    };
  } catch (error) {
    console.error('Error in getConversation:', error);
    return null;
  }
};

// Get conversation messages
export const getConversationMessages = async (conversationId: string): Promise<MessageData[]> => {
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

    // Add conversation_id to each message if it doesn't exist
    const messages: MessageData[] = (data || []).map(msg => ({
      ...msg,
      conversation_id: msg.conversation_id || conversationId
    }));

    return messages;
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
};

// Send a message
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
        content: content,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    // Also update the conversation's last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data as MessageData;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true }) 
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    return false;
  }
};

// Mark all messages in a conversation as read
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

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
