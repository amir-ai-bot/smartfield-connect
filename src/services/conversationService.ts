
import { supabase } from '@/integrations/supabase/client';
import { Message, Conversation, Rating } from '@/types/supabase';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Get all conversations for a user
export const getUserConversations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user:user_id (id, name, email, avatar, role),
        fournisseur:fournisseur_id (id, name, email, avatar, role)
      `)
      .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    toast.error('Erreur lors du chargement des conversations');
    return [];
  }
};

// Get a specific conversation
export const getConversation = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user:user_id (id, name, email, avatar, role),
        fournisseur:fournisseur_id (id, name, email, avatar, role)
      `)
      .eq('id', conversationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Erreur lors du chargement de la conversation');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getConversation:', error);
    toast.error('Erreur lors du chargement de la conversation');
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
        profiles:sender_id (name, avatar),
        media:message_id (id, media_type, media_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erreur lors du chargement des messages');
      return [];
    }

    // Make sure we return an array even if data is null
    return data || [];
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    toast.error('Erreur lors du chargement des messages');
    return [];
  }
};

// Add an alias for getConversationMessages to maintain backward compatibility
export const getMessages = getConversationMessages;

// Send a message in a conversation
export const sendMessage = async (conversationId: string, content: string, senderId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
      throw error;
    }

    // Update the conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    toast.error('Erreur lors de l\'envoi du message');
    throw error;
  }
};

// Send a message with file attachments
export const sendMessageWithFiles = async (
  conversationId: string, 
  content: string, 
  senderId: string, 
  files: File[]
) => {
  try {
    // First send the message
    const message = await sendMessage(conversationId, content, senderId);
    
    // TODO: Handle file uploads and associate with message
    // This would involve uploading files to storage and storing references
    
    return message;
  } catch (error) {
    console.error('Error sending message with files:', error);
    toast.error('Erreur lors de l\'envoi du message avec des fichiers');
    throw error;
  }
};

// Send a voice message
export const sendVoiceMessage = async (conversationId: string, senderId: string, audioBlob: Blob) => {
  try {
    // Create a message for the voice
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: 'Message vocal',
        read: false
      })
      .select()
      .single();
    
    if (messageError) {
      console.error('Error sending voice message:', messageError);
      toast.error('Erreur lors de l\'envoi du message vocal');
      throw messageError;
    }
    
    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    // TODO: Handle uploading the audio blob to storage in a future implementation
    
    return message;
  } catch (error) {
    console.error('Error in sendVoiceMessage:', error);
    toast.error('Erreur lors de l\'envoi du message vocal');
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
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

// Get unread message count for a user
export const getUnreadMessageCount = async (userId: string) => {
  try {
    // Get all conversations for the user
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id')
      .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`);

    if (conversationsError) {
      console.error('Error fetching conversations for unread count:', conversationsError);
      return 0;
    }

    if (!conversations || conversations.length === 0) {
      return 0;
    }

    // Get count of unread messages across all conversations
    const conversationIds = conversations.map(conv => conv.id);
    const { count, error: countError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('read', false);

    if (countError) {
      console.error('Error counting unread messages:', countError);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadMessageCount:', error);
    return 0;
  }
};

// Create a new conversation
export const createConversation = async (userId: string, fournisseurId: string) => {
  try {
    // Validate the UUIDs before proceeding
    if (!userId || typeof userId !== 'string' || userId.length < 36) {
      console.error('Invalid user ID provided:', userId);
      throw new Error('ID utilisateur invalide');
    }
    
    if (!fournisseurId || typeof fournisseurId !== 'string' || fournisseurId.length < 36) {
      console.error('Invalid fournisseur ID provided:', fournisseurId);
      throw new Error('ID fournisseur invalide');
    }
    
    // Check if conversation already exists
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user_id.eq.${userId},fournisseur_id.eq.${fournisseurId}),and(user_id.eq.${fournisseurId},fournisseur_id.eq.${userId})`)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing conversation:', checkError);
      throw new Error('Erreur lors de la vérification des conversations existantes');
    }
      
    if (existingConversation) {
      return existingConversation.id;
    }
    
    // Create a new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        fournisseur_id: fournisseurId
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Erreur lors de la création de la conversation');
    }
    
    return data.id;
  } catch (error: any) {
    console.error('Error in createConversation:', error);
    throw error;
  }
};

