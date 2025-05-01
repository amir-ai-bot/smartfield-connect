
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const getConversations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Fetch additional data for each conversation
    const conversationsWithDetails = await Promise.all(
      data.map(async (conversation) => {
        const otherParticipantId = conversation.participant1_id === userId
          ? conversation.participant2_id
          : conversation.participant1_id;

        // Get the profile of the other participant
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherParticipantId)
          .single();

        // Get the last message
        const { data: lastMessageData } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${conversation.participant1_id},sender_id.eq.${conversation.participant2_id}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get any supplier info if this is a conversation with a supplier
        let supplierData = null;
        if (profileData?.role === 'fournisseur') {
          const { data: supplier } = await supabase
            .from('suppliers')
            .select('*')
            .eq('user_id', otherParticipantId)
            .single();
          
          if (supplier) {
            supplierData = supplier;
          }
        }

        return {
          id: conversation.id,
          participant1_id: conversation.participant1_id,
          participant2_id: conversation.participant2_id,
          created_at: conversation.created_at,
          last_message_at: conversation.last_message_at,
          otherParticipant: profileData ? {
            id: profileData.id,
            name: profileData.display_name || 'Unknown',
            avatar: profileData.avatar,
            email: profileData.email,
            role: profileData.role
          } : { 
            id: otherParticipantId,
            name: 'Unknown User',
            avatar: null,
            email: null,
            role: 'user'
          },
          lastMessage: lastMessageData ? {
            id: lastMessageData.id,
            content: lastMessageData.content,
            created_at: lastMessageData.created_at,
            sender_id: lastMessageData.sender_id
          } : null,
          supplier: supplierData
        };
      })
    );

    return conversationsWithDetails;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

export const getMessagesForConversation = async (conversationId: string) => {
  try {
    // First, get the conversation to ensure it exists and get participants
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (conversationError) throw conversationError;

    // Now get all messages for this conversation
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${conversation.participant1_id},sender_id.eq.${conversation.participant2_id}`)
      .or(`receiver_id.eq.${conversation.participant1_id},receiver_id.eq.${conversation.participant2_id}`)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    return {
      conversation: {
        id: conversation.id,
        participant1_id: conversation.participant1_id,
        participant2_id: conversation.participant2_id,
        created_at: conversation.created_at,
        last_message_at: conversation.last_message_at,
      },
      messages: messages || []
    };
  } catch (error) {
    console.error('Error fetching messages for conversation:', error);
    return { conversation: null, messages: [] };
  }
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string
) => {
  try {
    // Create the new message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Update the conversation's last_message_at
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (updateError) throw updateError;

    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Erreur lors de l\'envoi du message');
    return null;
  }
};

export const rateFournisseur = async (
  userId: string,
  fournisseurId: string,
  rating: number,
  comment?: string
) => {
  try {
    // Get current supplier rating
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('rating')
      .eq('id', fournisseurId)
      .single();

    if (supplierError) throw supplierError;

    // Update supplier rating - in a real app, we would calculate average
    const newRating = supplier.rating ? (supplier.rating + rating) / 2 : rating;
    
    // Update the supplier's rating
    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ rating: newRating })
      .eq('id', fournisseurId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error('Error rating fournisseur:', error);
    toast.error('Erreur lors de l\'évaluation du fournisseur');
    return false;
  }
};
