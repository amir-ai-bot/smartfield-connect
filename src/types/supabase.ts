
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  role?: 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur';
  phone_number?: string;
  address?: string;
  bio?: string;
  preferences?: {
    language?: 'fr' | 'en' | 'ar';
    notifications?: {
      email?: boolean;
      app?: boolean;
    };
    theme?: 'light' | 'dark' | 'system';
  };
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur';
  phone_number?: string;
  email_verified?: boolean;
  address?: string;
  bio?: string;
  preferences?: {
    language?: 'fr' | 'en' | 'ar';
    notifications?: {
      email?: boolean;
      app?: boolean;
    };
    theme?: 'light' | 'dark' | 'system';
  };
}

export interface Supplier {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  location: string;
  phone: string;
  products: string[];
  rating: number;  // Required for type safety
  avatar?: string;
  email?: string;  // Added email for supplier
  image?: string;  // Added image for supplier display
}

export interface Rating {
  id: string;
  user_id: string;
  fournisseur_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface MediaItem {
  id: string;
  message_id: string;
  media_type: 'image' | 'audio' | 'document';
  media_url: string;
  created_at: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
