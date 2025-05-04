
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Define proper types for conversations
export interface ParticipantProfile {
  id: string;
  display_name: string;
  avatar: string | null;
  email: string;
  role: string;
  name?: string;
}

export interface ConversationData {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at?: string;
  created_at?: string;
  participant1?: ParticipantProfile;
  participant2?: ParticipantProfile;
  otherParticipant?: ParticipantProfile;
}

export interface MessageData {
  id: string;
  content?: string;
  sender_id: string;
  receiver_id: string;
  conversation_id?: string;
  created_at?: string;
  updated_at?: string;
  read?: boolean;
  sender?: ParticipantProfile;
  receiver?: ParticipantProfile;
}

// Safe profile extraction helper
const extractProfile = (profile: any): ParticipantProfile | undefined => {
  if (!profile) return undefined;
  
  return {
    id: profile.id || '',
    display_name: profile.display_name || profile.name || '',
    avatar: profile.avatar || null,
    email: profile.email || '',
    role: profile.role || '',
    name: profile.display_name || profile.name || ''
  };
};

// Fetch conversations for a user
export const getConversations = async (userId: string): Promise<ConversationData[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:participant1_id(id, display_name, avatar, email, role),
        participant2:participant2_id(id, display_name, avatar, email, role)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    const formattedConversations: ConversationData[] = data.map((conversation: any) => {
      // Safely extract participant profiles
      const participant1 = extractProfile(conversation.participant1);
      const participant2 = extractProfile(conversation.participant2);
      
      // Determine the other participant profile (not the current user)
      const otherParticipant = conversation.participant1_id === userId 
        ? participant2
        : participant1;

      return {
        ...conversation,
        participant1,
        participant2,
        otherParticipant
      };
    });

    return formattedConversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    toast.error('Failed to load conversations');
    return [];
  }
};

// Get user conversations for ConversationList
export const getUserConversations = async (userId: string): Promise<any[]> => {
  return getConversations(userId);
};

// Get a specific conversation by ID
export const getConversationById = async (conversationId: string): Promise<ConversationData | null> => {
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

    if (error) throw error;

    if (!data) return null;

    return {
      ...data,
      participant1: extractProfile(data.participant1),
      participant2: extractProfile(data.participant2)
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    toast.error('Failed to load conversation');
    return null;
  }
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId: string): Promise<MessageData[]> => {
  try {
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, display_name, avatar, email, role),
        receiver:receiver_id(id, display_name, avatar, email, role)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at');

    if (messagesError) throw messagesError;

    // Format messages with sender and receiver information
    return messagesData.map((message: any) => ({
      ...message,
      sender: extractProfile(message.sender),
      receiver: extractProfile(message.receiver)
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    toast.error('Failed to load messages');
    return [];
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    // Update messages where the current user is the recipient
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', userId)
      .eq('conversation_id', conversationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// Send a message in a conversation
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  conversationId: string,
  content: string
): Promise<MessageData | null> => {
  try {
    // Create unique ID for the message
    const messageId = uuidv4();
    
    // Insert the message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        id: messageId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        conversation_id: conversationId,
        read: false
      })
      .select()
      .single();
    
    if (messageError) throw messageError;
    
    // Update the conversation's last_message_at
    const { error: conversationError } = await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    if (conversationError) throw conversationError;
    
    return messageData as MessageData;
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Failed to send message');
    return null;
  }
};

// Create a new conversation between two users
export const createConversation = async (
  participant1Id: string,
  participant2Id: string
): Promise<string | null> => {
  try {
    // Check if conversation already exists
    const { data: existingConvo, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${participant1Id},participant2_id.eq.${participant2Id}),and(participant1_id.eq.${participant2Id},participant2_id.eq.${participant1Id})`)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // Return existing conversation if found
    if (existingConvo) {
      return existingConvo.id;
    }
    
    // Create a new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant1_id: participant1Id,
        participant2_id: participant2Id
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

// Create a supplier conversation (from user to fournisseur)
export const createSupplierConversation = async (
  userId: string,
  supplierId: string
): Promise<string | null> => {
  try {
    // Get supplier user_id
    const { data: supplierData, error: supplierError } = await supabase
      .from('suppliers')
      .select('user_id')
      .eq('id', supplierId)
      .maybeSingle();
    
    if (supplierError) throw supplierError;
    if (!supplierData || !supplierData.user_id) {
      throw new Error('Supplier user ID not found');
    }
    
    // Create conversation
    return createConversation(userId, supplierData.user_id);
  } catch (error) {
    console.error('Error creating supplier conversation:', error);
    toast.error('Failed to create conversation with supplier');
    return null;
  }
};

// Toggle favorite status for a supplier
export const toggleFavoriteFournisseur = async (
  userId: string,
  supplierId: string
): Promise<{ isFavorite: boolean } | false> => {
  try {
    // Check if already a favorite
    const isFav = await isFournisseurFavorite(userId, supplierId);
    
    if (isFav) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorite_suppliers')
        .delete()
        .eq('user_id', userId)
        .eq('supplier_id', supplierId);
        
      if (error) throw error;
      return { isFavorite: false };
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorite_suppliers')
        .insert({
          user_id: userId,
          supplier_id: supplierId
        });
        
      if (error) throw error;
      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    toast.error('Failed to update favorite status');
    return false;
  }
};

// Check if a supplier is in user's favorites
export const isFournisseurFavorite = async (
  userId: string,
  supplierId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('favorite_suppliers')
      .select()
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .maybeSingle();
      
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Get user's favorite suppliers
export const getFavoriteFournisseurs = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_favorite_suppliers', { p_user_id: userId });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching favorite suppliers:', error);
    toast.error('Failed to load favorite suppliers');
    return [];
  }
};
