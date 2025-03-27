
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Function to create a new conversation with a fournisseur
export const createConversation = async (userId: string, fournisseurId: string): Promise<string> => {
  try {
    // First check if a conversation already exists
    const { data: existingConv, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('fournisseur_id', fournisseurId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing conversation:', checkError);
      throw new Error(checkError.message);
    }

    if (existingConv) {
      return existingConv.id;
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        fournisseur_id: fournisseurId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw new Error(error.message);
    }

    return data.id;
  } catch (error: any) {
    console.error('Error in createConversation:', error);
    toast.error('Impossible de créer la conversation: ' + error.message);
    throw error;
  }
};

// Function to send a message in a conversation
export const sendMessage = async (conversationId: string, senderId: string, content: string, mediaFiles?: File[]): Promise<void> => {
  try {
    // First insert the message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content
      })
      .select('id')
      .single();

    if (messageError) {
      throw new Error(messageError.message);
    }
    
    // If there are media files, upload them
    if (mediaFiles && mediaFiles.length > 0 && messageData) {
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${conversationId}/${messageData.id}/${Date.now()}.${fileExt}`;
        
        // Upload file to storage
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('conversation-media')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('Error uploading media:', uploadError);
          continue; // Continue with other files if one fails
        }
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('conversation-media')
          .getPublicUrl(filePath);
          
        // Save media info to the conversation_media table
        await supabase
          .from('conversation_media')
          .insert({
            message_id: messageData.id,
            media_type: file.type,
            media_url: urlData.publicUrl
          });
      }
    }
  
    // Update conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  } catch (error: any) {
    console.error('Error in sendMessage:', error);
    toast.error('Erreur lors de l\'envoi du message');
    throw error;
  }
};

// Function to record and send voice message
export const sendVoiceMessage = async (conversationId: string, senderId: string, audioBlob: Blob): Promise<void> => {
  try {
    // Create a file from the blob
    const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: audioBlob.type });
    
    // First insert a placeholder message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: '🎤 Message vocal'
      })
      .select('id')
      .single();

    if (messageError) {
      throw new Error(messageError.message);
    }
    
    if (messageData) {
      const filePath = `${conversationId}/${messageData.id}/voice-${Date.now()}.webm`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('conversation-media')
        .upload(filePath, file);
        
      if (uploadError) {
        throw new Error(uploadError.message);
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('conversation-media')
        .getPublicUrl(filePath);
        
      // Save media info to the conversation_media table
      await supabase
        .from('conversation_media')
        .insert({
          message_id: messageData.id,
          media_type: 'audio/webm',
          media_url: urlData.publicUrl
        });
    }
  
    // Update conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  } catch (error) {
    console.error('Error sending voice message:', error);
    toast.error('Erreur lors de l\'envoi du message vocal');
    throw error;
  }
};

// Function to get messages from a conversation
export const getMessages = async (conversationId: string) => {
  try {
    // First get all messages
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        read,
        sender_id,
        profiles:sender_id (name, avatar)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw new Error(messagesError.message);
    }

    // Next get all media for these messages
    const messageIds = messagesData?.map(m => m.id) || [];
    if (messageIds.length > 0) {
      const { data: mediaData, error: mediaError } = await supabase
        .from('conversation_media')
        .select('*')
        .in('message_id', messageIds);

      if (mediaError) {
        console.error('Error fetching media:', mediaError);
      }
      
      // Attach media to messages
      if (mediaData) {
        const mediaByMessageId = mediaData.reduce((acc, media) => {
          acc[media.message_id] = acc[media.message_id] || [];
          acc[media.message_id].push(media);
          return acc;
        }, {});
        
        messagesData.forEach(message => {
          message.media = mediaByMessageId[message.id] || [];
        });
      }
    }

    return messagesData || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    toast.error('Erreur lors du chargement des messages');
    throw error;
  }
};

// Function to get user conversations
export const getUserConversations = async (userId: string) => {
  try {
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        updated_at,
        user_id,
        fournisseur_id,
        user:user_id (name, avatar),
        fournisseur:fournisseur_id (name, avatar)
      `)
      .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (conversationsError) {
      throw new Error(conversationsError.message);
    }

    // Get unread counts for each conversation
    if (conversationsData) {
      const conversationIds = conversationsData.map(c => c.id);
      
      const { data: unreadCountsData, error: unreadError } = await supabase
        .from('messages')
        .select('conversation_id, count(*)', { count: 'exact' })
        .in('conversation_id', conversationIds)
        .neq('sender_id', userId)
        .eq('read', false)
        .group('conversation_id');
        
      if (unreadError) {
        console.error('Error getting unread counts:', unreadError);
      }
      
      // Map unread counts to conversations
      if (unreadCountsData) {
        const unreadCounts = unreadCountsData.reduce((acc, item) => {
          acc[item.conversation_id] = parseInt(item.count, 10);
          return acc;
        }, {});
        
        conversationsData.forEach(conv => {
          conv.unreadCount = unreadCounts[conv.id] || 0;
        });
      }
    }

    return conversationsData || [];
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    toast.error('Erreur lors du chargement des conversations');
    throw error;
  }
};

// Function to mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
  }
};

// Function to get unread message count
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`);
    
    if (!conversations || conversations.length === 0) {
      return 0;
    }
    
    const conversationIds = conversations.map(c => c.id);
    
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .neq('sender_id', userId)
      .eq('read', false)
      .in('conversation_id', conversationIds);

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
};

// Function to clear conversation history for a user
export const clearConversationHistory = async (conversationId: string, userId: string): Promise<void> => {
  try {
    // We don't actually delete messages, just mark them as cleared for this user
    const { error } = await supabase.rpc('clear_conversation_for_user', { 
      conversation_id: conversationId,
      user_id: userId
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    toast.success('Conversation effacée avec succès');
  } catch (error) {
    console.error('Error clearing conversation:', error);
    toast.error('Erreur lors de l\'effacement de la conversation');
    throw error;
  }
};

// Function to rate a fournisseur
export const rateFournisseur = async (
  userId: string, 
  fournisseurId: string, 
  rating: number, 
  comment?: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('fournisseur_ratings')
      .insert({
        user_id: userId,
        fournisseur_id: fournisseurId,
        rating,
        comment
      });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error rating fournisseur:', error);
    toast.error('Erreur lors de l\'évaluation');
    throw error;
  }
};

// Function to get fournisseur ratings
export const getFournisseurRatings = async (fournisseurId: string) => {
  try {
    const { data, error } = await supabase
      .from('fournisseur_ratings')
      .select('*')
      .eq('fournisseur_id', fournisseurId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error getting ratings:', error);
    toast.error('Erreur lors du chargement des évaluations');
    throw error;
  }
};

// Function to get average fournisseur rating
export const getFournisseurAverageRating = async (fournisseurId: string): Promise<number> => {
  try {
    const ratings = await getFournisseurRatings(fournisseurId);
    
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0);
    return sum / ratings.length;
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return 0;
  }
};
