
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ConversationMedia } from '@/types/supabase';

// Fetch user conversations
export const getUserConversations = async (userId: string, filterUnread = false) => {
  try {
    let query = supabase
      .from('conversations')
      .select(`
        *,
        user:user_id(id, name, email, avatar),
        fournisseur:fournisseur_id(id, name, email, avatar),
        messages!messages(id, content, created_at, read, sender_id)
      `)
      .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Format conversations for display
    const formattedConversations = await Promise.all(
      (data || []).map(async (conversation) => {
        // Get last message for each conversation
        const lastMessage = conversation.messages && conversation.messages.length > 0
          ? conversation.messages.sort((a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
          : null;
        
        // Count unread messages
        const unreadCount = conversation.messages
          ? conversation.messages.filter(
              (msg: any) => !msg.read && msg.sender_id !== userId
            ).length
          : 0;

        // Determine other participant
        const otherParticipant = 
          conversation.user_id === userId 
            ? conversation.fournisseur 
            : conversation.user;

        return {
          id: conversation.id,
          participant: otherParticipant,
          lastMessage: lastMessage ? lastMessage.content : 'Aucun message',
          lastMessageDate: lastMessage ? lastMessage.created_at : conversation.created_at,
          unreadCount
        };
      })
    );

    // Filter conversations with unread messages if required
    const result = filterUnread 
      ? formattedConversations.filter(conv => conv.unreadCount > 0)
      : formattedConversations;

    return result;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    toast.error('Erreur lors du chargement des conversations');
    throw error;
  }
};

// Get a single conversation
export const getConversation = async (conversationId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user:user_id(id, name, email, avatar),
        fournisseur:fournisseur_id(id, name, email, avatar)
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    
    return {
      ...data,
      otherParticipant: data.user_id === userId ? data.fournisseur : data.user
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    toast.error('Erreur lors du chargement de la conversation');
    throw error;
  }
};

// Send a message with optional media
export const sendMessage = async (
  conversationId: string, 
  content: string, 
  senderId: string,
  mediaFile?: File,
  mediaType?: 'image' | 'audio' | 'document'
) => {
  try {
    // Insert message first
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content,
        sender_id: senderId,
        read: false
      })
      .select()
      .single();

    if (messageError) throw new Error(messageError.message);

    // If there's a media file, upload it and create a media record
    if (mediaFile && mediaType) {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${conversationId}/${messageData.id}.${fileExt}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('conversation-media')
        .upload(fileName, mediaFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw new Error(uploadError.message);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('conversation-media')
        .getPublicUrl(fileName);
        
      // Insert media record using raw SQL query since we don't have types
      const { error: mediaError } = await supabase.rpc('insert_conversation_media', {
        p_message_id: messageData.id,
        p_media_type: mediaType,
        p_media_url: publicUrl
      });
      
      if (mediaError) throw new Error(mediaError.message);
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return messageData;
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Erreur lors de l\'envoi du message');
    throw error;
  }
};

// Send multiple files in a message
export const sendMessageWithFiles = async (
  conversationId: string,
  content: string,
  senderId: string,
  mediaFiles: File[]
) => {
  try {
    // Insert message first
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content,
        sender_id: senderId,
        read: false
      })
      .select()
      .single();

    if (messageError) throw new Error(messageError.message);

    // If there are media files, upload them and create media records
    if (mediaFiles && mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${conversationId}/${messageData.id}-${Date.now()}.${fileExt}`;
        
        // Determine media type
        let mediaType = 'document';
        if (file.type.startsWith('image/')) {
          mediaType = 'image';
        } else if (file.type.startsWith('audio/')) {
          mediaType = 'audio';
        }
        
        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('conversation-media')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) throw new Error(uploadError.message);
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('conversation-media')
          .getPublicUrl(fileName);
          
        // Insert media record
        const { error: mediaError } = await supabase.rpc('insert_conversation_media', {
          p_message_id: messageData.id,
          p_media_type: mediaType,
          p_media_url: publicUrl
        });
        
        if (mediaError) throw new Error(mediaError.message);
      }
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return messageData;
  } catch (error) {
    console.error('Error sending message with files:', error);
    toast.error('Erreur lors de l\'envoi du message');
    throw error;
  }
};

// Send a voice message
export const sendVoiceMessage = async (
  conversationId: string,
  senderId: string,
  audioBlob: Blob
) => {
  try {
    // Create a File from the Blob
    const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { 
      type: 'audio/webm',
      lastModified: Date.now()
    });
    
    // Use the sendMessage function to handle the rest
    return await sendMessage(
      conversationId,
      'Message vocal',
      senderId,
      audioFile,
      'audio'
    );
  } catch (error) {
    console.error('Error sending voice message:', error);
    toast.error('Erreur lors de l\'envoi du message vocal');
    throw error;
  }
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId: string, userId: string) => {
  try {
    // Mark all messages as read
    await markMessagesAsRead(conversationId, userId);
    
    // Fetch messages
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        read,
        sender_id,
        profiles:sender_id(name, avatar)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    
    // Fetch media for each message
    const messagesWithMedia = await Promise.all((data || []).map(async (message) => {
      const { data: mediaData } = await supabase.rpc('get_message_media', {
        p_message_id: message.id
      });
      
      return {
        ...message,
        media: mediaData || []
      };
    }));
    
    return messagesWithMedia || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    toast.error('Erreur lors du chargement des messages');
    throw error;
  }
};

// Alias for getConversationMessages to maintain backward compatibility
export const getMessages = getConversationMessages;

// Function to check for unread messages count
export const getUnreadMessageCount = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('read', false)
      .neq('sender_id', userId)
      .or(`conversation_id.in.(${
        supabase
          .from('conversations')
          .select('id')
          .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`)
          .toString()
      })`);

    if (error) throw new Error(error.message);
    
    return data?.length || 0;
  } catch (error) {
    console.error('Error checking unread messages:', error);
    return 0;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    // First get the conversation to check user permissions
    const { data: conversationData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError) throw new Error(convError.message);

    // Check if user is part of this conversation
    if (conversationData.user_id !== userId && conversationData.fournisseur_id !== userId) {
      throw new Error('Unauthorized');
    }

    // Update messages where user is not the sender
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);

    if (error) throw new Error(error.message);

    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

// Create a new conversation
export const createConversation = async (userId: string, fournisseurId: string) => {
  try {
    // Check if conversation already exists
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(user_id.eq.${userId},fournisseur_id.eq.${fournisseurId}),and(user_id.eq.${fournisseurId},fournisseur_id.eq.${userId})`)
      .maybeSingle();

    if (checkError) throw new Error(checkError.message);

    // If conversation exists, return it
    if (existingConversation) {
      return existingConversation;
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

    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    toast.error('Impossible de créer la conversation');
    throw error;
  }
};

// Rate a fournisseur
export const rateFournisseur = async (
  userId: string, 
  fournisseurId: string, 
  rating: number, 
  comment?: string
) => {
  try {
    const { data, error } = await supabase
      .from('fournisseur_ratings')
      .upsert(
        {
          user_id: userId,
          fournisseur_id: fournisseurId,
          rating,
          comment
        },
        { onConflict: 'user_id,fournisseur_id' }
      )
      .select();

    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    console.error('Error rating fournisseur:', error);
    toast.error('Erreur lors de l\'évaluation du fournisseur');
    throw error;
  }
};

// Get fournisseur ratings
export const getFournisseurRatings = async (fournisseurId: string) => {
  try {
    const { data, error } = await supabase
      .from('fournisseur_ratings')
      .select(`
        *,
        user:user_id(name, avatar)
      `)
      .eq('fournisseur_id', fournisseurId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data || [];
  } catch (error) {
    console.error('Error fetching fournisseur ratings:', error);
    return [];
  }
};

// Get fournisseur average rating
export const getFournisseurAverageRating = async (fournisseurId: string) => {
  try {
    const { data, error } = await supabase
      .from('fournisseur_ratings')
      .select('rating')
      .eq('fournisseur_id', fournisseurId);

    if (error) throw new Error(error.message);

    if (!data || data.length === 0) return 0;

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / data.length;
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return 0;
  }
};

// Add a fournisseur to favorites
export const toggleFavoriteFournisseur = async (userId: string, fournisseurId: string) => {
  try {
    // We'll use the tags array in the profile to store favorite fournisseurs
    // First get the current user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, tags')
      .eq('id', userId)
      .single();

    if (profileError) throw new Error(profileError.message);

    // Get current favorites or initialize empty array
    const favorites = profileData.tags || [];
    
    // Toggle the fournisseur in favorites
    let newFavorites;
    if (favorites.includes(fournisseurId)) {
      newFavorites = favorites.filter(id => id !== fournisseurId);
    } else {
      newFavorites = [...favorites, fournisseurId];
    }
    
    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ tags: newFavorites })
      .eq('id', userId);

    if (updateError) throw new Error(updateError.message);

    return { 
      isFavorite: newFavorites.includes(fournisseurId),
      favorites: newFavorites
    };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    toast.error('Erreur lors de la mise à jour des favoris');
    throw error;
  }
};

// Check if a fournisseur is in favorites
export const isFournisseurFavorite = async (userId: string, fournisseurId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('tags')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);

    return data.tags ? data.tags.includes(fournisseurId) : false;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Get user's favorite fournisseurs
export const getFavoriteFournisseurs = async (userId: string) => {
  try {
    // Get user's favorites
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('tags')
      .eq('id', userId)
      .single();

    if (userError) throw new Error(userError.message);

    const favoriteIds = userData.tags || [];
    
    if (favoriteIds.length === 0) {
      return [];
    }
    
    // Get fournisseur profiles
    const { data: fournisseurs, error: fournisseursError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', favoriteIds)
      .eq('role', 'fournisseur');

    if (fournisseursError) throw new Error(fournisseursError.message);

    return fournisseurs || [];
  } catch (error) {
    console.error('Error fetching favorite fournisseurs:', error);
    toast.error('Erreur lors du chargement des fournisseurs favoris');
    throw error;
  }
};
