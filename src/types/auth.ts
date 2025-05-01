export interface UserPreferences {
  language: 'fr' | 'en' | 'ar';
  notifications: {
    email: boolean;
    app: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar?: string;
  phone_number?: string;
  email_verified: boolean;
  address?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  preferences?: UserPreferences;
}

export interface Profile {
  id: string;
  email?: string;
  display_name?: string;
  avatar?: string;
  role?: UserRole;
  phone_number?: string;
  address?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  preferences?: UserPreferences;
}

export type UserRole = 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur';

export interface AuthResponse {
  user: User | null;
  error: any;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  phone_number?: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
  code?: string;
}

export interface VerifyEmailFormData {
  code: string;
  email?: string;
}

export interface Rating {
  id: string;
  user_id: string;
  supplier_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}
