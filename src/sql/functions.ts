
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
