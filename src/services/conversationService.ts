import { supabase } from '@/integrations/supabase/client';
import { ConversationData, MessageData, ParticipantProfile } from '@/types/auth';

// Get conversations for a user
export const getUserConversations = async (userId: string): Promise<ConversationData[]> => {
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
    
    return conversations;
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
