
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar?: string | null;
  phone_number?: string;
  address?: string;
  bio?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  display_name?: string;
  preferences: UserPreferences;
}

export interface ProjectData {
  id: string;
  title: string;
  name?: string;
  description?: string;
  status: 'planning' | 'active' | 'completed';
  user_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  image?: string;
  crop?: string;
  crop_type?: string;
  location?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  progress?: number;
  isPublic?: boolean;
  is_public?: boolean;
  user_name?: string;
  user_avatar?: string | null;
  creator_name?: string;
  creator_email?: string;
  creator_avatar?: string | null;
}

export interface Rating {
  id: string;
  user_id: string;
  fournisseur_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
  profiles?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface UserPreferences {
  language: string;
  notifications: {
    email: boolean;
    app: boolean;
  };
  theme: string;
}

export type UserRole = 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone_number?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailFormData {
  email?: string;
  token: string;
}
