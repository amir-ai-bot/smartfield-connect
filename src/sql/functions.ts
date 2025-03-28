
export const getMessageMediaFunction = `
CREATE OR REPLACE FUNCTION public.get_message_media(p_message_id UUID)
RETURNS TABLE (
  id UUID,
  message_id UUID,
  media_type TEXT,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT cm.id, cm.message_id, cm.media_type, cm.media_url, cm.created_at
  FROM public.conversation_media cm
  WHERE cm.message_id = p_message_id;
END;
$$;
`;

export const insertConversationMediaFunction = `
CREATE OR REPLACE FUNCTION public.insert_conversation_media(
  p_message_id UUID,
  p_media_type TEXT,
  p_media_url TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_media_id UUID;
BEGIN
  INSERT INTO public.conversation_media (
    message_id,
    media_type,
    media_url
  ) VALUES (
    p_message_id,
    p_media_type,
    p_media_url
  ) RETURNING id INTO v_media_id;
  
  RETURN v_media_id;
END;
$$;
`;

export const createMessageWithMediaFunction = `
CREATE OR REPLACE FUNCTION public.create_message_with_media(
  p_conversation_id UUID,
  p_content TEXT,
  p_sender_id UUID,
  p_media_type TEXT DEFAULT NULL,
  p_media_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id UUID;
BEGIN
  -- Insert the message
  INSERT INTO public.messages (
    conversation_id,
    content,
    sender_id,
    read
  ) VALUES (
    p_conversation_id,
    p_content,
    p_sender_id,
    false
  ) RETURNING id INTO v_message_id;
  
  -- If media information is provided, insert it
  IF p_media_type IS NOT NULL AND p_media_url IS NOT NULL THEN
    PERFORM public.insert_conversation_media(
      v_message_id,
      p_media_type,
      p_media_url
    );
  END IF;
  
  -- Update the conversation's updated_at timestamp
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = p_conversation_id;
  
  RETURN v_message_id;
END;
$$;
`;
