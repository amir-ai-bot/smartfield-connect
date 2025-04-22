
// Media item type for messages
export interface MediaItem {
  id: string;
  message_id: string;
  media_type: "image" | "document" | "audio";
  media_url: string;
  created_at: string;
}

// User profile type
export interface Profile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur';
  phone_number?: string;
  email_verified?: boolean;
  address?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  preferences?: {
    language?: 'fr' | 'en' | 'ar';
    notifications?: {
      email?: boolean;
      app?: boolean;
    };
    theme?: 'light' | 'dark' | 'system';
  };
}

// User type
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

// Supplier type
export interface Supplier {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  location: string;
  phone: string;
  products: string[];
  rating: number;
  avatar?: string;
  email?: string;
  image?: string;
}

// Add any additional Supabase types you need here
