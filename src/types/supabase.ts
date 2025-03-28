
import { Database } from '@/integrations/supabase/types';

// Extend the Supabase types with our custom table
export interface ConversationMedia {
  id: string;
  message_id: string;
  media_type: string;
  media_url: string;
  created_at: string;
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
