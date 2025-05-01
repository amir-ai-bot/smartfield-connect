
export interface Profile {
  id: string;
  display_name?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  role?: 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur';
  user_id?: string;
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
  preferences?: {
    language?: 'fr' | 'en' | 'ar';
    notifications?: {
      email?: boolean;
      app?: boolean;
    };
    theme?: 'light' | 'dark' | 'system';
  };
}
