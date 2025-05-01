
export interface Profile {
  id: string;
  display_name?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  role?: 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur';
  avatar?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  preferences?: {
    language?: 'fr' | 'en' | 'ar';
    notifications?: {
      email?: boolean;
      app?: boolean;
    };
    theme?: 'light' | 'dark' | 'system';
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur';
  avatar?: string;
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

export interface Supplier {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  location: string;
  phone: string;
  products: string[];
  rating?: number;
  avatar?: string;
  email?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectWithUser extends Project {
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at?: string;
  created_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MediaItem {
  id: string;
  message_id: string;
  media_type?: string;
  media_url: string;
  created_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read?: boolean;
  created_at?: string;
}

export interface Rating {
  id: string;
  user_id: string;
  fournisseur_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface VerificationCode {
  id: string;
  user_id: string;
  email: string;
  code: string;
  type: string;
  created_at: string;
  expires_at: string;
  used: boolean;
}
