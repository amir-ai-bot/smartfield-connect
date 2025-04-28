
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

// Define ProjectWithUser type that matches the projects_with_users view
export interface ProjectWithUser {
  id: string;
  user_id: string;
  title: string;
  crop: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  image: string;
  is_public: boolean;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
}
