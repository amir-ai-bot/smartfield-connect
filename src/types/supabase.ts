
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