// Rate a fournisseur
export const rateFournisseur = async (userId: string, fournisseurId: string, rating: number, comment?: string) => {
  try {
    // Check if rating already exists
    const { data: existingRatings, error: checkError } = await supabase
      .from('fournisseur_ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('fournisseur_id', fournisseurId);

    if (checkError) {
      console.error('Error checking existing ratings:', checkError);
      throw new Error(checkError.message);
    }

    let data;
    if (existingRatings && existingRatings.length > 0) {
      // Update existing rating
      const { data: updatedRating, error } = await supabase
        .from('fournisseur_ratings')
        .update({ rating, comment })
        .eq('id', existingRatings[0].id)
        .select()
        .single();

      if (error) {
        console.error('Error updating rating:', error);
        throw new Error(error.message);
      }
      data = updatedRating;
    } else {
      // Create new rating
      const { data: newRating, error } = await supabase
        .from('fournisseur_ratings')
        .insert({
          user_id: userId,
          fournisseur_id: fournisseurId,
          rating,
          comment
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating new rating:', error);
        throw new Error(error.message);
      }
      data = newRating;
    }

    return data;
  } catch (error) {
    console.error('Error in rateFournisseur:', error);
    toast.error('Erreur lors de l\'évaluation du fournisseur');
    throw error;
  }
};

// Get ratings for a fournisseur
export const getFournisseurRatings = async (fournisseurId: string): Promise<Rating[]> => {
  try {
    // Use the RPC function that's already defined in the database
    const { data, error } = await supabase
      .rpc('get_fournisseur_ratings', { fournisseur_id: fournisseurId });
    
    if (error) {
      console.error('Error fetching fournisseur ratings:', error);
      toast.error('Error fetching ratings');
      return [];
    }
    
    // Safely transform the data with proper type checking
    const ratings: Rating[] = (data || []).map((rating: any) => {
      // Safely extract profile data, handling all possible formats
      const profilesData = rating.profiles && typeof rating.profiles === 'object' ? rating.profiles : {};
      
      return {
        id: String(rating.id || ''),
        rating: typeof rating.rating === 'number' ? rating.rating : 0,
        comment: rating.comment?.toString() || '',
        created_at: rating.created_at?.toString() || '',
        profiles: {
          id: String(profilesData.id || ''),
          name: String(profilesData.name || 'Anonymous'),
          avatar: String(profilesData.avatar || '')
        }
      };
    });
    
    return ratings;
  } catch (error) {
    console.error('Error in getFournisseurRatings:', error);
    toast.error('Failed to load ratings');
    return [];
  }
};

// Get average rating for a fournisseur
export const getFournisseurAverageRating = async (fournisseurId: string) => {
  try {
    const { data, error } = await supabase
      .from('fournisseur_ratings')
      .select('rating')
      .eq('fournisseur_id', fournisseurId);

    if (error) {
      console.error('Error fetching ratings for average:', error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return {
      average: sum / data.length,
      count: data.length
    };
  } catch (error) {
    console.error('Error in getFournisseurAverageRating:', error);
    return { average: 0, count: 0 };
  }
};

// Toggle favorite status for a fournisseur
export const toggleFavoriteFournisseur = async (userId: string, fournisseurId: string) => {
  try {
    // In a real implementation, this would interact with a favorites table
    // For now, we'll return a mock response
    const isFavorite = await isFournisseurFavorite(userId, fournisseurId);
    
    // Toggle the favorite status
    if (isFavorite) {
      // Remove from favorites (mock implementation)
      // await supabase.from('favorites').delete().eq('user_id', userId).eq('fournisseur_id', fournisseurId);
      return { success: true, isFavorite: false };
    } else {
      // Add to favorites (mock implementation)
      // await supabase.from('favorites').insert({ user_id: userId, fournisseur_id: fournisseurId });
      return { success: true, isFavorite: true };
    }
  } catch (error) {
    console.error('Error in toggleFavoriteFournisseur:', error);
    toast.error('Erreur lors de la mise à jour des favoris');
    throw error;
  }
};

// Check if a fournisseur is in a user's favorites
export const isFournisseurFavorite = async (userId: string, fournisseurId: string) => {
  try {
    // In a real implementation, this would check a favorites table
    // For now, return a mock response
    return Math.random() > 0.5; // Randomly return true or false for mock purposes
  } catch (error) {
    console.error('Error in isFournisseurFavorite:', error);
    return false;
  }
};

// Get all favorite fournisseurs for a user
export const getFavoriteFournisseurs = async (userId: string) => {
  try {
    // In a real implementation, this would fetch from a favorites table
    // For now, return mock data
    return [
      {
        id: '1',
        name: 'Agricole Supplies',
        tags: ['Seeds', 'Fertilizers'],
        address: 'Tunis, Tunisia',
        phone_number: '+216 71 123 456',
        email: 'contact@agricolesupplies.com',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
      },
      {
        id: '2',
        name: 'Ferme Moderne',
        tags: ['Machinery', 'Equipment'],
        address: 'Sousse, Tunisia',
        phone_number: '+216 73 789 012',
        email: 'info@fermemoderne.com',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
      }
    ];
  } catch (error) {
    console.error('Error in getFavoriteFournisseurs:', error);
    toast.error('Erreur lors du chargement des fournisseurs favoris');
    throw error;
  }
};
